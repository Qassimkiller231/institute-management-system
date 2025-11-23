# 🧪 MASTER TEST PLAN
**Institute Management System - Backend Testing**

## Test Environment Setup

```bash
# Prerequisites
- Backend running: http://localhost:3001
- Database: PostgreSQL with test data
- Tokens: Admin, Teacher, Student tokens ready
```

## Test Files Overview

1. **auth.http** - Authentication workflows
2. **admin-workflow.http** - Complete admin workflows  
3. **teacher-workflow.http** - Teacher daily operations
4. **student-workflow.http** - Student portal testing
5. **payment-workflow.http** - Payment processing
6. **testing-system.http** - Placement tests & speaking tests
7. **analytics.http** - Reports and analytics

## 🎯 Critical Workflows to Test

### Workflow 1: New Student Registration to Enrollment
1. Admin registers student
2. Student takes placement test
3. Speaking test scheduled & completed
4. Admin assigns level & enrolls in group
5. Payment plan created
6. Student views schedule & materials

### Workflow 2: Teacher Daily Operations
1. Login with OTP
2. View assigned groups
3. Record attendance for class
4. Update student progress
5. Upload class materials
6. View attendance reports

### Workflow 3: Student Payment Journey
1. View payment plan
2. Make payment (manual)
3. Receive receipt
4. View payment history
5. Check outstanding balance

### Workflow 4: Attendance Tracking
1. Teacher marks attendance
2. System calculates percentage
3. Triggers warning if <75%
4. Admin views attendance report
5. Export to Excel

### Workflow 5: Analytics & Reporting
1. Admin dashboard statistics
2. Program analytics
3. Financial reports
4. Attendance reports
5. Export capabilities

## 📋 Test Scenarios by Module

### Authentication Module ✅
- [x] Login with email OTP
- [x] Login with phone OTP
- [x] Invalid OTP (3 attempts)
- [x] Expired OTP
- [x] Verify token
- [x] Logout
- [x] Refresh token

### User Management ✅
- [x] Create users (all roles)
- [x] Get all users (pagination)
- [x] Get user by ID
- [x] Update user
- [x] Deactivate user
- [x] Filter by role

### Programs & Academic Structure ✅
- [x] Create program
- [x] Create term (current/past)
- [x] Create levels
- [x] Create venues & halls
- [x] Create groups
- [x] Schedule conflict validation

### Student Management ✅
- [x] Register student (full details)
- [x] Duplicate CPR validation
- [x] Update student info
- [x] View student profile
- [x] Deactivate student

### Teacher Management ✅
- [x] Create teacher
- [x] Update specialization
- [x] Toggle speaking test availability
- [x] View assigned groups

### Enrollment ✅
- [x] Create enrollment
- [x] Update status (PENDING→ACTIVE)
- [x] Withdraw student
- [x] View enrollment history

### Attendance ✅
- [x] Mark attendance (P/A/L/E)
- [x] Bulk upload CSV
- [x] Calculate percentage
- [x] Generate warnings
- [x] Attendance reports

### Payments ✅
- [x] Create payment plan
- [x] Record payment (all methods)
- [x] Generate receipt
- [x] Process refund
- [x] Payment reminders
- [x] Overdue tracking

### Materials ✅
- [x] Upload material (PDF/Video/Link)
- [x] View by group
- [x] Download material
- [x] Delete material

### Testing System ✅
- [x] Create placement test
- [x] Student takes test
- [x] Schedule speaking test
- [x] Teacher evaluates
- [x] Assign final level

### Analytics & Reporting ✅
- [x] Dashboard statistics
- [x] Program analytics
- [x] Financial reports
- [x] Attendance reports
- [x] Export to Excel/PDF

## 🎭 Test Data Requirements

### Users Needed
```
Admin: admin@test.com / adminToken
Teacher1: teacher1@test.com / teacherToken1
Teacher2: teacher2@test.com / teacherToken2
Student1: student1@test.com / studentToken1
Student2: student2@test.com / studentToken2
Parent1: parent1@test.com / parentToken1
```

### Academic Structure
```
- Program: English Multiverse
- Term: Fall 2025 (current)
- Levels: A1, A2, B1, B2
- Venue: Country Mall
- Halls: Hall 1, Hall 2
- Groups: 2-3 active groups
```

### Test Students
```
Student 1: Full enrollment, active attendance
Student 2: New registration, pending test
Student 3: Low attendance (<75%), at-risk
```

## ⚠️ Edge Cases to Test

### Authentication
- [ ] Concurrent login attempts
- [ ] Multiple OTP requests
- [ ] Token expiration handling
- [ ] Invalid token format

### Enrollment
- [ ] Duplicate enrollment prevention
- [ ] Group capacity exceeded
- [ ] Enrollment without payment
- [ ] Withdrawal with refund

### Attendance
- [ ] Mark attendance for wrong group
- [ ] Duplicate attendance records
- [ ] Future date attendance
- [ ] Bulk upload with errors

### Payments
- [ ] Overpayment handling
- [ ] Partial payments
- [ ] Refund > paid amount
- [ ] Invalid Benefit reference

### Testing
- [ ] Test without questions
- [ ] Speaking slot double-booking
- [ ] Invalid test scores
- [ ] Final level mismatch

## 🐛 Bug Testing Checklist

### Data Validation
- [ ] Empty required fields
- [ ] SQL injection attempts
- [ ] XSS in text fields
- [ ] Invalid email formats
- [ ] Invalid phone formats
- [ ] Invalid dates (future DOB)
- [ ] Negative numbers (fees, capacity)

### Authorization
- [ ] Student accessing admin routes
- [ ] Teacher modifying other teachers
- [ ] Viewing unauthorized data
- [ ] CRUD without token

### Business Logic
- [ ] Schedule conflicts
- [ ] Duplicate unique fields (CPR, email)
- [ ] Referential integrity
- [ ] Calculated fields accuracy
- [ ] Status transition rules

## 📊 Performance Testing

### Load Testing Targets
- [ ] 100 concurrent logins
- [ ] 50 attendance submissions/minute
- [ ] 1000 student records query
- [ ] Large CSV upload (500 records)
- [ ] Report generation <3 seconds

### Database Testing
- [ ] Query optimization (EXPLAIN)
- [ ] Index effectiveness
- [ ] Connection pooling
- [ ] Transaction rollbacks

## ✅ Pre-Frontend Checklist

**Must Pass Before Frontend:**
- [ ] All CRUD operations work
- [ ] All relationships intact
- [ ] Pagination working
- [ ] Filters working
- [ ] All status codes correct
- [ ] Error messages clear
- [ ] No console errors
- [ ] All tokens valid
- [ ] All workflows complete
- [ ] Export functions work

## 🚀 Test Execution Order

**Day 1: Core Modules**
1. Authentication (30 min)
2. User Management (30 min)
3. Programs/Terms/Levels (30 min)
4. Students/Teachers (45 min)

**Day 2: Academic Operations**
5. Groups & Schedules (30 min)
6. Enrollment (30 min)
7. Attendance (45 min)
8. Materials (30 min)

**Day 3: Financial & Testing**
9. Payments (60 min)
10. Testing System (45 min)
11. Analytics (45 min)

**Day 4: Integration Testing**
12. Complete workflows (2 hours)
13. Edge cases (1 hour)
14. Bug fixes (1 hour)

## 📝 Test Results Template

```markdown
## Test Session: [Date]
**Tester:** Sayed
**Environment:** Local Development
**Database:** PostgreSQL 15

### Tests Passed: X/Y
### Tests Failed: Z
### Bugs Found: N

**Critical Issues:**
- Issue 1: [Description]
- Issue 2: [Description]

**Non-Critical Issues:**
- Issue 1: [Description]

**Notes:**
- [Any observations]
```

## 🎯 Success Criteria

**Backend is Frontend-Ready when:**
1. ✅ All 12 modules tested
2. ✅ All workflows complete end-to-end
3. ✅ No critical bugs
4. ✅ All endpoints documented
5. ✅ All status codes correct
6. ✅ Response formats consistent
7. ✅ Error handling comprehensive
8. ✅ Performance acceptable
9. ✅ Security validated
10. ✅ Data integrity confirmed

---

**Start Date:** [Today]
**Target Completion:** 4 days
**Status:** Ready to begin testing
