import axios from 'axios';
import { useEffect, useState } from 'react';
import './PackageManagementModal.css';

const PackageManagementModal = ({ isOpen, onClose }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    duration_minutes: '',
    is_active: true
  });

  const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/packages`);
      setPackages(response.data.data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError('Erreur lors du chargement des forfaits');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes)
      };

      if (editingPackage) {
        await axios.put(`${API_URL}/packages/${editingPackage.id}`, dataToSend);
      } else {
        await axios.post(`${API_URL}/packages`, dataToSend);
      }

      await fetchPackages();
      resetForm();
      setShowCreateForm(false);
      setEditingPackage(null);
    } catch (error) {
      console.error('Error saving package:', error);
      setError(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      price: pkg.price.toString(),
      description: pkg.description || '',
      duration_minutes: pkg.duration_minutes.toString(),
      is_active: pkg.is_active
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (pkg) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le forfait "${pkg.name}" ?`)) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/packages/${pkg.id}`);
      await fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      setError('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (pkg) => {
    setLoading(true);
    try {
      await axios.put(`${API_URL}/packages/${pkg.id}`, {
        ...pkg,
        is_active: !pkg.is_active
      });
      await fetchPackages();
    } catch (error) {
      console.error('Error toggling package status:', error);
      setError('Erreur lors de la modification du statut');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      duration_minutes: '',
      is_active: true
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h2>Gestion des forfaits</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button
              onClick={() => {
                resetForm();
                setEditingPackage(null);
                setShowCreateForm(!showCreateForm);
              }}
              className="action-button primary"
            >
              {showCreateForm ? 'Annuler' : '+ Nouveau forfait'}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleSubmit} className="package-form">
              <h3>{editingPackage ? 'Modifier le forfait' : 'Créer un nouveau forfait'}</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nom du forfait *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    autoComplete="off"
                    placeholder="Ex: Coupe + brushing"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price">Prix HT (€) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    autoComplete="off"
                    placeholder="Ex: 45.00"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="duration_minutes">Durée (minutes) *</label>
                  <input
                    type="number"
                    id="duration_minutes"
                    name="duration_minutes"
                    value={formData.duration_minutes}
                    onChange={handleInputChange}
                    required
                    min="1"
                    autoComplete="off"
                    placeholder="Ex: 60"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    Forfait actif
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  autoComplete="off"
                  placeholder="Description optionnelle du forfait"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateForm(false)} className="cancel-button">
                  Annuler
                </button>
                <button type="submit" disabled={loading} className="submit-button">
                  {loading ? 'Sauvegarde...' : (editingPackage ? 'Modifier' : 'Créer')}
                </button>
              </div>
            </form>
          )}

          <div className="packages-list">
            <h3>Forfaits existants</h3>
            {loading && !showCreateForm ? (
              <div className="loading">Chargement des forfaits...</div>
            ) : packages.length > 0 ? (
              <div className="packages-table">
                <div className="table-header">
                  <span>Nom</span>
                  <span>Prix HT</span>
                  <span>Durée</span>
                  <span>Statut</span>
                  <span>Actions</span>
                </div>
                {packages.map((pkg) => (
                  <div key={pkg.id} className="table-row">
                    <span className="package-name">{pkg.name}</span>
                    <span>{formatCurrency(pkg.price)}</span>
                    <span>{pkg.duration_minutes} min</span>
                    <span>
                      <button
                        onClick={() => handleToggleActive(pkg)}
                        className={`status-button ${pkg.is_active ? 'active' : 'inactive'}`}
                      >
                        {pkg.is_active ? 'Actif' : 'Inactif'}
                      </button>
                    </span>
                    <span className="actions">
                      <button onClick={() => handleEdit(pkg)} className="edit-button">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(pkg)} className="delete-button">
                        🗑️
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">Aucun forfait créé pour le moment</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageManagementModal;
