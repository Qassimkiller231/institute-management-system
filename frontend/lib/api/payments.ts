// frontend/lib/api/payments.ts
import { apiFetch, API_URL, getHeaders } from './client';

export const paymentsAPI = {
  getAllPlans: () => apiFetch('/payments/plans'),

  getPayments: () => apiFetch('/payments'),

  // Maps 404 to null, so it needs the raw status code that apiFetch hides.
  getPlanByEnrollment: async (enrollmentId: string) => {
    const res = await fetch(`${API_URL}/payments/plans/enrollment/${enrollmentId}`, {
      credentials: 'include',
      headers: getHeaders(true),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch payment plan');
    return res.json();
  },

  recordPayment: (installmentId: string, data: any) =>
    apiFetch(`/payments/installments/${installmentId}/pay`, { method: 'POST', body: data }),

  // CRUD for Plans
  createPlan: (data: any) =>
    apiFetch('/payments/plans', { method: 'POST', body: data }),

  updatePlan: (id: string, data: any) =>
    apiFetch(`/payments/plans/${id}`, { method: 'PUT', body: data }),

  deletePlan: (id: string) =>
    apiFetch(`/payments/plans/${id}`, { method: 'DELETE' }),

  // CRUD for Installments
  addInstallment: (planId: string, data: any) =>
    apiFetch(`/payments/plans/${planId}/installments`, { method: 'POST', body: data }),

  updateInstallment: (id: string, data: any) =>
    apiFetch(`/payments/installments/${id}/details`, { method: 'PUT', body: data }),

  deleteInstallment: (id: string) =>
    apiFetch(`/payments/installments/${id}`, { method: 'DELETE' }),
};
