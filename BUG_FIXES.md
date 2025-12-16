# Bug Fixes Plan

## Bugs Found

### 1. ❌ Duplicate Tests Showing
**Page**: `/take-test` (Placement Test Selection)
**Issue**: Multiple identical "A1 Level Placement Test" entries are displayed
**Impact**: Confusing user experience, user doesn't know which one to select
**Fix needed**: 
- Run cleanup script to remove duplicate tests from database
- Add unique constraint to prevent duplicate test names

---

### 2. ❌ Cannot Retake Test After Completion
**Page**: `/take-test` (Placement Test Selection)
**Issue**: If user has already taken a placement test, they cannot access the test page again or see their results
**Impact**: Users cannot review their test or retake if needed
**Expected behavior**: 
- Option 1: Show "Already Completed" status with score
- Option 2: Allow viewing results but not retaking
- Option 3: Allow retaking with admin permission
**Fix needed**:
- Update frontend to check if test is already taken
- Show appropriate message/button based on completion status
- Add "View Results" button for completed tests

---

### 3. ❌ Incorrect MCQ Score Display
**Page**: Test results page (after completing MCQ test)
**Issue**: Shows "90 / 50" which is mathematically incorrect
**Impact**: Confusing - did the student score 90 out of 50? That's impossible!
**Expected behavior**: 
- Option 1: Show actual score out of total questions (e.g., "45 / 50")
- Option 2: Show score out of 100 (e.g., "90 / 100")
- Option 3: Show percentage (e.g., "90%")
**Fix needed**:
- Backend: Check scoring calculation logic
- Frontend: Display score correctly based on total points/questions

---


### 4. ❌ Incorrect Payment Status (Shows "Overdue" for Pending Payment)
**Page**: Payment installment schedule
**Issue**: Payment shows "Overdue" status even though:
  - Due date is Jan 15, 2025 (future date)
  - No payment has been made yet
  - Payment date is "-" (null)
**Impact**: Confusing - makes it look like the student is late on payment when they're not
**Expected behavior**: 
- If due date is in the future and unpaid → Status should be "Pending" 
- If due date is past and unpaid → Status should be "Overdue"
- If paid → Status should be "Paid"
**Fix needed**:
- Backend: Fix payment status calculation logic (check current date vs due date)
- Frontend: Display correct status badge based on payment state

---

### 5. ❌ CRITICAL: Stripe Payment Failing (400 Bad Request)
**Page**: Payment modal  
**Issue**: Payment fails with "Failed to confirm payment" error, 400 from `/api/payments/stripe/confirm`  
**Impact**: CRITICAL - Students cannot make payments!  
**Fix**: Check Stripe API key, payment intent creation, error handling

---

### 6. 🎨 GLOBAL: Text Contrast Issues - Grey/Light Text Throughout App
**Pages**: ALL pages across all portals
**Issue**: Grey/light text on white backgrounds everywhere causing poor readability:
- Attendance page header (harsh green)
- Notes field (blue text)
- Search/filter inputs
- Dropdown placeholders
- Edit profile form inputs
- Cancel buttons
- Page headings (Terms Management, etc.)
- Input field values
**Impact**: Major accessibility issue - users struggle to read text throughout the app
**Fix**: **GLOBAL CSS UPDATE** - Change all light grey/white text to black or dark grey
- Target all input fields, placeholders, buttons, headings
- Ensure WCAG AA compliance (4.5:1 contrast ratio minimum)

---

**NOTE**: Bugs #7, #9, #10, #13, #20, #22 are all consolidated into this global text contrast fix above.

---

### 7. 🎨 UI: Notes Field Color (Attendance Page)
**Page**: Attendance marking page
**Issue**: Blue text color in notes field is hard to see / read
**Impact**: Poor usability, notes are difficult to read
**Fix**: Change to darker, more readable color (black or dark gray)

---

### 8. ❌ Student Progress - Level Not Found (Wrong Route/Nesting Issue)
**Page**: Student progress tracking page
**Issue**: 
- Shows "No Level Assigned to Ammar" error
- Console: 404 error on `/api/student-progress/:studentId`
- Student level is nested in `enrollment.group.level` but code is trying to access it incorrectly
**Impact**: Cannot view student progress at all - critical feature broken
**Fix needed**:
- Option 1: Fix API route to properly fetch enrollment with nested level data
- Option 2: Update frontend to access level from correct nested path
- Add proper error handling

---

### 9. 🎨 UI: Search/Filter Text Unreadable
**Page**: Learning Materials page (and possibly others)
**Issue**: Text in search fields ("Filter by Group", "Search Materials") is too light/faded
**Impact**: Users can't see what they're typing or read placeholder text
**Fix**: Increase text contrast - use darker color for input text and placeholders

---

### 10. 🎨 UI: Select Group Dropdown Text Unreadable
**Page**: Generate Report page (and possibly other dropdowns)
**Issue**: "Choose a group" placeholder text is extremely faint/light gray
**Impact**: Users can't see dropdown placeholder text
**Fix**: Increase placeholder text contrast

---

### 11. ❌ CRITICAL: Announcements Not Showing (Fetching Issue)
**Page**: Student dashboard
**Issue**: 
- Console shows "All announcements fetched: 0"
- Despite announcements existing for "All Institute" and specific group
- "Active groups: []" - empty array
- Student is in a group but not seeing announcements
**Impact**: CRITICAL - Students cannot see important announcements
**Possible causes**:
- API endpoint not filtering correctly for student's groups
- Enrollment/group relationship not being fetched
- Wrong targetAudience filtering logic
**Fix needed**:
- Debug `/api/announcements` endpoint
- Ensure it fetches announcements for student's enrolled groups
- Fix "ALL" institute announcements to show for all users

---

### 12. 📋 Announcements Not Sorted by Latest First
**Page**: Admin & Teacher portals - Announcements list
**Issue**: Announcements are not ordered chronologically (latest first)
**Impact**: Hard to find recent announcements
**Fix**: Add `orderBy: { publishedAt: 'desc' }` to announcement queries

---

### 13. 🎨 UI: Edit Profile Form Text Unreadable
**Page**: Edit profile modal/page
**Issue**: Input field text (Fatima, Ali, IELTS Preparation) is extremely light/faded
**Impact**: Users can barely see their own profile data
**Fix**: Increase input text contrast - use dark text color

---

### 14. ❌ Parent Portal Attendance - Runtime Error
**Page**: Parent portal - Child attendance tab
**Issue**: 
- Error: "Cannot read properties of undefined (reading 'group')"
- Page crashes when trying to view child's attendance
- Trying to access `record.session.group.name` but `group` is undefined
**Impact**: Parents cannot view their child's attendance at all
**Fix**: Add proper null checks or ensure attendance records include nested group data

---

### 15. 🎨 UI: Remove "No progress data available" Message
**Page**: Parent portal - Child progress tab
**Issue**: Shows "No progress data available" text above the button
**Impact**: Negative messaging - makes it look like there's a problem
**Fix**: Remove the text, just show "View Full Progress Report" button

---

### 16. ❌ Parent Portal Announcements - Runtime Error
**Page**: Parent portal - Announcements page
**Issue**: 
- Error: "Cannot read properties of undefined (reading 'toUpperCase')"
- Page crashes when trying to view announcements
- Likely trying to format/transform undefined data
**Impact**: Parents cannot view announcements at all
**Fix**: Add null checks before calling string methods like `.toUpperCase()`

---

### 17. ❌ Parent Portal Materials - Runtime Error
**Page**: Parent portal - Materials page
**Issue**: 
- Error: "Cannot read properties of undefined (reading 'toUpperCase')"
- Same error as announcements page
- Page crashes when trying to view materials
**Impact**: Parents cannot view learning materials at all
**Fix**: Add null checks before calling `.toUpperCase()` method

---

### 18. ❌ CRITICAL: Payment Status Inconsistency Across Portals
**Page**: Parent portal - Payments page vs Dashboard vs Student portal
**Issue**: 
- Parent payments page shows: "UNPAID", "Pending: $450.00", "Total Paid: $0.00"
- Parent dashboard shows: "Pending Payments: $0"
- Student portal shows: Payment is "PAID"
- **Completely contradictory data!**
**Impact**: CRITICAL - Parents and students see different payment statuses, causing confusion and trust issues
**Possible causes**:
- Different API endpoints returning different data
- Payment status calculation logic differs between portals
- Database sync issue
**Fix needed**:
- Ensure all portals use the same payment status source
- Fix payment status calculation to be consistent
- Verify database has correct payment data

---

### 19. ❌ Create Announcement - Group Dropdown Empty
**Page**: Admin/Teacher - Create Announcement form
**Issue**: 
- When selecting "Specific Group" as target audience
- "Select Group" dropdown shows no options
- Cannot select a group to send announcement to
**Impact**: Cannot create group-specific announcements
**Possible causes**:
- Groups not being fetched when "Specific Group" is selected
- API call missing or failing
- Frontend not populating dropdown options
**Fix**: Ensure groups are fetched and populated in dropdown when "Specific Group" is selected

---

### 20. 🎨 UI: Cancel Button Text Unreadable
**Page**: Multiple modals (Add Program form shown here)
**Issue**: "Cancel" button text is extremely light/faded
**Impact**: Users can barely see the cancel option
**Fix**: Increase cancel button text contrast - use darker color

---

### 21. ❌ MISSING FEATURE: Payment Plan Management
**Page**: Admin portal - Student management / Payments
**Issue**: Cannot manage payment plans at all:
- Cannot CREATE payment plans for students without one
- Cannot VIEW existing payment plans
- Cannot EDIT payment plan details (amounts, installments)
- Cannot DELETE payment plans
**Impact**: CRITICAL - Admins cannot set up or manage student payments!
**Fix needed**:
- Create payment plan management UI in admin portal
- Add CRUD operations for payment plans
- Link to student enrollment for easy access

---

### 22. 🎨 UI: "Terms Management" Heading Unreadable
**Page**: Admin portal - Terms Management page
**Issue**: Page heading "Terms Management" is extremely light/faded
**Impact**: Users can barely see the page title
**Fix**: Increase heading text contrast - use darker color

---

### 23. ❌ Delete Level Fails - Wrong API Endpoint
**Page**: Admin portal - Levels management
**Issue**: 
- Error: "Failed to delete level"
- Console: 404 (Not Found) on `/api/levels/0da-9bc3-ac61111d243dc:1`
- URL looks malformed - extra characters or wrong format
**Impact**: Cannot delete levels from the system
**Possible causes**:
- Frontend passing wrong level ID format
- API endpoint expects different URL structure
- ID being concatenated/formatted incorrectly
**Fix**: Debug level delete API call, ensure correct ID is passed

---

### 24. 🛠️ REFACTORING: Identify Pages Using Manual `fetch()`
**Pages**: All frontend pages
**Issue**: Need to audit all pages for manual `fetch()` calls
**Impact**: 
- Inconsistent error handling
- No centralized request/response interceptors
- Harder to maintain authentication headers
- Difficult to add global loading states
**Fix needed**:
- Identify all pages using manual `fetch()`
- Refactor to use consistent API client (Axios or custom wrapper)
- Add centralized error handling
**Status**: Investigation needed - will log all pages found

---

### 25. 📝 TASK: Add Groups to All Programs and Terms
**Status**: Planned improvement
**Issue**: Need to ensure all programs and terms have groups created
**Impact**: 
- Some programs/terms may not have any groups
- Students cannot be enrolled without groups
- Reports and filtering may fail
**Tasks**:
- Audit existing programs and terms for missing groups
- Create default groups for programs/terms without any
- Ensure consistent group structure across all terms

---

### 26. ❌ Inactive Programs Showing in Create Group Dropdown
**Page**: Admin portal - Create Group form
**Issue**: 
- "ammar program" is marked as "Inactive" in Programs list
- But still appears in "Select Program" dropdown when creating groups
- Inactive items should be filtered out
**Impact**: Confusion - users can select inactive programs for new groups
**Fix**: Filter programs API to only return `isActive: true` programs for dropdowns

---

### 27. ❌ Delete Venue Fails - Wrong API Endpoint (Same as Levels)
**Page**: Admin portal - Venues management
**Issue**: 
- Cannot delete venues
- Console: 404 on `/api/venues/23c-ar02-af70bb740ae3:1`
- URL malformed - has `:1` appended
- **Same issue as level deletion (Bug #23)**
**Impact**: Cannot delete venues from the system
**Fix**: Same root cause as levels - fix ID formatting in delete API calls

---

### 28. ❌ Soft-Deleted Items Still Showing in Lists
**Pages**: All CRUD pages with soft delete (Halls, Venues, Programs, Terms, Levels, etc.)
**Issue**: 
- Deleted "third hall" still appears in halls list
- Soft-deleted records (isActive: false or deletedAt: not null) not filtered out
- Need filtration on ALL pages with soft delete
**Impact**: Confusion - users see "deleted" items still in lists
**Pages affected**:
- Halls
- Venues
- Programs
- Terms
- Levels
- Groups (potentially)
- Students/Teachers/Parents (potentially)
**Fix**: 
- Add `where: { isActive: true }` or `where: { deletedAt: null }` to all list queries
- Ensure consistent filtering across ALL CRUD endpoints
- Add "Show Deleted" toggle for admins if needed

---

### 29. ❌ Financial Reports - "All Terms" Shows 0.00 BD for Everything
**Page**: Admin portal - Financial Reports
**Issue**: 
- When selecting "All Terms" from dropdown
- All metrics show 0: Total Revenue (0.00 BD), Expected (0.00 BD), Pending (0.00 BD), Collection Rate (0.0%)
- Console shows API returns empty arrays for months data
- Selecting a specific term likely works correctly
**Impact**: Cannot view aggregate financial data across all terms
**Possible causes**:
- Backend not aggregating payment data when term is "All Terms" or null
- API expects specific term ID, not handling "all" case
- Frontend passing wrong parameter value
**Fix**: 
- Update financial reports API to aggregate data across ALL terms when no specific term selected
- Or fix frontend to properly request all-term aggregation

---

### 30. ❌ Term Dropdown Doesn't Show Program Names
**Page**: Admin portal - Financial Reports (and possibly other pages)
**Issue**: 
- Term dropdown shows terms like "Spring 2025", "Fall 2024" multiple times
- These are NOT duplicates - they're different terms for different programs
- Missing program name in dropdown display (e.g., should show "Spring 2025 - IELTS Preparation", "Spring 2025 - Academic Writing")
**Impact**: Users can't distinguish between terms for different programs
**Fix**: 
- Update dropdown to show `{term.name} - {term.program.name}` format
- Or group terms by program in dropdown
- Ensure term selection passes correct term ID

---

### 31. ❌ Revenue Trend Table Shows No Monthly Data
**Page**: Admin portal - Financial Reports
**Issue**: 
- Revenue Trend table has headers (Month, Collected, Expected, Difference) but no data rows
- Summary cards above show correct totals (766.67 BD collected, 2400 BD expected)
- Monthly breakdown is missing
**Impact**: Cannot see revenue trends over time, no monthly analysis
**Possible causes**:
- API returns summary but not monthly breakdown
- Frontend not rendering monthly data correctly
- Data structure mismatch between API response and table component
- Selected term has no monthly data
**Fix**: 
- Debug API response to check if monthly data is returned
- Fix monthly data aggregation/calculation in backend
- Ensure frontend properly renders monthly rows

---

### 32. ❌ Unpaid Installments Show Wrong Payment Method
**Page**: Payments list (admin/parent/student portals)
**Issue**: 
- Installments with status "OVERDUE" or "PENDING" show payment methods like "ONLINE_PAYMENT", "BENEFIT_PAY"
- These payments haven't been made yet, so method should show "PENDING" or be empty
- Only PAID installments should show the actual payment method used
**Impact**: Misleading data - looks like payment was made with a specific method when it wasn't
**Fix**: 
- Check database: ensure unpaid installments have null/empty payment method
- Update display logic: show "PENDING" for unpaid installments, only show actual method for PAID ones
- Fix query/logic that sets payment method on installment records

---

### 33. 📧 MISSING FEATURE: Email Receipt After Payment
**Status**: Feature request
**Issue**: System doesn't send email receipts to users after successful payment
**Impact**: 
- Users have no email confirmation of payment
- No paper trail for transactions
- Poor user experience
**Requirements**:
- Automatically send email receipt when payment is successful
- Include: payment amount, date, method, installment details, receipt number
- Send to student's email (and parent's email if applicable)
- Store receipt PDF or link in database
**Implementation needed**:
- Email service integration
- Receipt template design
- Trigger on payment confirmation

---

### 34. ❌ Speaking Tests Shows AVAILABLE Slots Instead of Booked/Completed
**Page**: Admin portal - Speaking Tests
**Issue**: 
- List shows all test slots with status "AVAILABLE" and student "N/A"
- These are unbooked slots, not actual student tests
- Users only want to see BOOKED or COMPLETED tests (tests with students assigned)
**Impact**: Cannot see which students have speaking tests scheduled or completed
**Fix**: 
- Add status filter: default to showing only "BOOKED" and "COMPLETED" tests
- Add dropdown to toggle between "All", "Available", "Booked", "Completed"
- Filter out N/A students by default

---

### 35. 📝 MISSING FEATURE: Admin Book Speaking Test for Student
**Page**: Admin portal - Speaking Tests
**Issue**: No way for admin to book/assign a speaking test slot to a specific student
**Impact**: Admins cannot schedule speaking tests for students
**Requirements**:
- Add "Book Test" action for available slots
- Allow selecting a student to assign to the slot
- Set status to "BOOKED" and assign student
- Send notification to student and teacher
**Implementation needed**:
- Book test modal/form
- Student selection dropdown
- Update test slot with student assignment

---

### 36. ❌ Placement Tests Missing Student Names and Dates + View Results Not Working
**Page**: Admin portal - Placement Tests
**Issue**: 
- Completed tests showing in list (status: COMPLETED, scores: 100/50, 90/50)
- But Student column shows "-" (empty)
- Test Date column shows "-" (empty)
- Recommended Level shows "-" (empty)
- Summary shows "Total: 2, Completed: 2, Avg: 84%" so data exists
- **"View Results" button does not work** - clicking it has no effect or throws error
**Impact**: Cannot see which students took tests, when, or view detailed results
**Related**: Bug #3 (incorrect MCQ scores 100/50, 90/50)
**Possible causes**:
- Frontend not displaying student data from API response
- API not including student/date in response
- Data structure mismatch
- View Results navigation/modal broken
**Fix**: 
- Check API response structure
- Ensure student, testDate, recommendedLevel are included and displayed
- Fix score calculation (should be percentage, not "100/50")
- Fix View Results button functionality

---

### 37. ❌ FAQ Create/Delete Not Working Properly
**Page**: Admin portal - FAQs page
**Issue**: 
- **Delete FAQ**: Clicked delete but FAQ still shows in list (soft-delete filtering issue)
- **Create FAQ**: Created new FAQ but it doesn't appear in list (refresh/cache issue)
- Related to Bug #28 (soft-deleted items still showing)
**Impact**: Cannot properly manage FAQs - deleted ones persist, new ones invisible
**Possible causes**:
- Delete button not working or only soft-deleting (isActive: false)
- Soft-deleted FAQs not filtered from list query
- Page not refreshing after create/delete
- Frontend state not updating
**Fix**: 
- Fix delete to actually work (or filter soft-deleted FAQs)
- Refresh FAQ list after create/delete operations
- Update frontend state after mutations

---

---

### 42. 💰 IMPROVEMENT: Installment Amounts Should Be Whole Numbers Close to 5 BD
**Page**: Admin portal - Payment Plans / Create Payment Plan
**Issue**: 
- Current installment calculation splits total evenly with decimals (e.g., 16.67 BD)
- Creates non-user-friendly decimal amounts
- No consideration for preferred installment size

**Current Behavior**:
```
Total: 50 BD, 3 installments
Installment #1: 16.67 BD
Installment #2: 16.67 BD
Installment #3: 16.67 BD
```

**Expected Behavior**:
1. ✅ Each installment should be a **whole number** (no decimals)
2. ✅ Each installment should be **close to 5 BD** when possible
3. ✅ The **last installment** should contain the remaining balance

**Better Example**:
```
Total: 50 BD, 3 installments
Installment #1: 17 BD
Installment #2: 17 BD
Installment #3: 16 BD (remaining balance)
```

**Optimal Example (close to 5 BD)**:
```
Total: 50 BD
Suggested: 10 installments of ~5 BD each
Installment #1-9: 5 BD each (45 BD)
Installment #10: 5 BD (remaining 5 BD)
```

**Impact**: Better user experience with cleaner payment amounts

**Fix needed**:
- **Backend**: `backend/src/services/payment.service.ts`
  - Update installment calculation logic
  - Round to whole numbers
  - Consider target amount parameter (default: 5 BD)
  - Last installment = Total - Sum(previous installments)
- **Frontend**: Display logic should show BD 5 instead of BD 5.00

**Proposed Code**:
```typescript
// Instead of:
const installmentAmount = finalAmount / totalInstallments;

// Use:
const baseAmount = Math.floor(finalAmount / totalInstallments);
const lastInstallment = finalAmount - (baseAmount * (totalInstallments - 1));

// Or with preferred amount:
const preferredAmount = 5; // BD
const suggestedCount = Math.ceil(finalAmount / preferredAmount);
```

**Priority**: Low (Enhancement)  
**Status**: 🔴 To Do

---

### 43. 🔍 [Add more bugs as you find them]

---

### 39. ❌ MISSING FEATURE: Groups Don't Have Hall Assignment
**Page**: `/admin/groups` (Create/Edit Group)
**Issue**: When creating or editing a group, there's no field to assign a hall where the group will have classes
**Impact**: 
- Cannot track which hall a group uses
- Scheduling conflicts cannot be prevented
- Manual coordination required outside the system
**Expected behavior**:
- Group creation/edit form should have a "Hall" dropdown
- Hall should be a required field
- Should show halls from the venue/program
**Fix needed**:
- **Frontend**: Add hall selection dropdown in create/edit group forms
- **Backend**: Update group creation/update to include `hallId`
- **Database**: Verify `Group` model has `hallId` field (should already exist in schema)
- **Validation**: Ensure hall selection is required

---

### 40. ❌ MISSING FEATURE: Active/Inactive Filter on Management Pages
**Pages**: All pages with soft-delete functionality (Students, Teachers, Parents, Admins, Groups, Programs, Terms, Levels, Venues, Halls)
**Issue**: No UI filter to show/hide inactive (soft-deleted) items
**Current behavior**: 
- Backend filters out inactive items by default (Bug #28 fix)
- No way for admin to view all items including inactive ones
**Expected behavior**:
- Add filter dropdown: "All", "Active Only", "Inactive Only"
- Default to "Active Only"
- Allow admins to view inactive items when needed
**Impact**: 
- Cannot see archived/inactive items
- Cannot restore soft-deleted items easily
- No way to audit what was deactivated
**Fix needed**:
- **Frontend**: Add filter dropdown to all management pages
- **State**: Track filter selection in component state
- **API**: Pass `isActive` filter parameter to backend
- **Backend**: Already supports this via `isActive` parameter

---

### 41. ❌ MISSING FEATURE: Toggle Current Term (One Per Program)
**Page**: `/admin/terms`
**Issue**: No way to mark which term is currently active for each program
**Business rule**: 
- Each program can have AT MOST one current term
- Minimum: 0 (no current term is allowed)
- Maximum: 1 (only one term can be current per program)
**Expected behavior**:
- Add "Current" toggle/button for each term
- When toggling a term as current:
  - If another term in same program is already current, unset it first
  - Then set the selected term as current
- Visual indicator (badge/icon) for current terms
**Impact**: 
- Cannot determine which term is active
- Enrollment logic unclear
- Reporting unclear which term to use
**Fix needed**:
- **Database**: Verify `Term` model has `isCurrent` boolean field
- **Backend**: 
  - Add `toggleCurrentTerm(termId)` endpoint
  - Logic: When setting current, unset other current terms for same program
- **Frontend**: 
  - Add toggle button/switch for each term
  - Show visual indicator for current terms
  - Handle API call and refresh

---

## Implementation Plan

Once all bugs are collected, we'll fix them in this order:

1. **Database Issues** (duplicates, data integrity)
2. **Backend API** (test completion checks, status endpoints)
3. **Frontend UI** (display logic, user feedback)
4. **Testing** (verify all fixes work on EC2)

---

## Status

- [ ] Bug collection phase
- [ ] Implementation planning
- [ ] Fix development
- [ ] Testing
- [ ] Deployment to EC2
