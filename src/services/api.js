import axios from 'axios';
import { Wallet, PiggyBank, Plane, Heart, Home, ShoppingBag, Utensils, ShoppingCart, Banknote, HelpCircle } from 'lucide-react';

const API_BASE_URL = 'https://web-production-d907c.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject Token via Request Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Lucide Icon Bindings Map
const iconMap = {
  Wallet,
  PiggyBank,
  Plane,
  Heart,
  Home,
  ShoppingBag,
  Utensils,
  ShoppingCart,
  Banknote,
  HelpCircle
};

const pocketColors = ['pocket-blue', 'pocket-yellow', 'pocket-green', 'pocket-orange', 'pocket-purple'];

// Schema Mapping Utility for Wallets/Budget Pockets
export const mapWalletToFrontend = (w, index = 0) => {
  const id = w.wallet_id || w.id || w._id;
  const title = w.name || w.title || 'Kantong';
  const balance = w.balance !== undefined ? Number(w.balance) : (w.amount !== undefined ? Number(w.amount) : (w.budget_limit !== undefined ? Number(w.budget_limit) : 0));
  const iconName = w.icon || w.iconName || 'Wallet';
  
  // Dynamic color selection based on index if color not provided
  const colorClass = w.color || w.colorClass || pocketColors[index % pocketColors.length];
  
  // Calculate progress dummy/mock or based on database limits
  const progress = w.progress !== undefined ? Number(w.progress) : 0;

  return {
    id,
    title,
    amount: `Rp ${balance.toLocaleString('id-ID')}`,
    balance, // raw number
    progress,
    colorClass,
    iconName,
    Icon: iconMap[iconName] || Wallet,
    createdAt: w.created_at || w.createdAt || null
  };
};

// Schema Mapping Utility for Transactions
export const mapTransactionToFrontend = (t) => {
  const id = t.transaction_id || t.id || t._id;
  const title = t.description || t.title || 'Transaksi';
  const amountVal = Number(t.amount || 0);
  const type = t.type || 'expense';
  const category = t.category || (t.wallet && (t.wallet.name || t.wallet.title)) || 'Lainnya';
  
  // Format Date String nicely
  let dateStr = 'Baru saja';
  if (t.date || t.createdAt) {
    const d = new Date(t.date || t.createdAt);
    if (!isNaN(d.getTime())) {
      dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }
  }

  // Lucide binding based on type & category
  let Icon = ShoppingCart;
  let iconClass = 'icon-white';
  if (type === 'income') {
    Icon = Banknote;
    iconClass = 'icon-green';
  } else {
    const catLower = category.toLowerCase();
    if (catLower.includes('makan') || catLower.includes('food') || catLower.includes('dining')) {
      Icon = Utensils;
      iconClass = 'icon-blue';
    } else if (catLower.includes('jalan') || catLower.includes('travel') || catLower.includes('vacation')) {
      Icon = Plane;
      iconClass = 'icon-yellow';
    } else if (catLower.includes('belanja') || catLower.includes('shopping')) {
      Icon = ShoppingBag;
      iconClass = 'icon-white';
    }
  }

  return {
    id,
    wallet_id: t.wallet_id || t.walletId,
    title,
    date: dateStr,
    amount: `${type === 'expense' ? '-' : '+'} Rp ${amountVal.toLocaleString('id-ID')}`,
    amountVal,
    category,
    type,
    Icon,
    iconClass,
    dateRaw: t.date || t.createdAt || new Date().toISOString()
  };
};

// Auth Service
export const authService = {
  register: async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { full_name: name, email, password });
      return response.data;
    } catch (error) {
      console.error('Error during register:', error);
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Persist auth tokens & active user info if available in response
      const data = response.data.data || response.data;
      if (data.token || data.accessToken) {
        localStorage.setItem('token', data.token || data.accessToken);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }
};

// Request deduplication cache for parallel/concurrent GET requests (e.g. React StrictMode)
const activeRequests = new Map();

const getDeduplicated = (url, config = {}) => {
  const serializedParams = config.params ? JSON.stringify(config.params) : '';
  const key = `${url}?${serializedParams}`;

  if (activeRequests.has(key)) {
    return activeRequests.get(key);
  }

  const promise = api.get(url, config)
    .then(response => {
      activeRequests.delete(key);
      return response;
    })
    .catch(error => {
      activeRequests.delete(key);
      throw error;
    });

  activeRequests.set(key, promise);
  return promise;
};

// Wallet/Pockets Service
export const walletService = {
  getAll: async () => {
    try {
      const response = await getDeduplicated('/wallets');
      const list = response.data.data || response.data || [];
      return list.map((w, idx) => mapWalletToFrontend(w, idx));
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw error;
    }
  },

  create: async (walletData) => {
    try {
      const budgetLimitVal = walletData.budget_limit !== undefined ? Number(walletData.budget_limit) : (walletData.balance !== undefined ? Number(walletData.balance) : (walletData.amount !== undefined ? Number(walletData.amount) : 0));
      const response = await api.post('/wallets', {
        name: walletData.name || walletData.title,
        budget_limit: budgetLimitVal
      });
      const resData = response.data.data || response.data;
      return mapWalletToFrontend(resData);
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  },

  update: async (id, walletData) => {
    try {
      const budgetLimitVal = walletData.budget_limit !== undefined ? Number(walletData.budget_limit) : (walletData.balance !== undefined ? Number(walletData.balance) : (walletData.amount !== undefined ? Number(walletData.amount) : 0));
      const response = await api.put(`/wallets/${id}`, {
        name: walletData.name || walletData.title,
        budget_limit: budgetLimitVal
      });
      const resData = response.data.data || response.data;
      return mapWalletToFrontend(resData);
    } catch (error) {
      console.error('Error updating wallet:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/wallets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting wallet:', error);
      throw error;
    }
  }
};

// Transactions Service
export const transactionService = {
  getAll: async (walletId = '', type = '') => {
    try {
      const params = {};
      if (walletId) params.wallet_id = walletId;
      if (type) params.type = type;

      const response = await getDeduplicated('/transactions', { params });
      const list = response.data.data || response.data || [];
      return list.map(t => mapTransactionToFrontend(t));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  create: async (txData) => {
    try {
      // payload: { wallet_id, amount, type, description, transaction_date, image_url, is_ocr }
      const todayStr = new Date().toISOString().split('T')[0];
      const response = await api.post('/transactions', {
        wallet_id: Number(txData.wallet_id || txData.walletId),
        amount: Number(txData.amount),
        type: txData.type || 'expense',
        description: txData.description || txData.title || 'Transaksi',
        transaction_date: txData.transaction_date || todayStr,
        image_url: txData.image_url || null,
        is_ocr: txData.is_ocr !== undefined ? !!txData.is_ocr : false
      });
      const resData = response.data.data || response.data;
      return mapTransactionToFrontend(resData);
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },

  get: async (id) => {
    try {
      const response = await api.get(`/transactions/${id}`);
      const resData = response.data.data || response.data;
      return mapTransactionToFrontend(resData);
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw error;
    }
  },

  update: async (id, txData) => {
    try {
      const response = await api.put(`/transactions/${id}`, txData);
      const resData = response.data.data || response.data;
      return mapTransactionToFrontend(resData);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }
};

// Scanner Service
export const scannerService = {
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

export default api;
