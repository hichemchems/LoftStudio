import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AnnualProfitModal.css';

const AnnualProfitModal = ({ isOpen, onClose }) => {
  const [annualData, setAnnualData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

  const fetchAnnualProfit = async (year) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/dashboard/reports/annual-profit?year=${year}`);
      setAnnualData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch annual profit data:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAnnualProfit(selectedYear);
    }
  }, [isOpen, selectedYear]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    return years;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content annual-profit-modal">
        <div className="modal-header">
          <h2>Bénéfices Annuels</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>

        <div className="modal-body">
          {/* Year Selector */}
          <div className="year-selector">
            <label htmlFor="year-select">Année:</label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
            >
              {getAvailableYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Chargement des données...</p>
            </div>
          )}

          {error && (
            <div className="error-message">{error}</div>
          )}

          {annualData && !loading && (
            <div className="annual-profit-content">
              {/* Annual Summary */}
              <div className="annual-summary">
                <h3>Résumé Annuel {annualData.year}</h3>
                <div className="summary-cards">
                  <div className="summary-card">
                    <h4>Chiffre d'Affaires Total</h4>
                    <p className="summary-value">€{annualData.annualTotals.totalTurnover.toFixed(2)}</p>
                  </div>
                  <div className="summary-card">
                    <h4>Charges Totales</h4>
                    <p className="summary-value">€{annualData.annualTotals.totalExpenses.toFixed(2)}</p>
                  </div>
                  <div className="summary-card">
                    <h4>Commissions Totales</h4>
                    <p className="summary-value">€{annualData.annualTotals.totalCommissions.toFixed(2)}</p>
                  </div>
                  <div className="summary-card profit-card">
                    <h4>Bénéfice Net Total</h4>
                    <p className="summary-value">€{annualData.annualTotals.totalProfit.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Monthly Breakdown */}
              <div className="monthly-breakdown">
                <h3>Détail Mensuel</h3>
                <div className="monthly-table">
                  <div className="table-header">
                    <div className="table-cell">Mois</div>
                    <div className="table-cell">CA (€)</div>
                    <div className="table-cell">Charges (€)</div>
                    <div className="table-cell">Commissions (€)</div>
                    <div className="table-cell">Bénéfice (€)</div>
                  </div>
                  {annualData.monthlyProfits.map((month, index) => (
                    <div key={index} className="table-row">
                      <div className="table-cell month-cell">{month.month}</div>
                      <div className="table-cell">{month.turnover.toFixed(2)}</div>
                      <div className="table-cell">{month.expenses.toFixed(2)}</div>
                      <div className="table-cell">{month.commissions.toFixed(2)}</div>
                      <div className={`table-cell profit-cell ${month.profit >= 0 ? 'positive' : 'negative'}`}>
                        {month.profit.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnualProfitModal;
