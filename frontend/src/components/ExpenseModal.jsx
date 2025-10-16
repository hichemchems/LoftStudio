import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ExpenseModal.css';

const ExpenseModal = ({ isOpen, onClose }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: ''
  });

  const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    if (isOpen) {
      fetchExpenses();
    }
  }, [isOpen]);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/dashboard/expenses`);
      setExpenses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError('Erreur lors du chargement des charges');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dataToSend = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (editingExpense) {
        await axios.put(`${API_URL}/dashboard/expenses/${editingExpense.id}`, dataToSend);
      } else {
        await axios.post(`${API_URL}/dashboard/expenses`, dataToSend);
      }

      await fetchExpenses();
      resetForm();
      setShowCreateForm(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Error saving expense:', error);
      setError(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date,
      category: expense.category || ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (expense) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer cette charge "${expense.description}" ?`)) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/dashboard/expenses/${expense.id}`);
      await fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      setError('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h2>Gestion des charges</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}

          <div className="expense-summary">
            <div className="summary-card">
              <h3>Total des charges</h3>
              <p className="total-amount">{formatCurrency(getTotalExpenses())}</p>
            </div>
          </div>

          <div className="modal-actions">
            <button
              onClick={() => {
                resetForm();
                setEditingExpense(null);
                setShowCreateForm(!showCreateForm);
              }}
              className="action-button primary"
            >
              {showCreateForm ? 'Annuler' : '+ Nouvelle charge'}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleSubmit} className="expense-form">
              <h3>{editingExpense ? 'Modifier la charge' : 'Enregistrer une nouvelle charge'}</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="description">Description *</label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: Fournitures de coiffure"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="amount">Montant (€) *</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="Ex: 150.00"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date *</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Catégorie</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="fournitures">Fournitures</option>
                    <option value="loyer">Loyer</option>
                    <option value="utilities">Utilitaires</option>
                    <option value="marketing">Marketing</option>
                    <option value="autres">Autres</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)} className="cancel-button">
                  Annuler
                </button>
                <button type="submit" disabled={loading} className="submit-button">
                  {loading ? 'Sauvegarde...' : (editingExpense ? 'Modifier' : 'Enregistrer')}
                </button>
              </div>
            </form>
          )}

          <div className="expenses-list">
            <h3>Charges enregistrées</h3>
            {loading && !showCreateForm ? (
              <div className="loading">Chargement des charges...</div>
            ) : expenses.length > 0 ? (
              <div className="expenses-table">
                <div className="table-header">
                  <span>Description</span>
                  <span>Montant</span>
                  <span>Date</span>
                  <span>Catégorie</span>
                  <span>Actions</span>
                </div>
                {expenses.map((expense) => (
                  <div key={expense.id} className="table-row">
                    <span className="expense-description">{expense.description}</span>
                    <span>{formatCurrency(expense.amount)}</span>
                    <span>{formatDate(expense.date)}</span>
                    <span className="category">{expense.category || 'Non catégorisé'}</span>
                    <span className="actions">
                      <button onClick={() => handleEdit(expense)} className="edit-button">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(expense)} className="delete-button">
                        🗑️
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">Aucune charge enregistrée pour le moment</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;
