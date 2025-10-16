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
      // This would need a new backend endpoint to get detailed stats
      // For now, we'll simulate with the existing data structure
      const mockData = {
        today: {
          packages: [
            { id: 1, client_name: 'Marie Dubois', package_name: 'Coupe + brushing', ht_price: 45, commission: 6.75, date: '2025-01-16' },
            { id: 2, client_name: 'Sophie Martin', package_name: 'Coupe homme', ht_price: 25, commission: 3.75, date: '2025-01-16' }
          ],
          totalPackages: 2,
          totalRevenue: 70,
          totalCommission: 10.5
        },
        week: {
          packages: [
            { id: 1, client_name: 'Marie Dubois', package_name: 'Coupe + brushing', ht_price: 45, commission: 6.75, date: '2025-01-16' },
            { id: 2, client_name: 'Sophie Martin', package_name: 'Coupe homme', ht_price: 25, commission: 3.75, date: '2025-01-16' },
            { id: 3, client_name: 'Emma Bernard', package_name: 'Coupe + brushing', ht_price: 45, commission: 6.75, date: '2025-01-15' }
          ],
          totalPackages: 3,
          totalRevenue: 115,
          totalCommission: 17.25
        },
        month: {
          packages: Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            client_name: `Client ${i + 1}`,
            package_name: i % 2 === 0 ? 'Coupe + brushing' : 'Coupe homme',
            ht_price: i % 2 === 0 ? 45 : 25,
            commission: i % 2 === 0 ? 6.75 : 3.75,
            date: `2025-01-${String(i + 1).padStart(2, '0')}`
          })),
          totalPackages: 15,
          totalRevenue: 15 * 35, // Average price
          totalCommission: 15 * 5.25 // Average commission
        },
        year: {
          packages: Array.from({ length: 180 }, (_, i) => ({
            id: i + 1,
            client_name: `Client ${i + 1}`,
            package_name: i % 3 === 0 ? 'Coupe + brushing' : i % 3 === 1 ? 'Coupe homme' : 'Couleur',
            ht_price: i % 3 === 0 ? 45 : i % 3 === 1 ? 25 : 80,
            commission: i % 3 === 0 ? 6.75 : i % 3 === 1 ? 3.75 : 12,
            date: `2025-${String(Math.floor(i / 15) + 1).padStart(2, '0')}-${String((i % 15) + 1).padStart(2, '0')}`
          })),
          totalPackages: 180,
          totalRevenue: 180 * 50, // Average price
          totalCommission: 180 * 7.5 // Average commission
        }
      };

      setDetailedStats(mockData[activeTab]);
    } catch (error) {
      console.error('Error fetching detailed stats:', error);
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
