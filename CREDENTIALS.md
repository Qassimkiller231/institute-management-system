# 🔐 Test Credentials

Use these credentials to log in and test the system. The system works with **One-Time Passwords (OTP)**.

## 👥 Default Users

When you run `npm run seed`, the following users are created:

### 1. Admin
-   **Email**: `admin@institute.com`
-   **Phone**: `97312345678`
-   **Role**: Full access to all modules.

### 2. Teacher
-   **Email**: `ahmed.hassan@institute.com`
-   **Phone**: `97366778899`
-   **Role**: Can view schedules, mark attendance, and manage assigned groups.

### 3. Student
-   **Email**: `omar.ali@email.com`
-   **Phone**: `97322334455`
-   **Role**: Can view class schedule, announcements, and profile.

### 4. Parent
-   **Email**: `ali.mohammed@email.com`
-   **Phone**: `97355443322`
-   **Role**: Can view linked student's progress and attendance.

---

## 🔑 How to Login

1.  Go to the login page (e.g., `http://localhost:3000/login`).
2.  Enter one of the emails above.
3.  Click **"Send OTP"**.
4.  **Find the OTP**:
    -   **Console Logs**: Check the terminal where the **Backend** is running. The OTP is usually logged there for development.
    -   **Email**: Check the "Redirect Email" configured in `TROUBLESHOOTING.md` (default: `qassimahmed231@gmail.com`).
5.  Enter the code to log in.
