import React, { useState } from 'react';
import './EmployeeCard.css';

const EmployeeCard = ({ employee, onCardClick }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="employee-card" onClick={() => onCardClick(employee)}>
      <div className="employee-avatar">
        {!imageError && employee.avatar_url ? (
          <img
            src={`http://localhost:3001${employee.avatar_url}`}
            alt={`${employee.name} avatar`}
            onError={handleImageError}
          />
        ) : (
          <div className="avatar-placeholder">
            {employee.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="employee-info">
        <h3 className="employee-name">{employee.name}</h3>

        <div className="employee-stats">
          <div className="stat-item">
            <span className="stat-label">Forfaits (mois)</span>
            <span className="stat-value">{employee.monthStats?.packageCount || 0}</span>
          </div>

          <div className="stat-item">
            <span className="stat-label">Total Clients (mois)</span>
            <span className="stat-value">{employee.monthStats?.totalClients || 0}</span>
          </div>

          <div className="stat-item">
            <span className="stat-label">Chiffre d'Affaires (mois)</span>
            <span className="stat-value revenue">
              {formatCurrency(employee.monthStats?.totalRevenue || 0)}
            </span>
          </div>

          <div className="stat-item">
            <span className="stat-label">Commission ({employee.percentage}%)</span>
            <span className="stat-value commission">
              {formatCurrency(employee.monthStats?.commission || 0)}
            </span>
          </div>

          {/* Display selected package if available */}
          {employee.selectedPackage && (
            <div className="stat-item">
              <span className="stat-label">Forfait sélectionné</span>
              <span className="stat-value package-name">{employee.selectedPackage.name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="card-indicator">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};

export default EmployeeCard;
