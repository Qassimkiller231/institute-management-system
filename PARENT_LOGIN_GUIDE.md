# Parent Login Setup Guide

## Problem: Parent Created Without Email/Phone

When you create a parent **without an email or phone number**, they cannot log in because:

1. ✅ The backend creates a placeholder email (e.g., `parent-1733596800000@placeholder.local`)
2. ❌ **This email cannot receive OTP codes**
3. ❌ **The parent cannot log in**

## Solution: Add Real Credentials

### Step 1: Update the Parent's Email

1. Go to **Admin Panel** → **Parents**
2. Find the parent you created
3. Click **"Edit"**
4. Add a **real email address** (e.g., `john.smith@gmail.com`)
5. Click **"Update Parent"**

### Step 2: Parent Can Now Log In

Once the parent has a real email:

1. Parent goes to `/login`
2. Enters their email
3. Selects **"Email"** as login method
4. Clicks **"Request OTP"**
5. Receives a 6-digit code via email
6. Enters the code
7. Logs in successfully
8. Redirected to `/parent` dashboard

## Authentication Flow

The system uses **OTP (One-Time Password)** authentication:

```
User Action                Backend Action
─────────────────         ─────────────────
1. Enter email/phone  →   Check if user exists
2. Request OTP        →   Generate 6-digit code
                      →   Send via email/SMS
3. Enter OTP code     →   Verify code
4. Submit             →   Create JWT token
5. Logged in!         →   Redirect to dashboard
```

## Login Methods

### Email Login (Recommended)
- ✅ Parent must have a valid email
- ✅ Receives OTP code via email
- ✅ Works immediately after adding email

### Phone Login
- ✅ Parent must have a valid phone number
- ⚠️ Requires SMS service configuration
- ⚠️ May have additional costs

## Parent Dashboard Features

Once logged in, parents can access:

📊 **Dashboard** - Overview of children and stats
👶 **My Children** - View linked students
📢 **Announcements** - Institute news and updates
📚 **Materials** - Access learning resources  
💳 **Payments** - Pay fees and view history

## Best Practices

### When Creating Parents:

1. **Always ask for email or phone**
   - Email is preferred (free OTP delivery)
   - Phone requires SMS service setup

2. **Link students immediately**
   - Use the "Link Student" button
   - Select relationship (Father, Mother, Guardian)

3. **Inform parents of their credentials**
   - Share the email you registered
   - Explain OTP login process

### Placeholder Emails

If you must create a parent without real credentials:
- Backend generates: `parent-{timestamp}@placeholder.local`
- ⚠️ This is for **data entry only**
- 🔄 **Must update later** with real email

## Testing the Setup

1. Create a test parent with your email
2. Try logging in at `/login`
3. Request OTP
4. Check your email for the code
5. Verify it works before deploying

## Troubleshooting

### "User not found" error
- ✅ Check if email is correct
- ✅ Check if parent record exists in database
- ✅ Verify email matches exactly

### "OTP not received"
- ✅ Check spam/junk folder
- ✅ Verify SMTP settings in backend `.env`
- ✅ Check backend logs for email errors

### "Invalid OTP"
- ✅ OTP expires after 10 minutes
- ✅ Request new code if expired
- ✅ Check for typos in code entry

## Environment Setup

Make sure your backend has these environment variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@institute.com
```

## Quick Reference

| Action | Endpoint | Method |
|--------|----------|--------|
| Request OTP | `/api/auth/request-otp` | POST |
| Verify OTP | `/api/auth/verify-otp` | POST |
| Get User Info | `/api/auth/me` | GET |
| Logout | `/api/auth/logout` | POST |

## Next Steps

1. ✅ Created parent dashboard (`/parent`)
2. ✅ Added parent navigation
3. 🔄 Update existing parents with real emails
4. 🔄 Test login flow
5. 🔄 Add more parent features (attendance, progress reports)

---

**Need Help?**
- Check backend logs for errors
- Verify database has parent record
- Test with your own email first
