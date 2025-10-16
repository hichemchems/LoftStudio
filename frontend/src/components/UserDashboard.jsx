import React from 'react';
import useAuth from '../hooks/useAuth';
import PackageList from './PackageList';

const UserDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>User Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name || user?.username}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        <PackageList isAdmin={false} />
      </main>
    </div>
  );
};

export default UserDashboard;
