# Gmail Email Setup Guide

## Quick Setup (2 minutes)

### Step 1: Get Gmail App Password

1. **Go to your Google Account:**
   - Visit: https://myaccount.google.com/
   - Sign in with: mohamedarshad1507@gmail.com

2. **Enable 2-Step Verification** (if not already enabled):
   - Go to Security → 2-Step Verification
   - Follow the prompts to enable it

3. **Create App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Or: Security → 2-Step Verification → App passwords
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Enter name: "Portfolio Website"
   - Click "Generate"
   - **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 2: Create Environment File

1. **Create `.env.local` file** in your project root:

```bash
# .env.local (in the project root)

GMAIL_USER=mohamedarshad1507@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password_here
```

2. **Replace** `your_16_character_app_password_here` with the password you copied (remove spaces)

Example:
```
GMAIL_USER=mohamedarshad1507@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

### Step 3: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 4: Add the Same Variables on Vercel

For the live site, add `GMAIL_USER` and `GMAIL_APP_PASSWORD` in your Vercel project under
**Settings → Environment Variables**, then redeploy.

### Step 5: Test!

1. Open http://localhost:3000
2. Click Mail app
3. Fill out the form
4. Click "Send Message"
5. Check your Gmail inbox!

---

## ✅ What Happens When Someone Sends a Message

### 1. You Receive:
- **Beautiful HTML email** with all the details
- **Subject:** "New Contact from Portfolio - [Their Name]"
- **Reply-To:** Set to sender's email (just hit reply!)
- **Content:** Name, Email, Subject, Message

### 2. They Receive (Auto-Reply):
- **Professional confirmation email**
- **Subject:** "Thank you for contacting Mohamed Arshad"
- **Content:**
  - Thank you message
  - Your contact details
  - Expected response time (24-48 hours)

---

## 🎨 Email Templates

Both emails use beautiful HTML templates with:
- ✅ Gradient headers
- ✅ Professional formatting
- ✅ Responsive design
- ✅ Your branding colors

---

## 🔒 Security

- ✅ App Password (not your real Gmail password)
- ✅ Environment variables (not in code)
- ✅ `.env.local` is gitignored (won't be committed)
- ✅ Can revoke app password anytime
- ✅ All user input is HTML-escaped before it goes into an email
- ✅ The auto-reply never echoes the visitor's message, so the form can't be used to send spam to other people
- ✅ Input validation, length limits, a hidden honeypot field and basic rate limiting (5 messages / 10 min per IP)

---

## 🚨 Troubleshooting

### "The contact form is temporarily unavailable"
- `GMAIL_USER` / `GMAIL_APP_PASSWORD` are missing — check `.env.local` (or the Vercel environment variables)

### "Failed to send email"
- Check if `.env.local` file exists
- Verify Gmail credentials are correct
- Make sure 2-Step Verification is enabled
- Restart the dev server

### "Invalid login"
- App password might be wrong
- Remove spaces from app password
- Generate a new app password

### "Not receiving emails"
- Check spam folder
- Verify GMAIL_USER is correct
- Test with a different email address

---

## 📝 .gitignore Check

Make sure `.env.local` is in your `.gitignore`:

```
# .gitignore
.env.local
.env*.local
```

This prevents your Gmail password from being committed to Git!

---

## 🎯 Quick Test Command

After setup, test if it works:

```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"you@example.com","subject":"Hello","message":"Testing the form"}'
```

Server-side errors are logged in the terminal running `npm run dev` (or in Vercel's function logs).

---

**That's it! Your contact form now sends real emails with auto-reply!** 🎉
