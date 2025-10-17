import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    today: { totalPackages: 0, totalClients: 0, commission: 0 },
    week: { totalPackages: 0, totalClients: 0, commission: 0 },
    month: { totalPackages: 0, totalClients: 0, commission: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [showPackageModal, setShowPackageModal] = useState(false);

  const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

  const fetchStats = async (period) => {
    try {
      const response = await axios.get(`${API_URL}/employees/${user.employee.id}/stats?period=${period}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch ${period} stats:`, error);
      throw error;
    }
  };

  const loadAllStats = async () => {
    try {
      setLoading(true);
      const [todayStats, weekStats, monthStats] = await Promise.all([
        fetchStats('today'),
        fetchStats('week'),
        fetchStats('month')
      ]);

      setStats({
        today: {
          totalPackages: todayStats.totalPackages,
          totalClients: todayStats.totalClients,
          commission: todayStats.commission
        },
        week: {
          totalPackages: weekStats.totalPackages,
          totalClients: weekStats.totalClients,
          commission: weekStats.commission
        },
        month: {
          totalPackages: monthStats.totalPackages,
          totalClients: monthStats.totalClients,
          commission: monthStats.commission
        }
      });
    } catch (error) {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.employee?.id) {
      loadAllStats();
    }
  }, [user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleChoosePackage = () => {
    setShowPackageModal(true);
  };

  const handleViewPackages = (period) => {
    // TODO: Implement package viewing modal
    console.log(`Viewing packages for ${period}`);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const currentStats = stats[selectedPeriod];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Employee Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.employee?.name || user?.username}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        {/* Stats Display */}
        <div className="employee-stats">
          <div className="stat-card">
            <h3>Total Forfaits</h3>
            <p className="stat-value">{currentStats.totalPackages}</p>
            <span className="period-label">({selectedPeriod})</span>
          </div>
          <div className="stat-card">
            <h3>Total Clients</h3>
            <p className="stat-value">{currentStats.totalClients}</p>
            <span className="period-label">({selectedPeriod})</span>
          </div>
          <div className="stat-card">
            <h3>Commission</h3>
            <p className="stat-value commission">{formatCurrency(currentStats.commission)}</p>
            <span className="period-label">({selectedPeriod})</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="dashboard-actions">
          <button
            className="action-button primary"
            onClick={handleChoosePackage}
          >
            Choisir Forfait
          </button>
          <button
            className="action-button secondary"
            onClick={() => handleViewPackages('today')}
          >
            Voir Aujourd'hui
          </button>
          <button
            className="action-button secondary"
            onClick={() => handleViewPackages('week')}
          >
            Voir Semaine
          </button>
          <button
            className="action-button secondary"
            onClick={() => handleViewPackages('month')}
          >
            Voir Mois
          </button>
        </div>

        {/* Period Selector */}
        <div className="period-selector">
          <h3>Période</h3>
          <div className="period-buttons">
            <button
              className={selectedPeriod === 'today' ? 'active' : ''}
              onClick={() => handlePeriodChange('today')}
            >
              Aujourd'hui
            </button>
            <button
              className={selectedPeriod === 'week' ? 'active' : ''}
              onClick={() => handlePeriodChange('week')}
            >
              Semaine
            </button>
            <button
              className={selectedPeriod === 'month' ? 'active' : ''}
              onClick={() => handlePeriodChange('month')}
            >
              Mois
            </button>
          </div>
        </div>
      </main>

      {/* Package Selection Modal - TODO: Implement */}
      {showPackageModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Choisir un Forfait</h3>
            <p>Fonctionnalité à implémenter</p>
            <button onClick={() => setShowPackageModal(false)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
