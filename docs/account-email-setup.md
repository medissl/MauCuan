# MauCuan account email setup

Updated 6 October 2026.

The operator saved Gmail SMTP in Supabase. Credentials are entered only in the hosted dashboard and are never committed or bundled in the app.

- Sender: mediantozeng@gmail.com
- Sender name: MauCuan
- Host: smtp.gmail.com
- Port: 465
- Username: mediantozeng@gmail.com
- Password: a Google App Password, entered privately by the operator

Confirmation subject: **Kode verifikasi MauCuan**. Recovery subject: **Kode pemulihan MauCuan**. Both saved templates display `{{ .Token }}` and instruct users to enter the code in the app. They have no confirmation-link button. Source copies live in `supabase/templates/confirmation.html` and `supabase/templates/recovery.html`. The app validates numeric codes, has resend cooldowns, and uses Supabase verifyOtp with email or recovery type.

The templates were checked in the dashboard source and preview. Inbox delivery and the complete real-device recovery flow remain to be verified after installing the updated APK. Do not disable email confirmation.

Gmail's personal SMTP warning means it is suited to small-scale testing, not a dependable transactional sender for public launch. The free Vercel hostname is a website address, not an owned email-sender domain. A later dedicated provider needs an owned domain and verified DNS records. No domain purchase was made.

Site URL: https://maucuan-finance.vercel.app
Allowed redirects: maucuan://auth/callback and https://maucuan-finance.vercel.app/auth/callback. Older link callbacks remain supported for compatibility.

References: https://supabase.com/docs/guides/auth/auth-smtp and https://supabase.com/docs/guides/auth/auth-email-templates
