/**
 * Payment helper utilities
 */

export type InstallmentStatus = 'PAID' | 'OVERDUE' | 'PENDING';

/**
 * Calculate installment status based on payment date and due date
 * This is the single source of truth for payment status across all portals
 */
export function calculateInstallmentStatus(installment: {
    paymentDate: Date | null;
    dueDate: Date | null;
}): InstallmentStatus {
    // If paid, always PAID
    if (installment.paymentDate) {
        return 'PAID';
    }

    // If no due date, default to PENDING
    if (!installment.dueDate) {
        return 'PENDING';
    }

    // Compare due date to today
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time to compare dates only

    const due = new Date(installment.dueDate);
    due.setHours(0, 0, 0, 0);

    return due < now ? 'OVERDUE' : 'PENDING';
}
