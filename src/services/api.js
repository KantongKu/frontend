import axios from 'axios';

// Ganti dengan URL backend Anda
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Scanner Service
export const scannerService = {
  // Upload gambar struk untuk OCR
  uploadReceipt: async (file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    
    try {
      const response = await api.post('/scanner/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading receipt:', error);
      throw error;
    }
  },

  // Ekstrak data dari gambar menggunakan OCR
  extractData: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      const response = await api.post('/scanner/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Error extracting data:', error);
      throw error;
    }
  },
};

// Categorization Service
export const categorizationService = {
  // Kategorisasi pengeluaran menggunakan NLP
  categorizeExpense: async (description, amount) => {
    try {
      const response = await api.post('/categorization/categorize', {
        description,
        amount,
      });
      return response.data;
    } catch (error) {
      console.error('Error categorizing expense:', error);
      throw error;
    }
  },

  // Dapatkan saran kategori
  getSuggestions: async (text) => {
    try {
      const response = await api.post('/categorization/suggestions', { text });
      return response.data;
    } catch (error) {
      console.error('Error getting suggestions:', error);
      throw error;
    }
  },
};

// Expense Service
export const expenseService = {
  // Ambil semua pengeluaran
  getExpenses: async (filters = {}) => {
    try {
      const response = await api.get('/expenses', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  },

  // Tambah pengeluaran baru
  addExpense: async (expenseData) => {
    try {
      const response = await api.post('/expenses', expenseData);
      return response.data;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  },

  // Update pengeluaran
  updateExpense: async (id, expenseData) => {
    try {
      const response = await api.put(`/expenses/${id}`, expenseData);
      return response.data;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  },

  // Hapus pengeluaran
  deleteExpense: async (id) => {
    try {
      const response = await api.delete(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  },

  // Ambil statistik pengeluaran
  getStats: async (period = 'month') => {
    try {
      const response = await api.get('/expenses/stats', { params: { period } });
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },
};

// Budget Service
export const budgetService = {
  // Ambil budget
  getBudgets: async () => {
    try {
      const response = await api.get('/budgets');
      return response.data;
    } catch (error) {
      console.error('Error fetching budgets:', error);
      throw error;
    }
  },

  // Update budget
  updateBudget: async (category, limit) => {
    try {
      const response = await api.put(`/budgets/${category}`, { limit });
      return response.data;
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  },
};

export default api;
