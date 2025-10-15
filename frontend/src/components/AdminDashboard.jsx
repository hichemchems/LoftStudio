import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PackageList from './PackageList';
import PackageForm from './PackageForm';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  const handleCreate = () => {
    setEditingPackage(null);
    setShowForm(true);
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';
        await fetch(`${API_URL}/packages/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        // Refresh will happen in PackageList
      } catch (error) {
        console.error('Error deleting package:', error);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingPackage(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPackage(null);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name || user?.username}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-actions">
          <button onClick={handleCreate} className="create-btn">Create New Package</button>
        </div>

        <PackageList
          isAdmin={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      {showForm && (
        <PackageForm
          package={editingPackage}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
