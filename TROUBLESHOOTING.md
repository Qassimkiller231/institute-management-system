# 🛠 Troubleshooting & Configuration Guide

This document provides solutions to common issues and instructions for configuring specific system behaviors like Email and SMS notifications.

---

## 1. 🗄 Database Issues

### Migration Errors
If you encounter errors when running `npm run prisma:migrate` or if the database schema seems out of sync:

**Option A: Reset the Database (Data Loss)**
This is the cleanest way to fix schema mismatches during development.
1.  Navigate to the `backend` folder.
2.  Run the reset command:
    ```bash
    npm run prisma:migrate reset
    ```
    *This will drop the database, re-run migrations, and seed it with default data.*

**Option B: Manual Reset**
If the above fails:
1.  Delete the `backend/prisma/migrations` folder (if you want to start fresh).
2.  Drop the database manually in your PostgreSQL client (e.g., pgAdmin or command line).
3.  Create a new empty database with the same name.
4.  Run:
    ```bash
    npm run prisma:migrate
    ```

### Seed Data Fails
If `npm run seed` fails, it might be due to existing data conflicts.
-   Try running the **Database Reset** steps above first.
-   Ensure your `backend/.env` points to the correct database.

---

## 2. 📧 Email & SMS Configuration (Safe Mode)

By default, the system is in **Safe Mode** to prevent accidental emails/SMS being sent to real users during testing. All communications are redirected to specific test accounts.

### 🔴 How to Change or Disable Redirects

**1. Email Redirects**
Currently, all emails are redirected to a hardcoded test address.
-   **File**: `backend/src/services/email.service.ts`
-   **Look for**:
    ```typescript
    // SAFE MODE: Redirect all emails
    const originalTo = data.to;
    data.to = '...'; // <--- Change this email or remove these lines
    ```
-   **Action**:
    -   To **Change Recipient**: Update the string `'qassimahmed231@gmail.com'` to your desired testing email.
    -   To **Go Live (Send to actual users)**: Delete or comment out the lines under `// SAFE MODE`.

**2. SMS Redirects**
Currently, all SMS messages are redirected to a hardcoded test number.
-   **File**: `backend/src/services/sms.service.ts`
-   **Look for**:
    ```typescript
    // SAFE MODE: Redirect all SMS
    const originalTo = data.to;
    let phoneToUse = '...'; // <--- Change this number
    ```
-   **Action**:
    -   To **Change Recipient**: Update the number `'35140480'` to your test number.
    -   To **Go Live**: Delete or comment out the redirection logic to allow sending to the actual `data.to` number.

---

## 3. 🌐 Common Connection Issues

### Port Conflicts
-   **Frontend** runs on port `3000`.
-   **Backend** runs on port `3001`.
-   **Error**: `EADDRINUSE`
    -   **Fix**: Identify the process using the port and stop it.
    -   **Mac/Linux**: `lsof -i :3000` (then `kill -9 <PID>`)
    -   **Windows**: `netstat -ano | findstr :3000` (then `taskkill /PID <PID> /F`)

### Frontend Can't Connect to Backend
-   Check `frontend/.env.local`. It should have:
    ```
    NEXT_PUBLIC_API_URL=http://localhost:3001/api
    ```
-   Ensure the backend server is actually running and says `🚀 Server Started Successfully`.
