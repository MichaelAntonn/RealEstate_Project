@component('mail::message')
# Hi {{ $notifiable->user ?? 'there' }} 👋

We received a request to reset your password for your Real Estate account.

@component('mail::button', ['url' => $resetUrl])
Reset Your Password
@endcomponent

This link will expire in 30 minutes.  
If you did not request a password reset, no action is needed.

Thanks,  
**Real Estate Team** 🚀
@endcomponent
