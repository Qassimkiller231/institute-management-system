// frontend/lib/api/payments.ts
import { API_URL, getHeaders } from './client';

export const paymentsAPI = {
  // Get all payment plans with installments
  getAllPlans: async () => {
    const res = await fetch(`${API_URL}/payments/plans`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch payment plans');
    return res.json();
  },

  // Get all payments (history)
  getPayments: async () => {
    const res = await fetch(`${API_URL}/payments`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  },

  // Get payment plan by enrollment
  getPlanByEnrollment: async (enrollmentId: string) => {
    const res = await fetch(`${API_URL}/payments/plans/enrollment/${enrollmentId}`, {
      headers: getHeaders(true)
    });
    if (res.status === 404) return null; // Return null if not found
    if (!res.ok) throw new Error('Failed to fetch payment plan');
    return res.json();
  },

  // Record payment for an installment
  recordPayment: async (installmentId: string, data: any) => {
    const res = await fetch(`${API_URL}/payments/installments/${installmentId}/pay`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to record payment');
    return res.json();
  },

  // CRUD for Plans
  createPlan: async (data: any) => {
    const res = await fetch(`${API_URL}/payments/plans`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create payment plan');
    }
    return res.json();
  },

  updatePlan: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/payments/plans/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update payment plan');
    }
    return res.json();
  },

  deletePlan: async (id: string) => {
    const res = await fetch(`${API_URL}/payments/plans/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to delete payment plan');
    }
    return res.json();
  },

  // CRUD for Installments
  addInstallment: async (planId: string, data: any) => {
    const res = await fetch(`${API_URL}/payments/plans/${planId}/installments`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to add installment');
    }
    return res.json();
  },

  updateInstallment: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/payments/installments/${id}/details`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update installment');
    }
    return res.json();
  },

  deleteInstallment: async (id: string) => {
    const res = await fetch(`${API_URL}/payments/installments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to delete installment');
    }
    return res.json();
  }
};
