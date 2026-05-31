import React, { createContext, useContext, useState, useCallback } from 'react';

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      date: new Date('2026-05-01'),
      description: 'Makan Sate Padang',
      amount: 35000,
      category: 'Makanan & Minuman',
      status: 'categorized',
      receipt: null
    },
    {
      id: 2,
      date: new Date('2026-05-02'),
      description: 'Bensin',
      amount: 75000,
      category: 'Transportasi',
      status: 'categorized',
      receipt: null
    },
  ]);

  const [budgets, setBudgets] = useState({
    'Makanan & Minuman': { limit: 500000, spent: 35000 },
    'Transportasi': { limit: 300000, spent: 75000 },
    'Hiburan': { limit: 200000, spent: 0 },
    'Utilitas': { limit: 500000, spent: 0 },
    'Kesehatan': { limit: 300000, spent: 0 },
    'Pendidikan': { limit: 400000, spent: 0 },
    'Lainnya': { limit: 200000, spent: 0 },
  });

  const [monthlyIncome, setMonthlyIncome] = useState(5000000);

  const addExpense = useCallback((expense) => {
    const newExpense = {
      id: Math.max(...expenses.map(e => e.id), 0) + 1,
      date: new Date(),
      ...expense,
      status: 'pending'
    };
    setExpenses(prev => [newExpense, ...prev]);
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
