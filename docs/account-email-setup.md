# MauCuan account email setup

The free website is https://maucuan-finance.vercel.app. It is usable as the Supabase Site URL, but its vercel.app hostname cannot serve as an owned sender domain. The domain purchase was deferred at the user's request. Account email delivery remains unconfigured.

For a future dedicated sender, use Resend with a domain owned by the operator. Verify the DNS records Resend supplies, then enter these in Supabase Authentication → Emails → SMTP Settings:

- Host: smtp.resend.com
- Port: 465
- Username: resend
- Password: the Resend API key, entered only in the hosted secret field
- Sender: a verified address on the owned domain
- Sender name: MauCuan

Do not put SMTP credentials or email provider keys in the mobile app, website, or repository. Keep email verification enabled. Test confirmation and password recovery with an address outside the Supabase organization before enabling public signup.

Supabase's Site URL is configured as https://maucuan-finance.vercel.app. These auth redirects are configured and verified in the dashboard:

- maucuan://auth/callback
- https://maucuan-finance.vercel.app/auth/callback

The HTTPS callback page forwards only auth callback fields to the installed native app after an explicit tap, removes callback fields from browser history, and has a no-referrer policy. Keep token-bearing URLs out of logs and analytics.

The native app also accepts email codes. Include `{{ .Token }}` in the confirmation and recovery templates if using this path. The templates should link with Supabase's `{{ .ConfirmationURL }}`; do not construct a substitute confirmation URL.

Reference: https://supabase.com/docs/guides/auth/auth-smtp and https://resend.com/docs/send-with-smtp.
