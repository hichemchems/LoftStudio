import { j as jsxRuntimeExports, u as useAuth } from "./index-BR6G2AvJ.js";
import { r as reactExports } from "./router-BXlQiAzZ.js";
import { a as axios, l as lookup, B as Bar, C as Chart, b as CategoryScale, c as LinearScale, e as BarElement, p as plugin_title, f as plugin_tooltip, g as plugin_legend } from "./ui-C9wwLtAx.js";
import "./vendor-Bag_gwg1.js";
const PackageList = ({ isAdmin = false, onEdit, onDelete, onSelect }) => {
  const [packages, setPackages] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const API_URL = "http://localhost:3001/api/v1";
  reactExports.useEffect(() => {
    fetchPackages();
  }, []);
  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${API_URL}/packages`);
      setPackages(response.data.data || []);
    } catch (error2) {
      setError("Failed to fetch packages");
      console.error("Error fetching packages:", error2);
    } finally {
      setLoading(false);
    }
  };
  const handleActivate = async (id, currentStatus) => {
    try {
      await axios.put(`${API_URL}/packages/${id}/activate`, { is_active: !currentStatus });
      fetchPackages();
    } catch (error2) {
      setError("Failed to update package status");
      console.error("Error updating package:", error2);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "loading", children: "Loading packages..." });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "error", children: error });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "package-list", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Packages" }),
    packages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No packages available." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "package-grid", children: packages.map((pkg) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `package-card ${pkg.is_active ? "active" : "inactive"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: pkg.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "price", children: [
        "€",
        pkg.price
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `status ${pkg.is_active ? "active" : "inactive"}`, children: pkg.is_active ? "Active" : "Inactive" }),
      !isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "package-actions", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onSelect(pkg), className: "select-btn", children: "Sélectionner" }) }),
      isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "package-actions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onEdit(pkg), className: "edit-btn", children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleActivate(pkg.id, pkg.is_active), className: "activate-btn", children: pkg.is_active ? "Deactivate" : "Activate" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onDelete(pkg.id), className: "delete-btn", children: "Delete" })
      ] })
    ] }, pkg.id)) })
  ] });
};
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  plugin_title,
  plugin_tooltip,
  plugin_legend
);
const EmployeeDashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const [stats, setStats] = reactExports.useState({
    today: { totalPackages: 0, totalClients: 0, totalRevenue: 0, commission: 0 },
    week: { totalPackages: 0, totalClients: 0, totalRevenue: 0, commission: 0 },
    month: { totalPackages: 0, totalClients: 0, totalRevenue: 0, commission: 0 }
  });
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState(null);
  const [selectedPeriod, setSelectedPeriod] = reactExports.useState("today");
  const [showPackageModal, setShowPackageModal] = reactExports.useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = reactExports.useState(false);
  const [selectedPackage, setSelectedPackage] = reactExports.useState(() => {
    const saved = localStorage.getItem("selectedPackage");
    return saved ? JSON.parse(saved) : null;
  });
  const menuRef = reactExports.useRef(null);
  const socketRef = reactExports.useRef(null);
  const API_URL = "http://localhost:3001/api/v1";
  const loadAllStats = reactExports.useCallback(async () => {
    const fetchStats = async (period) => {
      try {
        const employeeId = user.employee?.id || user.id;
        const response = await axios.get(`${API_URL}/employees/${employeeId}/stats?period=${period}`);
        return response.data.data;
      } catch (error2) {
        console.error(`Failed to fetch ${period} stats:`, error2);
        throw error2;
      }
    };
    try {
      setLoading(true);
      setError(null);
      const [todayStats, weekStats, monthStats] = await Promise.all([
        fetchStats("today"),
        fetchStats("week"),
        fetchStats("month")
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
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  }, [user, API_URL]);
  reactExports.useEffect(() => {
    if (user && !isAdmin) {
      loadAllStats();
      socketRef.current = lookup(API_URL.replace("/api/v1", ""));
      socketRef.current.on("dashboard-data-updated", () => {
        console.log("Dashboard data updated, reloading stats...");
        loadAllStats();
      });
      const checkDateChange = () => {
        const now2 = /* @__PURE__ */ new Date();
        const currentDate = now2.toDateString();
        const storedDate = localStorage.getItem("lastStatsDate");
        if (storedDate !== currentDate) {
          console.log("Date changed, resetting daily statistics");
          localStorage.setItem("lastStatsDate", currentDate);
          loadAllStats();
        }
      };
      const now = /* @__PURE__ */ new Date();
      localStorage.setItem("lastStatsDate", now.toDateString());
      const dateCheckInterval = setInterval(checkDateChange, 60 * 1e3);
      return () => {
        clearInterval(dateCheckInterval);
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user, isAdmin, loadAllStats, API_URL]);
  reactExports.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowHamburgerMenu(false);
      }
    };
    if (showHamburgerMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showHamburgerMenu]);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR"
    }).format(amount);
  };
  const handleHamburgerMenuToggle = () => {
    setShowHamburgerMenu(!showHamburgerMenu);
  };
  const handleMenuItemClick = (action) => {
    setShowHamburgerMenu(false);
    switch (action) {
      case "choosePackage":
        setShowPackageModal(true);
        break;
      case "viewToday":
        handlePeriodChange("today");
        break;
      case "viewWeek":
        handlePeriodChange("week");
        break;
      case "viewMonth":
        handlePeriodChange("month");
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
      localStorage.setItem("selectedPackage", JSON.stringify(pkg));
      setShowPackageModal(false);
    } catch (error2) {
      console.error("Failed to select package:", error2);
      setSelectedPackage(pkg);
      localStorage.setItem("selectedPackage", JSON.stringify(pkg));
      setShowPackageModal(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dashboard", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "dashboard-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "Employee Dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "user-info", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Welcome, ",
            user?.name || user?.username
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: logout, className: "logout-btn", children: "Logout" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "dashboard-content", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "loading-container", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "loading-spinner" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Chargement de vos statistiques..." })
      ] }) })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dashboard", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "dashboard-header", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "Employee Dashboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "user-info", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Welcome, ",
            user?.name || user?.username
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: logout, className: "logout-btn", children: "Logout" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "dashboard-content", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "error-message", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Erreur de chargement" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: error }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Il semble qu'il n'y ait pas encore de données de ventes dans le système." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: loadAllStats, className: "retry-btn", children: "Réessayer" })
      ] }) })
    ] });
  }
  const currentStats = stats[selectedPeriod];
  const chartData = {
    labels: ["Total Clients", "Chiffre d'Affaires", "Commission"],
    datasets: [
      {
        label: `Statistiques pour ${selectedPeriod}`,
        data: [
          currentStats.totalClients,
          currentStats.totalRevenue || 0,
          currentStats.commission
        ],
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)"
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)"
        ],
        borderWidth: 1
      }
    ]
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top"
      },
      title: {
        display: true,
        text: `Statistiques Employé - ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}`
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dashboard", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "dashboard-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "Employee Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "user-info", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Welcome, ",
          user?.name || user?.username
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleHamburgerMenuToggle, className: "hamburger-btn", children: "☰" })
      ] })
    ] }),
    showHamburgerMenu && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hamburger-menu", ref: menuRef, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleMenuItemClick("choosePackage"), className: "menu-item", children: "Choisir Forfait" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleMenuItemClick("viewToday"), className: "menu-item", children: "Voir Aujourd'hui" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleMenuItemClick("viewWeek"), className: "menu-item", children: "Voir Semaine" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleMenuItemClick("viewMonth"), className: "menu-item", children: "Voir Mois" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "menu-divider" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: logout, className: "menu-item logout-item", children: "Déconnexion" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "dashboard-content", children: [
      selectedPackage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "selected-package-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Forfait Sélectionné" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "package-info", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: selectedPackage.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "price", children: [
            "€",
            selectedPackage.price
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "employee-stats", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Total Clients" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "stat-value", children: currentStats.totalClients }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "period-label", children: [
            "(",
            selectedPeriod,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Chiffre d'Affaires" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "stat-value revenue", children: formatCurrency(currentStats.totalRevenue || 0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "period-label", children: [
            "(",
            selectedPeriod,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Commission" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "stat-value commission", children: formatCurrency(currentStats.commission) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "period-label", children: [
            "(",
            selectedPeriod,
            ")"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "chart-container", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { data: chartData, options: chartOptions }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "period-selector", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Période" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "period-buttons", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: selectedPeriod === "today" ? "active" : "",
              onClick: () => handlePeriodChange("today"),
              children: "Aujourd'hui"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: selectedPeriod === "week" ? "active" : "",
              onClick: () => handlePeriodChange("week"),
              children: "Semaine"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: selectedPeriod === "month" ? "active" : "",
              onClick: () => handlePeriodChange("month"),
              children: "Mois"
            }
          )
        ] })
      ] })
    ] }),
    showPackageModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-content package-modal", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Choisir un Forfait" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PackageList, { isAdmin: false, onSelect: handlePackageSelect }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-actions", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowPackageModal(false), className: "close-btn", children: "Fermer" }) })
    ] }) })
  ] });
};
export {
  EmployeeDashboard as default
};
