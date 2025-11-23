
import { API_URL } from './client';

export const programAPI = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/programs?isActive=true`);
    return res.json();
  }
};