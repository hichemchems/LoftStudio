import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmployeeDetailsModal.css';

const EmployeeDetailsModal = ({ isOpen, onClose, employee }) => {
  const [activeTab, setActiveTab] = useState('today');
  const [detailedStats, setDetailedStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    if (isOpen && employee) {
      fetchDetailedStats();
    }
  }, [isOpen, employee, activeTab]);

  const fetchDetailedStats = async () => {
    if (!employee) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/employees/${employee.id}/detailed-stats?period=${activeTab}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setDetailedStats(response.data.data);
      } else {
        console.error('Failed to fetch detailed stats:', response.data.message);
        setDetailedStats(null);
      }
    } catch (error) {
      console.error('Error fetching detailed stats:', error);
      setDetailedStats(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <div className="employee-header-info">
            <div className="employee-avatar">
              {employee.avatar_url ? (
                <img
                  src={`http://localhost:3001${employee.avatar_url}`}
                  alt={`${employee.name} avatar`}
                />
              ) : (
                <div className="avatar-placeholder">
                  {employee.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2>{employee.name}</h2>
              <p className="employee-percentage">Commission: {employee.percentage}% sur HT</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="tabs">
            <button
              className={`tab-button ${activeTab === 'today' ? 'active' : ''}`}
              onClick={() => setActiveTab('today')}
            >
              Aujourd'hui
            </button>
            <button
              className={`tab-button ${activeTab === 'week' ? 'active' : ''}`}
              onClick={() => setActiveTab('week')}
            >
              Cette semaine
            </button>
            <button
              className={`tab-button ${activeTab === 'month' ? 'active' : ''}`}
              onClick={() => setActiveTab('month')}
            >
              Ce mois
            </button>
            <button
              className={`tab-button ${activeTab === 'year' ? 'active' : ''}`}
              onClick={() => setActiveTab('year')}
            >
              Cette année
            </button>
          </div>

          {loading ? (
            <div className="loading">Chargement des données...</div>
          ) : detailedStats ? (
            <div className="stats-content">
              <div className="stats-summary">
                <div className="summary-card">
                  <h3>Forfaits réalisés</h3>
                  <p className="summary-value">{detailedStats.totalPackages}</p>
                </div>
                <div className="summary-card">
                  <h3>CA généré (HT)</h3>
                  <p className="summary-value">{formatCurrency(detailedStats.totalRevenue)}</p>
                </div>
                <div className="summary-card">
                  <h3>Commission totale</h3>
                  <p className="summary-value commission">{formatCurrency(detailedStats.totalCommission)}</p>
                </div>
              </div>

              <div className="packages-list">
                <h3>Détail des forfaits</h3>
                <div className="packages-table">
                  <div className="table-header">
                    <span>Date</span>
                    <span>Client</span>
                    <span>Forfait</span>
                    <span>Prix HT</span>
                    <span>Commission</span>
                  </div>
                  {detailedStats.packages.map((pkg) => (
                    <div key={pkg.id} className="table-row">
                      <span>{formatDate(pkg.date)}</span>
                      <span>{pkg.client_name}</span>
                      <span>{pkg.package_name}</span>
                      <span>{formatCurrency(pkg.ht_price)}</span>
                      <span className="commission">{formatCurrency(pkg.commission)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-data">Aucune donnée disponible</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailsModal;
