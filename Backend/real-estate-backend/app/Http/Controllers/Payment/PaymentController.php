<?php

namespace App\Http\Controllers\Payment;

use App\Constants\UserType;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Models\Subscription;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function createCheckoutSession(Request $request)
    {
        $request->validate([
            'subscription_id' => 'required|exists:subscriptions,id',
            'return_url' => 'required|url',
        ]);

        $subscription = Subscription::with('user')->findOrFail($request->subscription_id);

        // // Ensure the current user is the company owner
        // if ($request->user()->id !== $subscription->company->user_id) {
        //     return response()->json(['error' => 'Unauthorized'], 403);
        // }

        Stripe::setApiKey(config('services.stripe.secret'));

        try {
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'egp',
                        'product_data' => [
                            'name' => $subscription->plan_name,
                        ],
                        'unit_amount' => $subscription->price * 100,
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => $request->return_url . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => url('/payment/cancel'),
                'client_reference_id' => $subscription->id,
                'metadata' => [
                    'subscription_id' => $subscription->id,
                    'user_id' => $subscription->user_id,
                ],
            ]);

            Payment::create([
                'subscription_id' => $subscription->id,
                'amount' => $subscription->price,
                'payment_method' => 'stripe',
                'payment_reference' => $session->payment_intent ?? $session->id,
                'status' => 'pending',
            ]);

            Log::info('Checkout session created', [
                'user_id' => $request->user()->id,
                'subscription_id' => $subscription->id,
                'session_id' => $session->id
            ]);

            return response()->json(['url' => $session->url]);
        } catch (\Exception $e) {
            Log::error('Failed to create checkout session', [
                'error' => $e->getMessage(),
                'subscription_id' => $request->subscription_id
            ]);

            return response()->json([
                'error' => 'Unable to create payment session. Please try again later.'
            ], 500);
        }
    }

    public function Payments(Request $request)
    {
        $this->authorizeAdmin($request);
        $payments = Payment::with('subscription')
            ->when($request->has('status'), function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->latest()
            ->paginate(10);

        return response()->json([
            'status' => true,
            'data' => $payments
        ]);
    }

    protected function authorizeAdmin(Request $request): void
    {
        if (!in_array($request->user()->user_type, [UserType::SUPER_ADMIN, UserType::ADMIN])) {
            abort(403, 'Forbidden. Only admins can perform this action.');
        }
    }
}
