import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { walletService, transactionService } from '../services/api';

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [monthlyIncome, setMonthlyIncome] = useState(() => {
    const activeUserJson = localStorage.getItem('activeUser');
    if (activeUserJson) {
      try {
        const activeUser = JSON.parse(activeUserJson);
        if (activeUser.monthly_income !== undefined) return Number(activeUser.monthly_income);
        if (activeUser.monthlyIncome !== undefined) return Number(activeUser.monthlyIncome);
      } catch (e) {}
    }
    return 5000000;
  });
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const location = useLocation();

  // Sync token and monthlyIncome from localStorage when page navigation occurs
  useEffect(() => {
    const currentToken = localStorage.getItem('token');
    if (currentToken !== token) {
      setToken(currentToken);
    }

    const activeUserJson = localStorage.getItem('activeUser');
    if (activeUserJson) {
      try {
        const activeUser = JSON.parse(activeUserJson);
        const income = activeUser.monthly_income !== undefined ? Number(activeUser.monthly_income) : 
                       (activeUser.monthlyIncome !== undefined ? Number(activeUser.monthlyIncome) : 5000000);
        if (income !== monthlyIncome) {
          setMonthlyIncome(income);
        }
      } catch (e) {
        console.error("Gagal sinkronisasi data user di context:", e);
      }
    }
  }, [location.pathname, token, monthlyIncome]);

  // Load data from API when token is available
  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        setLoading(false);
        setExpenses([]);
        setWallets([]);
        setBudgets({
          'Makanan & Minuman': { limit: 500000, spent: 0 },
          'Transportasi': { limit: 300000, spent: 0 },
          'Hiburan': { limit: 200000, spent: 0 },
          'Utilitas': { limit: 500000, spent: 0 },
          'Kesehatan': { limit: 300000, spent: 0 },
          'Pendidikan': { limit: 400000, spent: 0 },
          'Lainnya': { limit: 200000, spent: 0 },
        });
        return;
      }

      try {
        setLoading(true);
        // Fetch wallets
        const fetchedWallets = await walletService.getAll();
        setWallets(fetchedWallets);

        // Fetch all transactions
        const allTransactions = await transactionService.getAll();
        
        // Convert transactions to expense format for backward compatibility
        const expensesList = allTransactions.map(tx => ({
          id: tx.id,
          date: new Date(tx.dateRaw || new Date()),
          description: tx.title,
          amount: tx.amountVal,
          category: tx.category,
          status: 'categorized',
          receipt: null,
          wallet_id: tx.wallet_id,
          type: tx.type
        }));
        
        setExpenses(expensesList);

        // Build budgets from wallets
        const budgetsMap = {};
        fetchedWallets.forEach(wallet => {
          if (wallet.budget_limit) {
            budgetsMap[wallet.title] = {
              limit: wallet.budget_limit,
              spent: wallet.budget_limit - wallet.balance
            };
          }
        });
        
        if (Object.keys(budgetsMap).length === 0) {
          // Fallback default categories if no wallets found
          setBudgets({
            'Makanan & Minuman': { limit: 500000, spent: 0 },
            'Transportasi': { limit: 300000, spent: 0 },
            'Hiburan': { limit: 200000, spent: 0 },
            'Utilitas': { limit: 500000, spent: 0 },
            'Kesehatan': { limit: 300000, spent: 0 },
            'Pendidikan': { limit: 400000, spent: 0 },
            'Lainnya': { limit: 200000, spent: 0 },
          });
        } else {
          setBudgets(budgetsMap);
        }
      } catch (error) {
        console.error('Error loading data from API:', error);
        // Fallback to empty state if API fails
        setExpenses([]);
        setBudgets({
          'Makanan & Minuman': { limit: 500000, spent: 0 },
          'Transportasi': { limit: 300000, spent: 0 },
          'Hiburan': { limit: 200000, spent: 0 },
          'Utilitas': { limit: 500000, spent: 0 },
          'Kesehatan': { limit: 300000, spent: 0 },
          'Pendidikan': { limit: 400000, spent: 0 },
          'Lainnya': { limit: 200000, spent: 0 },
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  const addExpense = useCallback((expense) => {
    const newExpense = {
      id: Math.max(...expenses.map(e => e.id), 0) + 1,
      date: new Date(),
      ...expense,
      status: 'pending'
    };
    setExpenses(prev => [newExpense, ...prev]);
    
    // Also create transaction via API if wallet_id is provided
    if (expense.wallet_id) {
      transactionService.create({
        wallet_id: expense.wallet_id,
        amount: expense.amount,
        type: expense.type || 'expense',
        description: expense.description || expense.title || 'Transaksi',
        transaction_date: new Date().toISOString().split('T')[0]
      }).catch(error => console.error('Error creating transaction:', error));
    }
    
    return newExpense;
  }, [expenses]);

  const updateExpense = useCallback((id, updates) => {
    setExpenses(prev =>
      prev.map(exp => (exp.id === id ? { ...exp, ...updates } : exp))
    );
  }, []);

  const categorizeExpense = useCallback((id, category) => {
    updateExpense(id, { category, status: 'categorized' });
    
    // Update budget spent
    setBudgets(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        spent: (prev[category]?.spent || 0) + (expenses.find(e => e.id === id)?.amount || 0)
      }
    }));
  }, [updateExpense, expenses]);

  const deleteExpense = useCallback((id) => {
    const expense = expenses.find(e => e.id === id);
    if (expense && expense.status === 'categorized') {
      setBudgets(prev => ({
        ...prev,
        [expense.category]: {
          ...prev[expense.category],
          spent: prev[expense.category].spent - expense.amount
        }
      }));
    }
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  }, [expenses]);

  const getTotalExpenses = useCallback(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  const getExpensesByCategory = useCallback(() => {
    const grouped = {};
    expenses.forEach(exp => {
      if (exp.status === 'categorized') {
        grouped[exp.category] = (grouped[exp.category] || 0) + exp.amount;
      }
    });
    return grouped;
  }, [expenses]);

  const getRemainingBudget = useCallback((category) => {
    const budget = budgets[category];
    if (!budget) return 0;
    return budget.limit - budget.spent;
  }, [budgets]);

  const value = {
    expenses,
    budgets,
    monthlyIncome,
    setMonthlyIncome,
    addExpense,
    updateExpense,
    categorizeExpense,
    deleteExpense,
    getTotalExpenses,
    getExpensesByCategory,
    getRemainingBudget,
    wallets,
    loading
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within ExpenseProvider');
  }
  return context;
};
