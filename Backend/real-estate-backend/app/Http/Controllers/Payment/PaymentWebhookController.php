<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Payment;
use App\Notifications\PaymentCompleted;
use Illuminate\Support\Facades\Notification;
use Stripe\Stripe;
use Stripe\Webhook;

class PaymentWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->getContent();
$sigHeader = $request->header('Stripe-Signature');
$secret = config('services.stripe.webhook_secret');

try {
    $event = \Stripe\Webhook::constructEvent(
        $payload, $sigHeader, $secret
    );
} catch (\Stripe\Exception\SignatureVerificationException $e) {
    Log::error('Stripe webhook signature verification failed', ['error' => $e->getMessage()]);
    return response('Invalid signature', 400);
}


        Log::info('Stripe Webhook received', ['type' => $event->type]);

        switch ($event->type) {
            case 'checkout.session.completed':
                $session = $event->data->object;
                $this->markPaymentCompleted($session->id);
                break;

                case 'payment_intent.succeeded':
                    $intent = $event->data->object;

                    $payment = Payment::where('payment_reference', $intent->id)->first();

                    if ($payment && $payment->status !== 'completed') {
                        $payment->status = 'completed';
                        $payment->paid_at = now();
                        $payment->save();

                        Log::info("PaymentIntent succeeded and marked completed", ['id' => $payment->id]);
                    }
                    break;
                    case 'payment_intent.payment_failed':
                        $intent = $event->data->object;

                        $payment = Payment::where('payment_reference', $intent->id)->first();

                        if ($payment) {
                            $payment->status = 'failed';
                            $payment->save();

                            Log::warning("PaymentIntent failed", [
                                'id' => $payment->id,
                                'reason' => $intent->last_payment_error->message ?? 'Unknown',
                            ]);
                        }
                        break;


            default:
                Log::info("Unhandled Stripe event", ['type' => $event->type]);
        }

        return response('Webhook received', 200);
    }

    protected function markPaymentCompleted($sessionId)
    {
        $payment = Payment::where('payment_reference', $sessionId)->first();

    if ($payment && $payment->status !== 'completed') {
        $payment->status = 'completed';
        $payment->paid_at = now();
        $payment->save();

        $subscription = $payment->subscription;

        if ($subscription && $subscription->status === 'pending') {
            $startsAt = now();
            $endsAt = $startsAt->copy()->addDays($subscription->duration_in_days);

            $subscription->update([
                'status' => 'active',
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
            ]);

            Log::info("Subscription activated after payment", [
                'subscription_id' => $subscription->id
            ]);
        }

        // Notify the user
        $subscription = $payment->subscription;
        $user = $subscription ? $subscription->user : null;


        if ($user) {
            $user->notify(new PaymentCompleted($payment));
        }

        // Notify admins
        $admins = Admin::whereIn('user_type', ['admin', 'super-admin'])->get();
        if ($admins->isNotEmpty()) {
            Notification::send($admins, new PaymentCompleted($payment, true));
        }
        Log::info("Payment marked as completed", ['id' => $payment->id]);
    }
    }
}
