# ✅ BACKEND TESTING CHECKLIST

**Test all endpoints before starting frontend**

## 🎯 MODULE STATUS

### 1. Authentication ✅
- [ ] POST /auth/request-otp (email)
- [ ] POST /auth/request-otp (sms)
- [ ] POST /auth/verify-otp
- [ ] POST /auth/logout
- [ ] GET /auth/verify-token

**Critical Tests:**
- [ ] Invalid OTP rejected
- [ ] Expired OTP rejected (5 min)
- [ ] 3 failed attempts lock
- [ ] Token works for protected routes

---

### 2. User Management ✅
- [ ] POST /users (create all roles)
- [ ] GET /users (pagination)
- [ ] GET /users/:id
- [ ] PUT /users/:id
- [ ] DELETE /users/:id (soft delete)

**Critical Tests:**
- [ ] Duplicate email rejected
- [ ] Duplicate phone rejected
- [ ] Role validation works
- [ ] Pagination works (50 records)

---

### 3. Programs & Academic ✅
- [ ] POST /programs
- [ ] POST /terms
- [ ] POST /levels
- [ ] POST /venues
- [ ] POST /halls
- [ ] POST /groups
- [ ] POST /class-sessions/generate

**Critical Tests:**
- [ ] Duplicate program code rejected
- [ ] Term dates validated (end > start)
- [ ] Hall capacity enforced
- [ ] Group capacity enforced
- [ ] Schedule conflicts detected

---

### 4. Students ✅
- [ ] POST /students
- [ ] GET /students (pagination + filters)
- [ ] GET /students/:id
- [ ] PUT /students/:id
- [ ] DELETE /students/:id
- [ ] GET /students/search

**Critical Tests:**
- [ ] Duplicate CPR rejected
- [ ] Age validation (DOB)
- [ ] Required fields enforced
- [ ] Search works

---

### 5. Teachers ✅
- [ ] POST /teachers
- [ ] GET /teachers
- [ ] GET /teachers/:id
- [ ] PUT /teachers/:id
- [ ] GET /teachers/me/groups

**Critical Tests:**
- [ ] Teacher can only see their groups
- [ ] Speaking test availability toggle
- [ ] Specialization update

---

### 6. Enrollment ✅
- [ ] POST /enrollments
- [ ] GET /enrollments
- [ ] GET /enrollments/:id
- [ ] PUT /enrollments/:id/withdraw
- [ ] GET /students/:id/enrollments

**Critical Tests:**
- [ ] Duplicate enrollment rejected
- [ ] Group capacity checked
- [ ] Status transitions valid
- [ ] Withdrawal with date/reason

---

### 7. Attendance ✅
- [ ] POST /attendance (single)
- [ ] POST /attendance/bulk
- [ ] POST /attendance/upload-csv
- [ ] GET /attendance?classSessionId=...
- [ ] GET /students/:id/attendance
- [ ] GET /analytics/attendance

**Critical Tests:**
- [ ] Duplicate attendance rejected
- [ ] Status enum validated (P/A/L/E)
- [ ] Percentage auto-calculated
- [ ] Warnings triggered (<75%)
- [ ] CSV upload works (500 records)
- [ ] Teacher can only mark own classes

---

### 8. Materials ✅
- [ ] POST /materials
- [ ] GET /materials?groupId=...
- [ ] GET /materials/:id
- [ ] DELETE /materials/:id
- [ ] GET /students/me/materials

**Critical Tests:**
- [ ] Teacher can only upload to own groups
- [ ] Student can only view own group materials
- [ ] File type validation
- [ ] Material type enum validated

---

### 9. Payments ✅
- [ ] POST /payments/plans
- [ ] POST /payments/installments/:id/pay
- [ ] GET /payments/plans/:enrollmentId
- [ ] GET /installments/:id
- [ ] GET /installments/:id/receipt
- [ ] POST /payments/refund

**Critical Tests:**
- [ ] Balance calculation correct
- [ ] Installments generated correctly (1-4)
- [ ] Payment method enum validated
- [ ] Receipt numbers unique
- [ ] Overdue status calculated
- [ ] Refund <= paid amount
- [ ] Benefit reference unique

---

### 10. Testing System ✅
- [ ] POST /tests (create test)
- [ ] POST /tests/sessions/start
- [ ] GET /tests/sessions/:id/questions
- [ ] POST /tests/sessions/:id/submit-mcq
- [ ] POST /speaking-slots
- [ ] POST /tests/sessions/:id/book-speaking
- [ ] PUT /tests/sessions/:id/speaking-results
- [ ] PUT /tests/sessions/:id/assign-level

**Critical Tests:**
- [ ] Guest can start test (no auth)
- [ ] Score calculation correct
- [ ] Speaking slot not double-booked
- [ ] Final level assigned correctly
- [ ] Test type enum validated

---

### 11. Analytics & Reports ✅
- [ ] GET /analytics/dashboard
- [ ] GET /analytics/programs/:id
- [ ] GET /analytics/attendance
- [ ] GET /analytics/financial
- [ ] GET /analytics/attendance/export

**Critical Tests:**
- [ ] Dashboard shows real counts (not zeros)
- [ ] Date filters work
- [ ] Excel export generates file
- [ ] Financial calculations correct
- [ ] Attendance % matches manual calc

---

### 12. Announcements & Notifications ✅
- [ ] POST /announcements
- [ ] GET /announcements?groupId=...
- [ ] GET /notifications
- [ ] PUT /notifications/:id/read

**Critical Tests:**
- [ ] Target audience validated
- [ ] Scheduled announcements work
- [ ] Students see only their group announcements
- [ ] Notification types validated

---

## 🔥 CRITICAL WORKFLOWS

### Workflow A: New Student Journey
1. [ ] Admin creates student user
2. [ ] Admin creates student profile
3. [ ] Student takes placement test
4. [ ] Speaking test scheduled
5. [ ] Admin assigns level
6. [ ] Admin enrolls in group
7. [ ] Payment plan created
8. [ ] Student views dashboard
9. [ ] Student views materials
10. [ ] Teacher marks attendance

### Workflow B: Teacher Daily Work
1. [ ] Teacher logs in (OTP)
2. [ ] Views today's classes
3. [ ] Marks attendance (15 students)
4. [ ] Uploads material (PDF)
5. [ ] Creates announcement
6. [ ] Views attendance report
7. [ ] Exports to Excel

### Workflow C: Payment Processing
1. [ ] Admin creates payment plan (4 installments)
2. [ ] Records payment 1 (CASH)
3. [ ] Generates receipt
4. [ ] Student views payment status
5. [ ] Records payment 2 (BENEFIT_PAY)
6. [ ] System calculates balance
7. [ ] Checks overdue status

---

## ⚠️ ERROR SCENARIOS TO TEST

### Authentication Errors
- [ ] Invalid OTP code
- [ ] Expired OTP (>5 min)
- [ ] 3 wrong attempts
- [ ] Invalid token format
- [ ] Expired token

### Validation Errors
- [ ] Missing required fields
- [ ] Invalid email format
- [ ] Invalid phone format
- [ ] Invalid date format
- [ ] Negative numbers (fees, capacity)
- [ ] Future date of birth
- [ ] End date before start date

### Authorization Errors
- [ ] Student accessing admin routes
- [ ] Teacher accessing other teacher's data
- [ ] No token provided
- [ ] Invalid role for endpoint

### Business Logic Errors
- [ ] Duplicate CPR
- [ ] Duplicate email/phone
- [ ] Group capacity exceeded
- [ ] Hall double-booking
- [ ] Duplicate attendance
- [ ] Payment > installment amount
- [ ] Refund > paid amount

### Database Errors
- [ ] Foreign key violation
- [ ] Unique constraint violation
- [ ] Not null violation
- [ ] Invalid UUID format

---

## 📊 PERFORMANCE BENCHMARKS

**Target Response Times:**
- GET single record: <100ms
- GET list (50 records): <200ms
- POST create: <150ms
- PUT update: <150ms
- Bulk operations: <500ms
- Report generation: <3s
- Excel export: <5s

**Test with:**
- [ ] 1000 students in database
- [ ] 100 active groups
- [ ] 50 concurrent users
- [ ] Bulk attendance (50 students)
- [ ] CSV upload (500 records)
- [ ] Large report (full term)

---

## ✅ PRE-FRONTEND SIGN-OFF

**All must be TRUE:**

### Functionality
- [ ] All CRUD operations work
- [ ] All relationships intact
- [ ] All validations enforced
- [ ] All status codes correct (200/201/400/403/404/500)
- [ ] All error messages clear

### Data Integrity
- [ ] No orphaned records
- [ ] Cascade deletes work
- [ ] Soft deletes work
- [ ] Calculated fields accurate
- [ ] Timestamps auto-update

### Security
- [ ] All routes require auth (except public)
- [ ] Role middleware works
- [ ] Students can't access admin data
- [ ] Teachers can't modify other teachers
- [ ] No SQL injection possible
- [ ] No XSS possible

### Performance
- [ ] Pagination works (50/page)
- [ ] Filters work
- [ ] Indexes used (check EXPLAIN)
- [ ] No N+1 queries
- [ ] Response times acceptable

### Integration
- [ ] Prisma models match database
- [ ] Relationships bidirectional
- [ ] Includes work correctly
- [ ] Transactions work

---

## 🎯 TESTING PRIORITY

**Day 1 (4 hours):**
1. Authentication ✅
2. Users ✅
3. Programs/Terms/Levels ✅
4. Students ✅
5. Teachers ✅

**Day 2 (4 hours):**
6. Groups ✅
7. Enrollment ✅
8. Attendance ✅
9. Materials ✅

**Day 3 (4 hours):**
10. Payments ✅
11. Testing System ✅
12. Analytics ✅

**Day 4 (4 hours):**
13. Complete workflows ✅
14. Error scenarios ✅
15. Performance tests ✅
16. Bug fixes ✅

---

## 📝 TESTING LOG TEMPLATE

```markdown
## Test Session: [Date]
**Module:** [Module Name]
**Tester:** Sayed
**Duration:** [Time]

### Results:
- Tests Passed: X/Y
- Tests Failed: Z
- Bugs Found: N

### Issues:
1. [Issue description] - Severity: [High/Medium/Low]
2. [Issue description] - Severity: [High/Medium/Low]

### Fixed:
- [x] Issue 1
- [ ] Issue 2 (pending)

### Notes:
- [Any observations]
```

---

## 🚀 READY FOR FRONTEND?

**Check ALL boxes:**
- [ ] All 12 modules tested
- [ ] All workflows work end-to-end
- [ ] Zero critical bugs
- [ ] All validations work
- [ ] All permissions enforced
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Test data seeded
- [ ] Tokens generated
- [ ] Postman collection ready

**If all checked:** ✅ START FRONTEND DEVELOPMENT
**If any unchecked:** ❌ FIX BACKEND FIRST

---

**Testing Start Date:** _______________
**Testing End Date:** _______________
**Sign-off:** _______________
