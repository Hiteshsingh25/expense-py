import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Trash2, Wallet, DollarSign, Database, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/expenses';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setError(null);
      const res = await axios.get(API_URL);
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
      setError('Could not connect to Flask backend. Please ensure backend is running.');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    setLoading(true);
    try {
      const res = await axios.post(API_URL, {
        title,
        amount: parseFloat(amount),
        category: category || 'General'
      });
      setExpenses([res.data, ...expenses]);
      setTitle('');
      setAmount('');
      setCategory('General');
    } catch (err) {
      console.error(err);
      setError('Failed to add expense. Check database connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setExpenses(expenses.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete expense.');
    }
  };

  const totalAmount = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div className="app-container">
      <header className="header">
        <h1>Expense Tracker</h1>
        <p>Flask & PostgreSQL Integration</p>
        <div className="badge-pg">
          <Database size={14} /> PostgreSQL Connected
        </div>
      </header>

      {error && (
        <div className="alert-banner alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Spent</h3>
            <div className="amount">${totalAmount.toFixed(2)}</div>
          </div>
          <DollarSign size={32} color="#34d399" />
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Items</h3>
            <div className="amount">{expenses.length}</div>
          </div>
          <Wallet size={32} color="#38bdf8" />
        </div>
      </div>

      <main className="main-content">
        <div className="glass-panel">
          <h2 className="panel-title">
            <PlusCircle size={20} color="#38bdf8" /> Add Expense
          </h2>
          <form onSubmit={handleAddExpense} className="expense-form">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Groceries"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Amount ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="General">General</option>
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
                <option value="Bills">Bills</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </form>
        </div>

        <div className="glass-panel">
          <h2 className="panel-title">Recent Transactions</h2>
          {expenses.length === 0 ? (
            <div className="empty-state">No expenses added yet.</div>
          ) : (
            <div className="expense-list">
              {expenses.map((expense) => (
                <div key={expense.id} className="expense-item">
                  <div className="item-left">
                    <span className="item-title">{expense.title}</span>
                    <span className="category-tag">{expense.category}</span>
                  </div>
                  <div className="item-right">
                    <span className="item-amount">${Number(expense.amount).toFixed(2)}</span>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="btn-delete"
                      title="Delete expense"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
