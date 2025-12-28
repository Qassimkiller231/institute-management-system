# Institute Management System

This guide outlines the steps to set up and run the Institute Management System locally by cloning the repository from GitHub.

## Prerequisites

Before starting, ensure you have the following installed:
1.  **Git** - [Download Here](https://git-scm.com/downloads)
2.  **Node.js** (v18 or higher recommended) - [Download Here](https://nodejs.org/)
3.  **PostgreSQL** (Database) - [Download Here](https://www.postgresql.org/download/)

---

## 🚀 Setup Guide

### 1. Clone the Repository
Open your terminal and run the following command to download the project:

```bash
git clone https://github.com/Qassimkiller231/institute-management-system.git
cd institute-management-system
```

### 2. Database Configuration
1.  Make sure your PostgreSQL server is running.
2.  Create a local database named `institute_management` (or any name you prefer).

### 3. Backend Setup
1.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  **Create Environment File**: Create a file named `.env` in the `backend` folder and paste the following configuration.
    *   **IMPORTANT**: Replace `YOUR_DB_PASSWORD` with your actual Postgres password.

    ```env
    # Server Configuration
    PORT=3001
    NODE_ENV=development

    # Database Connection (REQUIRED)
    # Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
    DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@localhost:5432/institute_management

    # Security (REQUIRED)
    JWT_SECRET=super_secret_jwt_key_for_local_dev_12345
    JWT_EXPIRES_IN=7d

    # Optional Features (Leave as is for local testing)
    NOTIFICATION_TEST_MODE=true
    NOTIFICATION_TEST_EMAIL=test@example.com
    NOTIFICATION_TEST_PHONE=12345678
    ```

3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Run database migrations:
    ```bash
    npm run prisma:migrate
    ```
5.  Seed the database with initial users:
    ```bash
    npm run seed
    ```
6.  Start the backend server:
    ```bash
    npm run dev
    ```

### 4. Frontend Setup
1.  Open a **new** terminal window and navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  **Create Environment File**: Create a file named `.env.local` in the `frontend` folder and paste the following:

    ```env
    NEXT_PUBLIC_API_URL=http://localhost:3001/api
    ```

3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
5.  Open your browser and visit **[http://localhost:3000](http://localhost:3000)**

---

## 📂 Project Structure

- **backend/**: API logic and Database Schema (`prisma/schema.prisma`).
- **frontend/**: Next.js User Interface.

## 📚 Additional Documentation
-   **[View Test Credentials](CREDENTIALS.md)** – Default logins for Admin, Teacher, Student, etc.
-   **[Troubleshooting & Configuration](TROUBLESHOOTING.md)** – Fix DB issues and configure Email/SMS redirection.

## 🛠 Required Environment Variables
If you are deploying or need full functionality, here is the list of variables you need to configure:

### Backend (.env)
*   `DATABASE_URL` (Required): Connection string to PostgreSQL.
*   `JWT_SECRET` (Required): Secret key for signing tokens.
*   `STRIPE_SECRET_KEY` (Optional): Required only if testing payments.
*   `ANTHROPIC_API_KEY` (Optional): Required only for the AI Chatbot.
*   `SMTP_...` or `AWS_...` (Optional): Required for sending real emails (otherwise use `NOTIFICATION_TEST_MODE=true`).
*   `TWILIO_...` (Optional): Required for sending real SMS.

### Frontend (.env.local)
*   `NEXT_PUBLIC_API_URL` (Required): URL of the backend API.
*   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Optional): Required only if testing payments.
