# Exam & Defense Preparation Guide
## Institute Management System (IMS)

This document contains a comprehensive list of potential questions and "A-grade" answers for your exam or project defense. It is divided into technical architecture, refactoring patterns, and database logic.

---

### Phase 1: Frontend Architecture & Refactoring

**Q1: Why did we refactor the components (Dashboard, Enrollments, etc.) to use "Render Functions"?**
> **Answer:** We implemented the **Modular Render Pattern** to solve the "Mega-Component" problem. In complex pages like the Admin Dashboard, the JSX can easily exceed 500 lines. Internalizing the UI into descriptive functions (like `renderHeader`, `renderStats`, `renderTable`) provides:
> - **Improved Readability:** The main `return` statement acts as a high-level "Table of Contents."
> - **Maintenance Efficiency:** If a specific part of the UI (like a table) needs a fix, you can jump directly to that function without wading through hundreds of lines of filters or headers.
> - **Scalability:** It keeps the logic related to specific UI sections encapsulated, making it easier to expand features later.

**Q2: Why use explicit `return` statements instead of implicit arrow returns?**
> **Answer:** Explicit returns (using `{ return (...) }`) are more robust. They allow us to add logic—such as `if` statements, calculations, or logging—*before* returning the JSX. Implicit returns are only suitable for trivial fragments. For professional, enterprise-grade development, explicit returns are the standard for maintainability.

---

### Phase 2: System Integration & API

**Q3: How does the Frontend communicate with the Backend?**
> **Answer:** We use a centralized **API Client Layer** (located in `frontend/lib/api/`). Instead of calling `fetch` directly in components, we use service objects (e.g., `attendanceAPI`). This approach centralizes:
> - **Environment Management:** Easily switching between local and production URLs.
> - **Security:** Automatically injecting Bearer Tokens into the headers for every request.
> - **Standardized Errors:** Ensuring that every API failure is caught and formatted consistently.

**Q4: How do you handle file uploads, specifically for Bulk Attendance?**
> **Answer:** We use a `multipart/form-data` request where the CSV file is wrapped in a standard JavaScript `FormData` object.
> 
> **The Technical Secret:** In our API client, we explicitly **delete** the `Content-Type` header before sending the request. 
> - **Why?** When using `FormData`, the browser must generate a unique "boundary" string to separate the file data from other fields. If we manually set `Content-Type: application/json` or even `multipart/form-data`, we "break" this process because the browser won't append that critical boundary string. By deleting the header, we allow the browser to automatically detect the `FormData` body and set the perfect header (e.g., `Content-Type: multipart/form-data; boundary=----...`).
> 
> **Where in the code?**
> 1. **Data Prep:** In [`bulk/page.tsx`](file:///Users/macbookairm3/Desktop/Uni/Final Project Stack/institute-management-system/frontend/app/admin/attendance/bulk/page.tsx#L51-52), we initialize `new FormData()` and append the file.
> 2. **Header Fix:** In [`attendance.ts`](file:///Users/macbookairm3/Desktop/Uni/Final Project Stack/institute-management-system/frontend/lib/api/attendance.ts#L127-129), we call `delete headers['Content-Type']` to trigger the browser's auto-configuration logic.

---

### Phase 3: Database & Logic

**Q5: Explain the Database Schema relationships.**
> **Answer:** Our schema (using Prisma) follows a strict hierarchy:
> - **Programs** have many **Terms**.
> - **Terms** have many **Groups**.
> - **Enrollments** act as the "bridge" between **Students** and **Groups**. This many-to-many relationship allows a student to have different statuses (Active, Completed, Dropped) for different classes simultaneously.

**Q6: How does the Audit Log system function?**
> **Answer:** Every critical operation (Create, Update, Delete) is intercepted on the backend. It records:
> - **Identity:** Which user performed the action.
> - **Action:** What exactly was done (e.g., `STUDENT_UPDATED`).
> - **Diffing:** It stores both "Old Values" and "New Values," providing a full historical trail for institutional accountability.

---

### Phase 4: Performance & Security

**Q7: How is Authentication secured?**
> **Answer:** We use **JWT (JSON Web Tokens)**. Upon a successful login (via Email or SMS), the server issues a token. The frontend stores this in `localStorage` and provides it in the `Authorization` header for all subsequent protected API calls.

**Q8: How do you handle data privacy during testing (Safe Mode)?**
> **Answer:** We implemented a "Safe Mode" in our communication services (Email/SMS). During development/testing, all outgoing messages are intercepted and redirected to a hardcoded admin contact rather than a real student. This prevents test notifications from being sent to actual users.

---

### Phase 5: Challenging Questions

**Q9: Why use `useState` instead of Redux or Recoil?**
> **Answer:** For an application of this scale, Next.js built-in state management is more efficient. Redux introduces significant boilerplate that can slow down development. By combining local state with a robust API layer, we keep the application "lightweight" and highly performant.

**Q10: How do you prevent duplicate enrollments?**
> **Answer:** Validation happens in two places:
> 1. **Frontend:** The enrollment modal filters out students who already have active enrollments in the selected group.
> 2. **Database:** We use unique constraints in PostgreSQL to ensure that a `studentId` and `groupId` pair can only exist once.

---
*Created for Exam Preparation - December 2025*
