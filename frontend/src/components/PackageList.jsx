import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PackageList = ({ isAdmin = false, onEdit, onDelete }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${API_URL}/packages`);
      setPackages(response.data.packages || []);
    } catch (error) {
      setError('Failed to fetch packages');
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id, currentStatus) => {
    try {
      await axios.put(`${API_URL}/packages/${id}/activate`, { is_active: !currentStatus });
      fetchPackages(); // Refresh the list
    } catch (error) {
      setError('Failed to update package status');
      console.error('Error updating package:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading packages...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="package-list">
      <h3>Packages</h3>
      {packages.length === 0 ? (
        <p>No packages available.</p>
      ) : (
        <div className="package-grid">
          {packages.map((pkg) => (
            <div key={pkg.id} className={`package-card ${pkg.is_active ? 'active' : 'inactive'}`}>
              <h4>{pkg.name}</h4>
              <p className="price">${pkg.price}</p>
              <p className={`status ${pkg.is_active ? 'active' : 'inactive'}`}>
                {pkg.is_active ? 'Active' : 'Inactive'}
              </p>
              {isAdmin && (
                <div className="package-actions">
                  <button onClick={() => onEdit(pkg)} className="edit-btn">Edit</button>
                  <button onClick={() => handleActivate(pkg.id, pkg.is_active)} className="activate-btn">
                    {pkg.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => onDelete(pkg.id)} className="delete-btn">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PackageList;
