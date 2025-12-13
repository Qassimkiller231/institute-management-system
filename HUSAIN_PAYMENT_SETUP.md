# Creating Payment Plan for Husain

## Problem Fixed
✅ **Progress Tab Error Fixed** - Now includes `groupId` and `levelId` in the API request

## Adding Payment Plan for Husain (CPR: 767676767)

### Option 1: Run the Automated Script (EASIEST)

```bash
# Navigate to backend directory
cd backend

# Run the script
npx tsx scripts/createPaymentForHusain.ts
```

**This script will:**
1. Find Husain by CPR (767676767)
2. Find his active enrollment
3. Create a payment plan (BHD 450.00)
4. Create 1 installment (Due: Jan 15, 2025)
5. Set status to UNPAID so it shows as "Pay Now"

**Expected Output:**
```
🔍 Finding Husain (CPR: 767676767)...
✅ Found student: Husain [LastName]
   Student ID: [UUID]
✅ Found active enrollment:
   Enrollment ID: [UUID]
   Group: [Group Name]
   Level: [Level Name]
   Term: [Term Name]
💰 Creating payment plan...
✅ Payment plan created!
   Plan ID: [UUID]
   Total Amount: BHD 450.00
📋 Creating installment...
✅ Installment created!
   Installment ID: [UUID]
   Amount: BHD 450.00
   Due Date: 2025-01-15
   Status: UNPAID
🎉 Success! Payment plan created for Husain.
```

---

### Option 2: Using HTTP Requests (VS Code REST Client)

1. Open `backend/tests/all/create-payment-husain.http`
2. Get your admin token
3. Follow the steps in the file:
   - Step 1: Find Husain's student ID
   - Step 2: Get his enrollment ID
   - Step 3: Create payment plan (replace {{enrollmentId}})
   - Step 4: Verify it was created

---

### Option 3: Direct SQL (If using database tool)

1. Open `backend/scripts/create-payment-husain.sql`
2. Run Step 1 & 2 to get enrollment_id
3. Replace `{{enrollment_id}}` in Steps 3-6 with actual value
4. Run Steps 3-6 to create the payment plan

---

## After Creating Payment Plan

### Test as Parent:

1. **Login as Husain's parent** (use the parent account linked to Husain)

2. **Go to Payments page** (`/parent/payments`)
   - You should see the new payment for "Installment 1 of 1"
   - Student: Husain
   - Amount: BHD 450.00
   - Status: UNPAID (yellow badge)
   - Action: "Pay Now" button

3. **Click "Pay Now"**
   - Payment modal opens
   - Shows payment details
   - Click "Proceed to Payment"
   - Creates Stripe payment intent
   - Shows success message

4. **Check Progress Tab**
   - Go to `/parent/children/[id]`
   - Click "Progress" tab
   - Should now load without error
   - Will show progress criteria (if any exist for the level/group)
   - If no progress criteria exist, shows "No progress data available"

---

## Summary of Changes

### Frontend Fix:
✅ `frontend/app/parent/children/[id]/page.tsx`
- Fixed progress API call to include `groupId` and `levelId`
- Gets these from student's active enrollment
- Proper error handling if no active enrollment

### Backend (No Changes Needed):
- Progress API already works correctly
- Payment API already filters by parent's children
- Just needed test data

### Scripts Created:
1. `backend/scripts/createPaymentForHusain.ts` - Auto-create payment
2. `backend/tests/all/create-payment-husain.http` - Manual HTTP requests
3. `backend/scripts/create-payment-husain.sql` - Direct SQL option

---

## Troubleshooting

### If script fails:
- **"Student not found"** → Check CPR is exactly '767676767'
- **"No active enrollments"** → Create enrollment for Husain first
- **"Payment plan already exists"** → Already created, check parent portal

### If progress still shows error:
- Check student has ACTIVE enrollment
- Check enrollment has a group and level assigned
- Look at browser console for exact error

### If payment doesn't show:
- Verify parent is linked to Husain
- Restart backend server
- Check network tab for API response

---

**Ready to test!** Run the script and test in the parent portal! 🚀
