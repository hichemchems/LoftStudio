import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import CreateEmployeeModal from './CreateEmployeeModal';
import EmployeeCard from './EmployeeCard';
import EmployeeDetailsModal from './EmployeeDetailsModal';
import PackageManagementModal from './PackageManagementModal';
import ExpenseModal from './ExpenseModal';
import StatisticsModal from './StatisticsModal';

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

  const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

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
  }, [user, fetchDashboardData]);

  const handleLogout = () => {
    console.log('AdminDashboard - Logout clicked');
    logout();
  };

  const handleCreateEmployee = () => {
    setShowCreateEmployeeModal(true);
  };

  const handleEmployeeCreated = (newEmployee) => {
    setEmployees(prev => [...prev, newEmployee]);
    fetchDashboardData(); // Refresh dashboard data
  };

  const handleEmployeeCardClick = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetailsModal(true);
  };

  const handlePackageManagement = () => {
    setShowPackageManagementModal(true);
  };

  const handleRecordExpense = () => {
    setShowExpenseModal(true);
  };

  const handleViewStatistics = () => {
    setShowStatisticsModal(true);
  };

  const handleViewCharts = () => {
    setShowStatisticsModal(true);
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
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Action Buttons */}
        <div className="dashboard-actions">
          <button onClick={handleCreateEmployee} className="action-button primary">
            Créer nouveau compte
          </button>
          <button onClick={handlePackageManagement} className="action-button secondary">
            Gestion des forfaits
          </button>
          <button onClick={handleRecordExpense} className="action-button secondary">
            Enregistrer charges
          </button>
          <button onClick={handleViewStatistics} className="action-button secondary">
            Statistiques
          </button>
          <button onClick={handleViewCharts} className="action-button secondary">
            Graphiques
          </button>
        </div>

        {/* Dashboard Stats */}
        {dashboardData ? (
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Chiffre d'Affaires</h3>
              <p className="stat-value">€{dashboardData.summary?.turnover || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Bénéfice</h3>
              <p className="stat-value">€{dashboardData.summary?.profit || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Employés</h3>
              <p className="stat-value">{dashboardData.summary?.employeeCount || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Forfaits Actifs</h3>
              <p className="stat-value">{dashboardData.summary?.packageCount || 0}</p>
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
              <button onClick={handleCreateEmployee} className="create-employee-button">
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
    </div>
  );
};

export default AdminDashboard;
