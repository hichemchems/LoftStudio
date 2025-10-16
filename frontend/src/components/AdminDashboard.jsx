import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

  const fetchDashboardData = useCallback(async () => {
    try {
      console.log('AdminDashboard - Fetching dashboard data from:', `${API_URL}/dashboard`);
      const response = await axios.get(`${API_URL}/dashboard`);
      console.log('AdminDashboard - Dashboard data fetched:', response.data);
      setDashboardData(response.data);
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
        {dashboardData ? (
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Turnover</h3>
              <p className="stat-value">${dashboardData.totalTurnover || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Total Profit</h3>
              <p className="stat-value">${dashboardData.totalProfit || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Total Sales</h3>
              <p className="stat-value">{dashboardData.totalSales || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Active Packages</h3>
              <p className="stat-value">{dashboardData.activePackages || 0}</p>
            </div>
          </div>
        ) : (
          <div className="no-data">
            <p>No dashboard data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
