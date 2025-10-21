import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import './AdminDashboard.css';
import CreateEmployeeModal from './CreateEmployeeModal';
import EmployeeCard from './EmployeeCard';
import EmployeeDetailsModal from './EmployeeDetailsModal';
import EmployeeManagementModal from './EmployeeManagementModal';
import ExpenseModal from './ExpenseModal';
import PackageManagementModal from './PackageManagementModal';
import StatisticsModal from './StatisticsModal';
import AnnualProfitModal from './AnnualProfitModal';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeDetailsModal, setShowEmployeeDetailsModal] = useState(false);
  const [showPackageManagementModal, setShowPackageManagementModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);
  const [showEmployeeManagementModal, setShowEmployeeManagementModal] = useState(false);
  const [showAnnualProfitModal, setShowAnnualProfitModal] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const menuRef = useRef(null);

  const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';
  const socketRef = useRef(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      console.log('AdminDashboard - Fetching dashboard data from:', `${API_URL}/dashboard`);
      const response = await axios.get(`${API_URL}/dashboard`);
      console.log('AdminDashboard - Dashboard data fetched:', response.data);
      setDashboardData(response.data);

      // Fetch employees data
      const employeesResponse = await axios.get(`${API_URL}/employees`);
      console.log('AdminDashboard - Employees data fetched:', employeesResponse.data);
      setEmployees(employeesResponse.data.data || []);
    } catch (error) {
      console.error('AdminDashboard - Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    console.log('AdminDashboard - User data:', user);
    fetchDashboardData();

    // Set up socket connection for real-time updates
    if (user && user.id) {
      const socketUrl = import.meta.env.REACT_APP_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
      socketRef.current = io(socketUrl);

      socketRef.current.emit('join-dashboard', user.id);

      socketRef.current.on('dashboard-data-updated', () => {
        console.log('AdminDashboard - Real-time update received, refreshing data');
        fetchDashboardData();
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user, fetchDashboardData]);

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

  const handleLogout = () => {
    console.log('AdminDashboard - Logout clicked');
    logout();
  };

  const handleHamburgerMenuToggle = () => {
    setShowHamburgerMenu(!showHamburgerMenu);
  };

  const handleMenuItemClick = (action) => {
    setShowHamburgerMenu(false);
    switch (action) {
      case 'dashboard':
        // Already on dashboard
        break;
      case 'createEmployee':
        setShowCreateEmployeeModal(true);
        break;
      case 'manageEmployees':
        setShowEmployeeManagementModal(true);
        break;
      case 'managePackages':
        setShowPackageManagementModal(true);
        break;
      case 'expenses':
        setShowExpenseModal(true);
        break;
      case 'statistics':
        setShowStatisticsModal(true);
        break;
      case 'annualProfit':
        setShowAnnualProfitModal(true);
        break;
      default:
        break;
    }
  };

  const handleEmployeeCreated = (newEmployee) => {
    setEmployees(prev => [...prev, newEmployee]);
    fetchDashboardData(); // Refresh dashboard data
  };

  const handleEmployeeUpdated = () => {
    fetchDashboardData(); // Refresh dashboard data when employee data changes
  };

  const handleEmployeeCardClick = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name || user?.email}</span>
          <button onClick={handleHamburgerMenuToggle} className="hamburger-btn">
            ☰
          </button>
        </div>
      </header>

      {/* Hamburger Menu */}
      {showHamburgerMenu && (
        <div className="hamburger-menu" ref={menuRef}>
          <button onClick={() => handleMenuItemClick('dashboard')} className="menu-item">
            Dashboard Admin
          </button>
          <button onClick={() => handleMenuItemClick('createEmployee')} className="menu-item">
            Créer Employé
          </button>
          <button onClick={() => handleMenuItemClick('manageEmployees')} className="menu-item">
            Gestion des Employés
          </button>
          <button onClick={() => handleMenuItemClick('managePackages')} className="menu-item">
            Gestion des Forfaits
          </button>
          <button onClick={() => handleMenuItemClick('expenses')} className="menu-item">
            Charges
          </button>
          <button onClick={() => handleMenuItemClick('statistics')} className="menu-item">
            Statistiques
          </button>
          <button onClick={() => handleMenuItemClick('annualProfit')} className="menu-item">
            Bénéfices Annuels
          </button>
          <div className="menu-divider"></div>
          <button onClick={handleLogout} className="menu-item logout-item">
            Déconnexion
          </button>
        </div>
      )}

      <div className="dashboard-content">


        {/* Dashboard Stats */}
        {dashboardData && dashboardData.data ? (
          <div className="dashboard-stats">
            <div className="stat-card" >
              <h3>Chiffre d'Affaires</h3>
              <p className="stat-value">€{dashboardData.data.summary?.turnover || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Bénéfice</h3>
              <p className="stat-value">€{dashboardData.data.summary?.profit || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Employés</h3>
              <p className="stat-value">{dashboardData.data.summary?.employeeCount || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Forfaits Actifs</h3>
              <p className="stat-value">{dashboardData.data.summary?.packageCount || 0}</p>
            </div>
          </div>
        ) : (
          <div className="no-data">
            <p>Aucune donnée disponible</p>
          </div>
        )}

        {/* Employees Section */}
        <div className="employees-section">
          <h2>Équipe</h2>
          {employees.length > 0 ? (
            <div className="employees-grid">
              {employees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onCardClick={handleEmployeeCardClick}
                />
              ))}
            </div>
          ) : (
            <div className="no-employees">
              <p>Aucun employé enregistré</p>
              <button onClick={() => setShowCreateEmployeeModal(true)} className="create-employee-button">
                Créer le premier employé
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateEmployeeModal
        isOpen={showCreateEmployeeModal}
        onClose={() => setShowCreateEmployeeModal(false)}
        onEmployeeCreated={handleEmployeeCreated}
      />

      <EmployeeDetailsModal
        isOpen={showEmployeeDetailsModal}
        onClose={() => setShowEmployeeDetailsModal(false)}
        employee={selectedEmployee}
      />

      <PackageManagementModal
        isOpen={showPackageManagementModal}
        onClose={() => setShowPackageManagementModal(false)}
      />

      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
      />

      <StatisticsModal
        isOpen={showStatisticsModal}
        onClose={() => setShowStatisticsModal(false)}
      />

      <EmployeeManagementModal
        isOpen={showEmployeeManagementModal}
        onClose={() => setShowEmployeeManagementModal(false)}
        onEmployeeUpdated={handleEmployeeUpdated}
      />

      <AnnualProfitModal
        isOpen={showAnnualProfitModal}
        onClose={() => setShowAnnualProfitModal(false)}
      />
    </div>
  );
};

export default AdminDashboard;
