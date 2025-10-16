import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './EmployeeManagementModal.css';

const EmployeeManagementModal = ({ isOpen, onClose, onEmployeeUpdated }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    percentage: '',
    password: ''
  });

  const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/employees`);
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Erreur lors du chargement des employés');
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

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      username: employee.user?.username || '',
      email: employee.user?.email || '',
      name: employee.name || '',
      percentage: employee.percentage?.toString() || '',
      password: '' // Don't prefill password
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dataToSend = {
        ...formData,
        percentage: parseFloat(formData.percentage) || 0
      };

      // Remove password if empty (for updates)
      if (!dataToSend.password) {
        delete dataToSend.password;
      }

      if (editingEmployee) {
        // Update existing employee
        await axios.put(`${API_URL}/employees/${editingEmployee.id}`, dataToSend);
      }

      await fetchEmployees();
      onEmployeeUpdated();
      resetForm();
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error saving employee:', error);
      setError(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employee) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le compte "${employee.name}" ? Cette action est irréversible.`)) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/employees/${employee.id}`);
      await fetchEmployees();
      onEmployeeUpdated();
    } catch (error) {
      console.error('Error deleting employee:', error);
      setError('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      name: '',
      percentage: '',
      password: ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h2>Gestion des comptes employés</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}

          <div className="employee-summary">
            <div className="summary-card">
              <h3>Total employés</h3>
              <p className="total-count">{employees.length}</p>
            </div>
          </div>

          {editingEmployee && (
            <form onSubmit={handleSubmit} className="employee-form">
              <h3>Modifier le compte employé</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username">Nom d'utilisateur *</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    placeholder="nom_utilisateur"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="email@exemple.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nom complet *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Prénom Nom"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="percentage">Pourcentage (%)</label>
                  <input
                    type="number"
                    id="percentage"
                    name="percentage"
                    value={formData.percentage}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="Ex: 10.5"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Nouveau mot de passe (laisser vide pour garder l'actuel)</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Nouveau mot de passe"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => {
                  resetForm();
                  setEditingEmployee(null);
                }} className="cancel-button">
                  Annuler
                </button>
                <button type="submit" disabled={loading} className="submit-button">
                  {loading ? 'Sauvegarde...' : 'Modifier'}
                </button>
              </div>
            </form>
          )}

          <div className="employees-list">
            <h3>Comptes employés</h3>
            {loading && !editingEmployee ? (
              <div className="loading">Chargement des employés...</div>
            ) : employees.length > 0 ? (
              <div className="employees-table">
                <div className="table-header">
                  <span>Nom</span>
                  <span>Utilisateur</span>
                  <span>Email</span>
                  <span>Pourcentage</span>
                  <span>Date création</span>
                  <span>Actions</span>
                </div>
                {employees.map((employee) => (
                  <div key={employee.id} className="table-row">
                    <span className="employee-name">{employee.name}</span>
                    <span>{employee.user?.username}</span>
                    <span>{employee.user?.email}</span>
                    <span>{employee.percentage ? `${employee.percentage}%` : 'N/A'}</span>
                    <span>{formatDate(employee.created_at)}</span>
                    <span className="actions">
                      <button onClick={() => handleEdit(employee)} className="edit-button">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(employee)} className="delete-button">
                        🗑️
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">Aucun employé enregistré</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagementModal;
