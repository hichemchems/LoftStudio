import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './StatisticsModal.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const StatisticsModal = ({ isOpen, onClose }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState('revenue');

  const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    if (isOpen) {
      fetchStatistics();
    }
  }, [isOpen, timeRange, fetchStatistics]);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/dashboard/analytics?period=${timeRange}`);
      setStatistics(response.data.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, [API_URL, timeRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      month: 'short',
      year: 'numeric'
    });
  };

  const getRevenueChartData = () => {
    if (!statistics?.monthlyData) return null;

    return {
      labels: statistics.monthlyData.map(item => formatDate(item.month)),
      datasets: [
        {
          label: 'Chiffre d\'affaires',
          data: statistics.monthlyData.map(item => item.revenue),
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Charges',
          data: statistics.monthlyData.map(item => item.expenses),
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Bénéfice',
          data: statistics.monthlyData.map(item => item.profit),
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  const getSalesChartData = () => {
    if (!statistics?.monthlyData) return null;

    return {
      labels: statistics.monthlyData.map(item => formatDate(item.month)),
      datasets: [
        {
          label: 'Ventes',
          data: statistics.monthlyData.map(item => item.sales),
          backgroundColor: '#007bff',
        },
        {
          label: 'Recettes',
          data: statistics.monthlyData.map(item => item.receipts),
          backgroundColor: '#28a745',
        },
      ],
    };
  };

  const getPackagePopularityData = () => {
    if (!statistics?.packageStats) return null;

    return {
      labels: statistics.packageStats.map(item => item.name),
      datasets: [
        {
          data: statistics.packageStats.map(item => item.count),
          backgroundColor: [
            '#007bff',
            '#28a745',
            '#ffc107',
            '#dc3545',
            '#6f42c1',
            '#e83e8c',
            '#fd7e14',
          ],
        },
      ],
    };
  };

  const getEmployeePerformanceData = () => {
    if (!statistics?.employeeStats) return null;

    return {
      labels: statistics.employeeStats.map(item => item.name),
      datasets: [
        {
          label: 'Chiffre d\'affaires généré',
          data: statistics.employeeStats.map(item => item.revenue),
          backgroundColor: '#007bff',
        },
      ],
    };
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large-modal">
        <div className="modal-header">
          <h2>Statistiques et Analyses</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}

          <div className="stats-controls">
            <div className="time-range-selector">
              <label>Période:</label>
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="quarter">Ce trimestre</option>
                <option value="year">Cette année</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading">Chargement des statistiques...</div>
          ) : statistics ? (
            <>
              <div className="stats-summary">
                <div className="summary-grid">
                  <div className="summary-card">
                    <h4>Chiffre d'affaires total</h4>
                    <p className="summary-value">{formatCurrency(statistics.totalRevenue)}</p>
                  </div>
                  <div className="summary-card">
                    <h4>Charges totales</h4>
                    <p className="summary-value">{formatCurrency(statistics.totalExpenses)}</p>
                  </div>
                  <div className="summary-card">
                    <h4>Bénéfice net</h4>
                    <p className={`summary-value ${statistics.totalProfit >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(statistics.totalProfit)}
                    </p>
                  </div>
                  <div className="summary-card">
                    <h4>Marge bénéficiaire</h4>
                    <p className="summary-value">{statistics.profitMargin}%</p>
                  </div>
                </div>
              </div>

              <div className="stats-tabs">
                <button
                  className={`tab-button ${activeTab === 'revenue' ? 'active' : ''}`}
                  onClick={() => setActiveTab('revenue')}
                >
                  Évolution CA
                </button>
                <button
                  className={`tab-button ${activeTab === 'sales' ? 'active' : ''}`}
                  onClick={() => setActiveTab('sales')}
                >
                  Ventes & Recettes
                </button>
                <button
                  className={`tab-button ${activeTab === 'packages' ? 'active' : ''}`}
                  onClick={() => setActiveTab('packages')}
                >
                  Popularité forfaits
                </button>
                <button
                  className={`tab-button ${activeTab === 'employees' ? 'active' : ''}`}
                  onClick={() => setActiveTab('employees')}
                >
                  Performance employés
                </button>
              </div>

              <div className="chart-container">
                {activeTab === 'revenue' && getRevenueChartData() && (
                  <div className="chart-wrapper">
                    <h3>Évolution du Chiffre d'Affaires</h3>
                    <Line
                      data={getRevenueChartData()}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return formatCurrency(value);
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                )}

                {activeTab === 'sales' && getSalesChartData() && (
                  <div className="chart-wrapper">
                    <h3>Ventes et Recettes par période</h3>
                    <Bar
                      data={getSalesChartData()}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return formatCurrency(value);
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                )}

                {activeTab === 'packages' && getPackagePopularityData() && (
                  <div className="chart-wrapper">
                    <h3>Popularité des forfaits</h3>
                    <Doughnut
                      data={getPackagePopularityData()}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'right',
                          },
                        }
                      }}
                    />
                  </div>
                )}

                {activeTab === 'employees' && getEmployeePerformanceData() && (
                  <div className="chart-wrapper">
                    <h3>Performance des employés</h3>
                    <Bar
                      data={getEmployeePerformanceData()}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return formatCurrency(value);
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-data">Aucune donnée statistique disponible</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsModal;
