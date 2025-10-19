import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import PackageList from './PackageList';
import './EmployeeDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const EmployeeDashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    today: { totalPackages: 0, totalClients: 0, totalRevenue: 0, commission: 0 },
    week: { totalPackages: 0, totalClients: 0, totalRevenue: 0, commission: 0 },
    month: { totalPackages: 0, totalClients: 0, totalRevenue: 0, commission: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(() => {
    const saved = localStorage.getItem('selectedPackage');
    return saved ? JSON.parse(saved) : null;
  });
  const menuRef = useRef(null);

  const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

  const loadAllStats = useCallback(async () => {
    const fetchStats = async (period) => {
      try {
        // Use employee ID if available, otherwise use user ID for employees without employee record
        const employeeId = user.employee?.id || user.id;
        const response = await axios.get(`${API_URL}/employees/${employeeId}/stats?period=${period}`);
        return response.data.data;
      } catch (error) {
        console.error(`Failed to fetch ${period} stats:`, error);
        throw error;
      }
    };

    try {
      setLoading(true);
      setError(null);
      const [todayStats, weekStats, monthStats] = await Promise.all([
        fetchStats('today'),
        fetchStats('week'),
        fetchStats('month')
      ]);

      setStats({
        today: {
          totalPackages: todayStats.totalPackages,
          totalClients: todayStats.totalClients,
          totalRevenue: todayStats.totalRevenue,
          commission: todayStats.commission
        },
        week: {
          totalPackages: weekStats.totalPackages,
          totalClients: weekStats.totalClients,
          totalRevenue: weekStats.totalRevenue,
          commission: weekStats.commission
        },
        month: {
          totalPackages: monthStats.totalPackages,
          totalClients: monthStats.totalClients,
          totalRevenue: monthStats.totalRevenue,
          commission: monthStats.commission
        }
      });
    } catch {
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  }, [user, API_URL]);

  useEffect(() => {
    if (user && !isAdmin) {
      loadAllStats();

      // Check for date change every minute to ensure daily reset
      const checkDateChange = () => {
        const now = new Date();
        const currentDate = now.toDateString();

        // Store current date in localStorage to detect date changes
        const storedDate = localStorage.getItem('lastStatsDate');

        if (storedDate !== currentDate) {
          // Date has changed, reset today's stats and reload
          console.log('Date changed, resetting daily statistics');
          localStorage.setItem('lastStatsDate', currentDate);

          // Force reload of all stats to get fresh data
          loadAllStats();
        }
      };

      // Set initial date
      const now = new Date();
      localStorage.setItem('lastStatsDate', now.toDateString());

      // Check every minute for date changes
      const dateCheckInterval = setInterval(checkDateChange, 60 * 1000); // Check every minute

      return () => clearInterval(dateCheckInterval);
    }
  }, [user, isAdmin, loadAllStats]);

  // Close hamburger menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowHamburgerMenu(false);
      }
    };

    if (showHamburgerMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHamburgerMenu]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleHamburgerMenuToggle = () => {
    setShowHamburgerMenu(!showHamburgerMenu);
  };

  const handleMenuItemClick = (action) => {
    setShowHamburgerMenu(false);
    switch (action) {
      case 'choosePackage':
        setShowPackageModal(true);
        break;
      case 'viewToday':
        handlePeriodChange('today');
        break;
      case 'viewWeek':
        handlePeriodChange('week');
        break;
      case 'viewMonth':
        handlePeriodChange('month');
        break;
      default:
        break;
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handlePackageSelect = async (pkg) => {
    try {
      const employeeId = user.employee?.id || user.id;
      await axios.put(`${API_URL}/employees/${employeeId}/select-package`, {
        packageId: pkg.id
      });

      setSelectedPackage(pkg);
      localStorage.setItem('selectedPackage', JSON.stringify(pkg));
      setShowPackageModal(false);

      // Add a small delay to ensure the sale record is created before refreshing stats
      setTimeout(async () => {
        await loadAllStats();
      }, 500);
    } catch (error) {
      console.error('Failed to select package:', error);
      // Fallback to localStorage only
      setSelectedPackage(pkg);
      localStorage.setItem('selectedPackage', JSON.stringify(pkg));
      setShowPackageModal(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>Employee Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user?.name || user?.username}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </header>
        <main className="dashboard-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement de vos statistiques...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>Employee Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user?.name || user?.username}</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </header>
        <main className="dashboard-content">
          <div className="error-message">
            <h2>Erreur de chargement</h2>
            <p>{error}</p>
            <p>Il semble qu'il n'y ait pas encore de données de ventes dans le système.</p>
            <button onClick={loadAllStats} className="retry-btn">Réessayer</button>
          </div>
        </main>
      </div>
    );
  }

  const currentStats = stats[selectedPeriod];

  const chartData = {
    labels: ['Total Clients', 'Chiffre d\'Affaires', 'Commission'],
    datasets: [
      {
        label: `Statistiques pour ${selectedPeriod}`,
        data: [
          currentStats.totalClients,
          currentStats.totalRevenue || 0,
          currentStats.commission
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Statistiques Employé - ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Employee Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name || user?.username}</span>
          <button onClick={handleHamburgerMenuToggle} className="hamburger-btn">
            ☰
          </button>
        </div>
      </header>

      {/* Hamburger Menu */}
      {showHamburgerMenu && (
        <div className="hamburger-menu" ref={menuRef}>
          <button onClick={() => handleMenuItemClick('choosePackage')} className="menu-item">
            Choisir Forfait
          </button>
          <button onClick={() => handleMenuItemClick('viewToday')} className="menu-item">
            Voir Aujourd'hui
          </button>
          <button onClick={() => handleMenuItemClick('viewWeek')} className="menu-item">
            Voir Semaine
          </button>
          <button onClick={() => handleMenuItemClick('viewMonth')} className="menu-item">
            Voir Mois
          </button>
          <div className="menu-divider"></div>
          <button onClick={logout} className="menu-item logout-item">
            Déconnexion
          </button>
        </div>
      )}

      <main className="dashboard-content">
        {/* Selected Package Display */}
        {selectedPackage && (
          <div className="selected-package-card">
            <h3>Forfait Sélectionné</h3>
            <div className="package-info">
              <h4>{selectedPackage.name}</h4>
              <p className="price">€{selectedPackage.price}</p>
            </div>
          </div>
        )}

        {/* Stats Display */}
        <div className="employee-stats">
          <div className="stat-card">
            <h3>Total Clients</h3>
            <p className="stat-value">{currentStats.totalClients}</p>
            <span className="period-label">({selectedPeriod})</span>
          </div>
          <div className="stat-card">
            <h3>Chiffre d'Affaires</h3>
            <p className="stat-value revenue">{formatCurrency(currentStats.totalRevenue || 0)}</p>
            <span className="period-label">({selectedPeriod})</span>
          </div>
          <div className="stat-card">
            <h3>Commission</h3>
            <p className="stat-value commission">{formatCurrency(currentStats.commission)}</p>
            <span className="period-label">({selectedPeriod})</span>
          </div>
        </div>



        {/* Bar Chart */}
        <div className="chart-container">
          <Bar data={chartData} options={chartOptions} />
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

      {/* Package Selection Modal */}
      {showPackageModal && (
        <div className="modal-overlay">
          <div className="modal-content package-modal">
            <h3>Choisir un Forfait</h3>
            <PackageList isAdmin={false} onSelect={handlePackageSelect} />
            <div className="modal-actions">
              <button onClick={() => setShowPackageModal(false)} className="close-btn">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
