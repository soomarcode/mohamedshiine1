# 🚨 CRITICAL SUPABASE SETTINGS TO FIX "LINK" & "LOCALHOST" ERRORS

To make the app send a **6-digit Code** instead of a Link, and to fix the **localhost:3000** error, you must follow these steps in your Supabase Dashboard:

## 1. Fix "localhost:3000" Error (URL Configuration)
1. Go to your **Supabase Dashboard**.
2. Click **Authentication** (sidebar) -> **URL Configuration**.
3. Under **Site URL**, change `http://localhost:3000` to your actual Vercel domain:
   - Example: `https://your-app-name.vercel.app`
4. Click **Save**.

## 2. Force "Send Code" Instead of Link (Email Templates)
By default, Supabase sends a "Magic Link". You need to change the email template to send the **Code** only.

1. Go to **Authentication** -> **Email Templates**.
2. Click on **Magic Link** (this is used by the "Send Code" button).
3. **Change the Subject** to: `Your Login Code`
4. **Change the Body** to something simple like:
   ```html
   <h2>Login Code</h2>
   <p>Your login code is: <strong>{{ .Token }}</strong></p>
   ```
   *Note: Do NOT include `{{ .ConfirmationURL }}` or any links.*
5. Click **Save**.

## 3. (Optional) Testing
1. Go back to your app.
2. Enter your email and click "Send Code".
3. Check your email. It should now be a simple code (e.g., "123456").
4. Enter it in the app and click "Sign Up".
