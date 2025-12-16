# Bugs & Improvements Tracker

**Project**: Institute Management System  
**Last Updated**: December 16, 2025

---

## 🐛 Open Issues

### Issue #1: Installment Calculation - Use Whole Numbers Close to 5 BD

**Priority**: Medium  
**Module**: Payment Plans / Installments  
**Status**: 🔴 To Do

**Current Behavior**:
- Installments are calculated as equal decimals (e.g., 16.67 BD for 50 BD split into 3 installments)
- Creates non-friendly decimal amounts

**Expected Behavior**:
1. ✅ Each installment should be a **whole number** (no decimals)
2. ✅ Each installment should be **close to 5 BD** when possible
3. ✅ The **last installment** should contain the remaining balance

**Example**:
- **Total Amount**: 50 BD
- **Number of Installments**: 3

**Current Output**:
```
Installment #1: 16.67 BD
Installment #2: 16.67 BD
Installment #3: 16.67 BD (with rounding issues)
```

**Expected Output**:
```
Installment #1: 17 BD
Installment #2: 17 BD
Installment #3: 16 BD (remaining balance)
```

**Better Example (closer to 5 BD)**:
- **Total Amount**: 50 BD
- **Target per installment**: ~5 BD
- **Calculated installments**: 50 / 5 = 10 installments

```
Installment #1-9: 5 BD each (45 BD total)
Installment #10: 5 BD (remaining balance)
```

**Files to Update**:
- `backend/src/services/payment.service.ts` - Update installment calculation logic
- `frontend/app/admin/payment-plans/*` - Display logic (if needed)

**Implementation Notes**:
- Round down for first N-1 installments
- Last installment = Total - (Sum of previous installments)
- Consider a "preferred installment amount" parameter (default: 5 BD)
- Ensure total adds up exactly with no rounding errors

**Related Code**:
```typescript
// Current calculation (equal split):
const installmentAmount = finalAmount / totalInstallments;

// Proposed calculation:
const baseAmount = Math.floor(finalAmount / totalInstallments);
const lastInstallment = finalAmount - (baseAmount * (totalInstallments - 1));
```

---

## ✅ Completed Issues

*(None yet)*

---

## 📝 Feature Requests

*(Add future feature requests here)*

---

## Notes

- When fixing bugs, move them from "Open Issues" to "Completed Issues" with completion date
- Add new bugs/improvements as they are discovered
- Include screenshots or error logs when applicable
