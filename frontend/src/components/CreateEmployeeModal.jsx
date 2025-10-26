import axios from 'axios';
import { useState } from 'react';
import './CreateEmployeeModal.css';

const CreateEmployeeModal = ({ isOpen, onClose, onEmployeeCreated }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    percentage: ''
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('percentage', formData.percentage);

      if (photo) {
        formDataToSend.append('photo', photo);
      }

      const response = await axios.post(`${API_URL}/auth/create-employee`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        onEmployeeCreated(response.data.data.employee);
        onClose();
        setFormData({
          username: '',
          email: '',
          password: '',
          name: '',
          percentage: ''
        });
        setPhoto(null);
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      setError(error.response?.data?.message || 'Erreur lors de la création de l\'employé');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Créer un nouveau compte employé</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="employee-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Nom et Prénom *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              autoComplete="name"
              placeholder="Ex: Jean Dupont"
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              autoComplete="username"
              placeholder="Ex: jean_dupont"
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
              autoComplete="email"
              placeholder="Ex: jean.dupont@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              autoComplete="new-password"
              placeholder="Mot de passe sécurisé"
            />
          </div>

          <div className="form-group">
            <label htmlFor="percentage">Pourcentage de commission *</label>
            <input
              type="number"
              id="percentage"
              name="percentage"
              value={formData.percentage}
              onChange={handleInputChange}
              required
              min="0"
              max="100"
              step="0.1"
              autoComplete="off"
              placeholder="Ex: 15.5"
            />
            <small className="form-help">Pourcentage calculé sur le Hors Tax des forfaits</small>
          </div>

          <div className="form-group">
            <label htmlFor="photo">Photo de profil</label>
            <input
              type="file"
              id="photo"
              name="photo"
              onChange={handlePhotoChange}
              accept="image/*"
            />
            <small className="form-help">Formats acceptés: JPG, PNG, GIF</small>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Création...' : 'Créer l\'employé'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployeeModal;
