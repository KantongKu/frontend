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

// Auto-detect Token Expiration / Unauthorized Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Sesi kedaluwarsa atau tidak sah (401). Mengalihkan ke login...');
      localStorage.removeItem('token');
      localStorage.removeItem('activeUser');
      localStorage.removeItem('last_activity');
      window.location.hash = '/login';
    }
    return Promise.reject(error);
  }
);

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
  // Priority: current_balance > balance > budget_limit > amount
  const balance = w.current_balance !== undefined ? Number(w.current_balance) : 
                  (w.balance !== undefined ? Number(w.balance) : 
                  (w.budget_limit !== undefined ? Number(w.budget_limit) : 
                  (w.amount !== undefined ? Number(w.amount) : 0)));
  const iconName = w.icon || w.iconName || 'Wallet';
  
  // Dynamic color selection based on index if color not provided
  const colorClass = w.color || w.colorClass || pocketColors[index % pocketColors.length];
  
  // Calculate progress: (spent / budget_limit) * 100
  let progress = 0;
  if (w.budget_limit && w.current_balance !== undefined) {
    const spent = Number(w.budget_limit) - Number(w.current_balance);
    progress = Math.min(Math.round((spent / Number(w.budget_limit)) * 100), 100);
  } else if (w.progress !== undefined) {
    progress = Number(w.progress);
  }

  return {
    id,
    title,
    amount: `Rp ${balance.toLocaleString('id-ID')}`,
    balance, // raw number
    progress,
    colorClass,
    iconName,
    Icon: iconMap[iconName] || Wallet,
    createdAt: w.created_at || w.createdAt || null,
    budget_limit: w.budget_limit ? Number(w.budget_limit) : undefined
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
    dateRaw: t.date || t.createdAt || new Date().toISOString(),
    image_url: t.image_url || t.imageUrl || t.bukti || t.image || null
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

// User Service
export const userService = {
  getProfile: async () => {
    try {
      // Try to fetch from API first - use /auth/profile endpoint
      const response = await getDeduplicated('/auth/profile');
      const profileData = response.data.data || response.data;
      // Save to localStorage for persistence
      localStorage.setItem('activeUser', JSON.stringify(profileData));
      return profileData;
    } catch (error) {
      console.error('Error fetching profile from API:', error);
      // Fallback to localStorage if API endpoint not available
      const activeUserJson = localStorage.getItem('activeUser');
      if (activeUserJson) {
        return JSON.parse(activeUserJson);
      }
      throw new Error('Profile tidak tersedia');
    }
  },

  updateProfile: async (updateData) => {
    try {
      // Prepare request data - use FormData if avatar file exists
      let requestData = updateData;
      let config = undefined;

      if (updateData.avatar) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('full_name', updateData.full_name || '');
        if (updateData.avatar) {
          formData.append('avatar', updateData.avatar);
        }
        requestData = formData;
        config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        };
      }

      // Try to update via API first - use /auth/profile endpoint
      const response = await api.put('/auth/profile', requestData, config);
      const profileData = response.data.data || response.data;
      // Update localStorage
      localStorage.setItem('activeUser', JSON.stringify(profileData));
      return profileData;
    } catch (error) {
      console.error('Error updating profile via API:', error);
      // Fallback: Update only in localStorage if API endpoint not available
      const activeUserJson = localStorage.getItem('activeUser');
      if (activeUserJson) {
        const activeUser = JSON.parse(activeUserJson);
        const updatedUser = {
          ...activeUser,
          full_name: updateData.full_name || activeUser.full_name,
          email: updateData.email || activeUser.email
          // Note: avatar file can't be stored in localStorage, only URL from API response
        };
        localStorage.setItem('activeUser', JSON.stringify(updatedUser));
        return updatedUser;
      }
      throw new Error('Gagal memperbarui profil');
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
      // Handle different response formats from backend
      let list = response.data.data || response.data.wallets || response.data || [];
      
      // Ensure list is always an array
      if (!Array.isArray(list)) {
        console.warn('Wallet API response is not an array:', list);
        list = [];
      }
      
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
      let list = response.data.data || response.data || [];
      
      // Ensure list is always an array
      if (!Array.isArray(list)) {
        console.warn('Transaction API response is not an array:', list);
        list = [];
      }
      
      return list.map(t => mapTransactionToFrontend(t));
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  create: async (txData) => {
    try {
      // payload: { wallet_id, amount, type, description, transaction_date, image_url, is_ocr, receiptImage }
      const todayStr = new Date().toISOString().split('T')[0];
      
      // If receipt image is provided, use FormData for multipart upload
      if (txData.receiptImage) {
        const formData = new FormData();
        formData.append('wallet_id', Number(txData.wallet_id || txData.walletId));
        formData.append('amount', Number(txData.amount));
        formData.append('type', txData.type || 'expense');
        formData.append('description', txData.description || txData.title || 'Transaksi');
        formData.append('transaction_date', txData.transaction_date || todayStr);
        formData.append('is_ocr', txData.is_ocr !== undefined ? !!txData.is_ocr : false);
        formData.append('image', txData.receiptImage);
        
        const response = await api.post('/transactions', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        const resData = response.data.data || response.data;
        return mapTransactionToFrontend(resData);
      } else {
        // Standard JSON request without image
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
      }
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
      console.log('Calling OCR API with file:', imageFile.name || imageFile.size, 'bytes');
      const response = await api.post('/scanner/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('OCR API raw response:', response);
      
      // Validate response status
      if (!response || !response.data) {
        throw new Error('Response kosong dari server');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error extracting data:', error);
      console.error('Error details:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Gagal menghubungi server OCR');
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
