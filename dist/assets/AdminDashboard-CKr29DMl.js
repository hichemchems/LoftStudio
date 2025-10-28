import { j as jsxRuntimeExports, u as useAuth } from "./index-BR6G2AvJ.js";
import { a as axios, L as Line, B as Bar, D as Doughnut, C as Chart, b as CategoryScale, c as LinearScale, P as PointElement, d as LineElement, e as BarElement, p as plugin_title, f as plugin_tooltip, g as plugin_legend, A as ArcElement, l as lookup } from "./ui-C9wwLtAx.js";
import { r as reactExports } from "./router-BXlQiAzZ.js";
import "./vendor-Bag_gwg1.js";
const CreateEmployeeModal = ({ isOpen, onClose, onEmployeeCreated }) => {
  const [formData, setFormData] = reactExports.useState({
    username: "",
    email: "",
    password: "",
    name: "",
    percentage: ""
  });
  const [photo, setPhoto] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const API_URL = "http://localhost:3001/api/v1";
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.username);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("percentage", formData.percentage);
      if (photo) {
        formDataToSend.append("photo", photo);
      }
      const response = await axios.post(`${API_URL}/auth/create-employee`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      if (response.data.success) {
        onEmployeeCreated(response.data.data.employee);
        onClose();
        setFormData({
          username: "",
          email: "",
          password: "",
          name: "",
          percentage: ""
        });
        setPhoto(null);
      }
    } catch (error2) {
      console.error("Error creating employee:", error2);
      setError(error2.response?.data?.message || "Erreur lors de la création de l'employé");
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-content", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Créer un nouveau compte employé" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-button", onClick: onClose, children: "×" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "employee-form", children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "error-message", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "name", children: "Nom et Prénom *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            id: "name",
            name: "name",
            value: formData.name,
            onChange: handleInputChange,
            required: true,
            autoComplete: "name",
            placeholder: "Ex: Jean Dupont"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "username", children: "Nom d'utilisateur *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            id: "username",
            name: "username",
            value: formData.username,
            onChange: handleInputChange,
            required: true,
            autoComplete: "username",
            placeholder: "Ex: jean_dupont"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "email", children: "Email *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "email",
            id: "email",
            name: "email",
            value: formData.email,
            onChange: handleInputChange,
            required: true,
            autoComplete: "email",
            placeholder: "Ex: jean.dupont@email.com"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "password", children: "Mot de passe *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "password",
            id: "password",
            name: "password",
            value: formData.password,
            onChange: handleInputChange,
            required: true,
            autoComplete: "new-password",
            placeholder: "Mot de passe sécurisé"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "percentage", children: "Pourcentage de commission *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "number",
            id: "percentage",
            name: "percentage",
            value: formData.percentage,
            onChange: handleInputChange,
            required: true,
            min: "0",
            max: "100",
            step: "0.1",
            autoComplete: "off",
            placeholder: "Ex: 15.5"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("small", { className: "form-help", children: "Pourcentage calculé sur le Hors Tax des forfaits" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "photo", children: "Photo de profil" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "file",
            id: "photo",
            name: "photo",
            onChange: handlePhotoChange,
            accept: "image/*"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("small", { className: "form-help", children: "Formats acceptés: JPG, PNG, GIF" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-actions", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "cancel-button", children: "Annuler" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: loading, className: "submit-button", children: loading ? "Création..." : "Créer l'employé" })
      ] })
    ] })
  ] }) });
};
const EmployeeCard = ({ employee, onCardClick }) => {
  const [imageError, setImageError] = reactExports.useState(false);
  const handleImageError = () => {
    setImageError(true);
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR"
    }).format(amount);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "employee-card", onClick: () => onCardClick(employee), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "employee-avatar", children: !imageError && employee.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: `http://localhost:3001${employee.avatar_url}`,
        alt: `${employee.name} avatar`,
        onError: handleImageError
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "avatar-placeholder", children: employee.name.charAt(0).toUpperCase() }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "employee-info", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "employee-name", children: employee.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "employee-stats", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Forfaits (mois)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: employee.monthStats?.packageCount || 0 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Total Clients (mois)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value", children: employee.monthStats?.totalClients || 0 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Chiffre d'Affaires (mois)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value revenue", children: formatCurrency(employee.monthStats?.totalRevenue || 0) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "stat-label", children: [
            "Commission (",
            employee.percentage,
            "%)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value commission", children: formatCurrency(employee.monthStats?.commission || 0) })
        ] }),
        employee.selectedPackage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-item", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-label", children: "Forfait sélectionné" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat-value package-name", children: employee.selectedPackage.name })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-indicator", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M9 5L16 12L9 19", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }) })
  ] });
};
const EmployeeDetailsModal = ({ isOpen, onClose, employee }) => {
  const [activeTab, setActiveTab] = reactExports.useState("today");
  const [detailedStats, setDetailedStats] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const API_URL = "http://localhost:3001/api/v1";
  reactExports.useEffect(() => {
    if (isOpen && employee) {
      fetchDetailedStats();
    }
  }, [isOpen, employee, activeTab]);
  const fetchDetailedStats = async () => {
    if (!employee) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/employees/${employee.id}/detailed-stats?period=${activeTab}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (response.data.success) {
        setDetailedStats(response.data.data);
      } else {
        console.error("Failed to fetch detailed stats:", response.data.message);
        setDetailedStats(null);
      }
    } catch (error) {
      console.error("Error fetching detailed stats:", error);
      setDetailedStats(null);
    } finally {
      setLoading(false);
    }
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR"
    }).format(amount);
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };
  if (!isOpen || !employee) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-content large-modal", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "employee-header-info", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "employee-avatar", children: employee.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: `http://localhost:3001${employee.avatar_url}`,
            alt: `${employee.name} avatar`
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "avatar-placeholder", children: employee.name.charAt(0).toUpperCase() }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: employee.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "employee-percentage", children: [
            "Commission: ",
            employee.percentage,
            "% sur HT"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-button", onClick: onClose, children: "×" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-body", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tabs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `tab-button ${activeTab === "today" ? "active" : ""}`,
            onClick: () => setActiveTab("today"),
            children: "Aujourd'hui"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `tab-button ${activeTab === "week" ? "active" : ""}`,
            onClick: () => setActiveTab("week"),
            children: "Cette semaine"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `tab-button ${activeTab === "month" ? "active" : ""}`,
            onClick: () => setActiveTab("month"),
            children: "Ce mois"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: `tab-button ${activeTab === "year" ? "active" : ""}`,
            onClick: () => setActiveTab("year"),
            children: "Cette année"
          }
        )
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "loading", children: "Chargement des données..." }) : detailedStats ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stats-content", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stats-summary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Forfaits réalisés" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "summary-value", children: detailedStats.totalPackages })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "CA généré (HT)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "summary-value", children: formatCurrency(detailedStats.totalRevenue) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Commission totale" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "summary-value commission", children: formatCurrency(detailedStats.totalCommission) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "packages-list", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Détail des forfaits" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "packages-table", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "table-header", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Client" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Forfait" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Prix HT" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Commission" })
            ] }),
            detailedStats.packages.map((pkg) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "table-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDate(pkg.date) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: pkg.client_name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: pkg.package_name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(pkg.ht_price) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "commission", children: formatCurrency(pkg.commission) })
            ] }, pkg.id))
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "no-data", children: "Aucune donnée disponible" })
    ] })
  ] }) });
};
const EmployeeManagementModal = ({ isOpen, onClose, onEmployeeUpdated }) => {
  const [employees, setEmployees] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [editingEmployee, setEditingEmployee] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState({
    username: "",
    email: "",
    name: "",
    percentage: "",
    password: ""
  });
  const API_URL = "http://localhost:3001/api/v1";
  reactExports.useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);
  const fetchEmployees = reactExports.useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/employees`);
      setEmployees(response.data.data || []);
    } catch (error2) {
      console.error("Error fetching employees:", error2);
      setError("Erreur lors du chargement des employés");
    } finally {
      setLoading(false);
    }
  }, [API_URL]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      username: employee.user?.username || "",
      email: employee.user?.email || "",
      name: employee.name || "",
      percentage: employee.percentage?.toString() || "",
      password: ""
      // Don't prefill password
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const dataToSend = {
        ...formData,
        percentage: parseFloat(formData.percentage) || 0
      };
      if (!dataToSend.password) {
        delete dataToSend.password;
      }
      if (editingEmployee) {
        await axios.put(`${API_URL}/employees/${editingEmployee.id}`, dataToSend);
      }
      await fetchEmployees();
      onEmployeeUpdated();
      resetForm();
      setEditingEmployee(null);
    } catch (error2) {
      console.error("Error saving employee:", error2);
      setError(error2.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (employee) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le compte "${employee.name}" ? Cette action est irréversible.`)) {
      return;
    }
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/employees/${employee.id}`);
      await fetchEmployees();
      onEmployeeUpdated();
    } catch (error2) {
      console.error("Error deleting employee:", error2);
      setError("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };
  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      name: "",
      percentage: "",
      password: ""
    });
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-content large-modal", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Gestion des comptes employés" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-button", onClick: onClose, children: "×" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-body", children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "error-message", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "employee-summary", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Total employés" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "total-count", children: employees.length })
      ] }) }),
      editingEmployee && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "employee-form", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Modifier le compte employé" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "username", children: "Nom d'utilisateur *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                id: "username",
                name: "username",
                value: formData.username,
                onChange: handleInputChange,
                required: true,
                autoComplete: "username",
                placeholder: "nom_utilisateur"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "email", children: "Email *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "email",
                id: "email",
                name: "email",
                value: formData.email,
                onChange: handleInputChange,
                required: true,
                autoComplete: "email",
                placeholder: "email@exemple.com"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "name", children: "Nom complet *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                id: "name",
                name: "name",
                value: formData.name,
                onChange: handleInputChange,
                required: true,
                autoComplete: "name",
                placeholder: "Prénom Nom"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "percentage", children: "Pourcentage (%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                id: "percentage",
                name: "percentage",
                value: formData.percentage,
                onChange: handleInputChange,
                min: "0",
                max: "100",
                step: "0.1",
                autoComplete: "off",
                placeholder: "Ex: 10.5"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "form-row", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "password", children: "Nouveau mot de passe (laisser vide pour garder l'actuel)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "password",
              id: "password",
              name: "password",
              value: formData.password,
              onChange: handleInputChange,
              autoComplete: "new-password",
              placeholder: "Nouveau mot de passe"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-actions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
            resetForm();
            setEditingEmployee(null);
          }, className: "cancel-button", children: "Annuler" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: loading, className: "submit-button", children: loading ? "Sauvegarde..." : "Modifier" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "employees-list", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Comptes employés" }),
        loading && !editingEmployee ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "loading", children: "Chargement des employés..." }) : employees.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "employees-table", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "table-header", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Nom" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Utilisateur" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Pourcentage" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Date création" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Actions" })
          ] }),
          employees.map((employee) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "table-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "employee-name", children: employee.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: employee.user?.username }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: employee.user?.email }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: employee.percentage ? `${employee.percentage}%` : "N/A" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDate(employee.created_at) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "actions", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleEdit(employee), className: "edit-button", children: "✏️" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDelete(employee), className: "delete-button", children: "🗑️" })
            ] })
          ] }, employee.id))
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "no-data", children: "Aucun employé enregistré" })
      ] })
    ] })
  ] }) });
};
const ExpenseModal = ({ isOpen, onClose }) => {
  const [expenses, setExpenses] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [showCreateForm, setShowCreateForm] = reactExports.useState(false);
  const [editingExpense, setEditingExpense] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState({
    description: "",
    amount: "",
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    category: ""
  });
  const API_URL = "http://localhost:3001/api/v1";
  reactExports.useEffect(() => {
    if (isOpen) {
      fetchExpenses();
    }
  }, [isOpen]);
  const fetchExpenses = reactExports.useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/dashboard/expenses`);
      setExpenses(response.data.data || []);
    } catch (error2) {
      console.error("Error fetching expenses:", error2);
      setError("Erreur lors du chargement des charges");
    } finally {
      setLoading(false);
    }
  }, [API_URL]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const dataToSend = {
        ...formData,
        amount: parseFloat(formData.amount)
      };
      if (editingExpense) {
        await axios.put(`${API_URL}/dashboard/expenses/${editingExpense.id}`, dataToSend);
      } else {
        await axios.post(`${API_URL}/dashboard/expenses`, dataToSend);
      }
      await fetchExpenses();
      resetForm();
      setShowCreateForm(false);
      setEditingExpense(null);
    } catch (error2) {
      console.error("Error saving expense:", error2);
      setError(error2.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date,
      category: expense.category || ""
    });
    setShowCreateForm(true);
  };
  const handleDelete = async (expense) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer cette charge "${expense.description}" ?`)) {
      return;
    }
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/dashboard/expenses/${expense.id}`);
      await fetchExpenses();
    } catch (error2) {
      console.error("Error deleting expense:", error2);
      setError("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };
  const resetForm = () => {
    setFormData({
      description: "",
      amount: "",
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      category: ""
    });
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR"
    }).format(amount);
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };
  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-content large-modal", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Gestion des charges" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-button", onClick: onClose, children: "×" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-body", children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "error-message", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "expense-summary", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Total des charges" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "total-amount", children: formatCurrency(getTotalExpenses()) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-actions", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            resetForm();
            setEditingExpense(null);
            setShowCreateForm(!showCreateForm);
          },
          className: "action-button primary",
          children: showCreateForm ? "Annuler" : "+ Nouvelle charge"
        }
      ) }),
      showCreateForm && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "expense-form", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: editingExpense ? "Modifier la charge" : "Enregistrer une nouvelle charge" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "description", children: "Description *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                id: "description",
                name: "description",
                value: formData.description,
                onChange: handleInputChange,
                required: true,
                autoComplete: "off",
                placeholder: "Ex: Fournitures de coiffure"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "amount", children: "Montant (€) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                id: "amount",
                name: "amount",
                value: formData.amount,
                onChange: handleInputChange,
                required: true,
                min: "0",
                step: "0.01",
                autoComplete: "off",
                placeholder: "Ex: 150.00"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "date", children: "Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "date",
                id: "date",
                name: "date",
                value: formData.date,
                onChange: handleInputChange,
                required: true,
                autoComplete: "off"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "category", children: "Catégorie" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                id: "category",
                name: "category",
                value: formData.category,
                onChange: handleInputChange,
                autoComplete: "off",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Sélectionner une catégorie" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "fournitures", children: "Fournitures" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "loyer", children: "Loyer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "utilities", children: "Utilitaires" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "marketing", children: "Marketing" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "autres", children: "Autres" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-actions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowCreateForm(false), className: "cancel-button", children: "Annuler" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: loading, className: "submit-button", children: loading ? "Sauvegarde..." : editingExpense ? "Modifier" : "Enregistrer" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "expenses-list", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Charges enregistrées" }),
        loading && !showCreateForm ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "loading", children: "Chargement des charges..." }) : expenses.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "expenses-table", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "table-header", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Montant" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Catégorie" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Actions" })
          ] }),
          expenses.map((expense) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "table-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "expense-description", children: expense.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(expense.amount) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDate(expense.date) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "category", children: expense.category || "Non catégorisé" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "actions", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleEdit(expense), className: "edit-button", children: "✏️" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDelete(expense), className: "delete-button", children: "🗑️" })
            ] })
          ] }, expense.id))
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "no-data", children: "Aucune charge enregistrée pour le moment" })
      ] })
    ] })
  ] }) });
};
const PackageManagementModal = ({ isOpen, onClose }) => {
  const [packages, setPackages] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [showCreateForm, setShowCreateForm] = reactExports.useState(false);
  const [editingPackage, setEditingPackage] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState({
    name: "",
    price: "",
    description: "",
    duration_minutes: "",
    is_active: true
  });
  const API_URL = "http://localhost:3001/api/v1";
  reactExports.useEffect(() => {
    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen]);
  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/packages`);
      setPackages(response.data.data || []);
    } catch (error2) {
      console.error("Error fetching packages:", error2);
      setError("Erreur lors du chargement des forfaits");
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes)
      };
      if (editingPackage) {
        await axios.put(`${API_URL}/packages/${editingPackage.id}`, dataToSend);
      } else {
        await axios.post(`${API_URL}/packages`, dataToSend);
      }
      await fetchPackages();
      resetForm();
      setShowCreateForm(false);
      setEditingPackage(null);
    } catch (error2) {
      console.error("Error saving package:", error2);
      setError(error2.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      price: pkg.price.toString(),
      description: pkg.description || "",
      duration_minutes: pkg.duration_minutes.toString(),
      is_active: pkg.is_active
    });
    setShowCreateForm(true);
  };
  const handleDelete = async (pkg) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le forfait "${pkg.name}" ?`)) {
      return;
    }
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/packages/${pkg.id}`);
      await fetchPackages();
    } catch (error2) {
      console.error("Error deleting package:", error2);
      setError("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };
  const handleToggleActive = async (pkg) => {
    setLoading(true);
    try {
      await axios.put(`${API_URL}/packages/${pkg.id}`, {
        ...pkg,
        is_active: !pkg.is_active
      });
      await fetchPackages();
    } catch (error2) {
      console.error("Error toggling package status:", error2);
      setError("Erreur lors de la modification du statut");
    } finally {
      setLoading(false);
    }
  };
  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      duration_minutes: "",
      is_active: true
    });
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR"
    }).format(amount);
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-content large-modal", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Gestion des forfaits" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-button", onClick: onClose, children: "×" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-body", children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "error-message", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-actions", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            resetForm();
            setEditingPackage(null);
            setShowCreateForm(!showCreateForm);
          },
          className: "action-button primary",
          children: showCreateForm ? "Annuler" : "+ Nouveau forfait"
        }
      ) }),
      showCreateForm && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "package-form", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: editingPackage ? "Modifier le forfait" : "Créer un nouveau forfait" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "name", children: "Nom du forfait *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                id: "name",
                name: "name",
                value: formData.name,
                onChange: handleInputChange,
                required: true,
                autoComplete: "off",
                placeholder: "Ex: Coupe + brushing"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "price", children: "Prix HT (€) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                id: "price",
                name: "price",
                value: formData.price,
                onChange: handleInputChange,
                required: true,
                min: "0",
                step: "0.01",
                autoComplete: "off",
                placeholder: "Ex: 45.00"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "duration_minutes", children: "Durée (minutes) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                id: "duration_minutes",
                name: "duration_minutes",
                value: formData.duration_minutes,
                onChange: handleInputChange,
                required: true,
                min: "1",
                autoComplete: "off",
                placeholder: "Ex: 60"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "form-group", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "checkbox-label", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                name: "is_active",
                checked: formData.is_active,
                onChange: handleInputChange
              }
            ),
            "Forfait actif"
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "description", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              id: "description",
              name: "description",
              value: formData.description,
              onChange: handleInputChange,
              rows: "3",
              autoComplete: "off",
              placeholder: "Description optionnelle du forfait"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-actions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowCreateForm(false), className: "cancel-button", children: "Annuler" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: loading, className: "submit-button", children: loading ? "Sauvegarde..." : editingPackage ? "Modifier" : "Créer" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "packages-list", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Forfaits existants" }),
        loading && !showCreateForm ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "loading", children: "Chargement des forfaits..." }) : packages.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "packages-table", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "table-header", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Nom" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Prix HT" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Durée" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Statut" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Actions" })
          ] }),
          packages.map((pkg) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "table-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "package-name", children: pkg.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(pkg.price) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              pkg.duration_minutes,
              " min"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleToggleActive(pkg),
                className: `status-button ${pkg.is_active ? "active" : "inactive"}`,
                children: pkg.is_active ? "Actif" : "Inactif"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "actions", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleEdit(pkg), className: "edit-button", children: "✏️" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDelete(pkg), className: "delete-button", children: "🗑️" })
            ] })
          ] }, pkg.id))
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "no-data", children: "Aucun forfait créé pour le moment" })
      ] })
    ] })
  ] }) });
};
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  plugin_title,
  plugin_tooltip,
  plugin_legend,
  ArcElement
);
const StatisticsModal = ({ isOpen, onClose }) => {
  const [statistics, setStatistics] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [timeRange, setTimeRange] = reactExports.useState("month");
  const [activeTab, setActiveTab] = reactExports.useState("revenue");
  const API_URL = "http://localhost:3001/api/v1";
  reactExports.useEffect(() => {
    if (isOpen) {
      fetchStatistics();
    }
  }, [isOpen, timeRange]);
  const fetchStatistics = reactExports.useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/dashboard/analytics?period=${timeRange}`);
      setStatistics(response.data.data);
    } catch (error2) {
      console.error("Error fetching statistics:", error2);
      setError("Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
    }
  }, [API_URL, timeRange]);
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR"
    }).format(amount || 0);
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      month: "short",
      year: "numeric"
    });
  };
  const getRevenueChartData = () => {
    if (!statistics?.monthlyData) return null;
    return {
      labels: statistics.monthlyData.map((item) => formatDate(item.month)),
      datasets: [
        {
          label: "Chiffre d'affaires",
          data: statistics.monthlyData.map((item) => item.revenue),
          borderColor: "#007bff",
          backgroundColor: "rgba(0, 123, 255, 0.1)",
          tension: 0.4
        },
        {
          label: "Charges",
          data: statistics.monthlyData.map((item) => item.expenses),
          borderColor: "#dc3545",
          backgroundColor: "rgba(220, 53, 69, 0.1)",
          tension: 0.4
        },
        {
          label: "Bénéfice",
          data: statistics.monthlyData.map((item) => item.profit),
          borderColor: "#28a745",
          backgroundColor: "rgba(40, 167, 69, 0.1)",
          tension: 0.4
        }
      ]
    };
  };
  const getSalesChartData = () => {
    if (!statistics?.monthlyData) return null;
    return {
      labels: statistics.monthlyData.map((item) => formatDate(item.month)),
      datasets: [
        {
          label: "Ventes",
          data: statistics.monthlyData.map((item) => item.sales),
          backgroundColor: "#007bff"
        },
        {
          label: "Recettes",
          data: statistics.monthlyData.map((item) => item.receipts),
          backgroundColor: "#28a745"
        }
      ]
    };
  };
  const getPackagePopularityData = () => {
    if (!statistics?.packageStats) return null;
    return {
      labels: statistics.packageStats.map((item) => item.name),
      datasets: [
        {
          data: statistics.packageStats.map((item) => item.count),
          backgroundColor: [
            "#007bff",
            "#28a745",
            "#ffc107",
            "#dc3545",
            "#6f42c1",
            "#e83e8c",
            "#fd7e14"
          ]
        }
      ]
    };
  };
  const getEmployeePerformanceData = () => {
    if (!statistics?.employeeStats) return null;
    return {
      labels: statistics.employeeStats.map((item) => item.name),
      datasets: [
        {
          label: "Chiffre d'affaires généré",
          data: statistics.employeeStats.map((item) => item.revenue),
          backgroundColor: "#007bff"
        }
      ]
    };
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-content large-modal", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Statistiques et Analyses" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "close-button", onClick: onClose, children: "×" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-body", children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "error-message", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stats-controls", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "time-range-selector", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { children: "Période:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: timeRange, onChange: (e) => setTimeRange(e.target.value), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "week", children: "Cette semaine" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "month", children: "Ce mois" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "quarter", children: "Ce trimestre" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "year", children: "Cette année" })
        ] })
      ] }) }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "loading", children: "Chargement des statistiques..." }) : statistics ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "stats-summary", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-grid", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Chiffre d'affaires total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "summary-value", children: formatCurrency(statistics.totalRevenue) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Charges totales" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "summary-value", children: formatCurrency(statistics.totalExpenses) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Bénéfice net" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `summary-value ${statistics.totalProfit >= 0 ? "positive" : "negative"}`, children: formatCurrency(statistics.totalProfit) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Marge bénéficiaire" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "summary-value", children: [
              statistics.profitMargin,
              "%"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stats-tabs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: `tab-button ${activeTab === "revenue" ? "active" : ""}`,
              onClick: () => setActiveTab("revenue"),
              children: "Évolution CA"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: `tab-button ${activeTab === "sales" ? "active" : ""}`,
              onClick: () => setActiveTab("sales"),
              children: "Ventes & Recettes"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: `tab-button ${activeTab === "packages" ? "active" : ""}`,
              onClick: () => setActiveTab("packages"),
              children: "Popularité forfaits"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: `tab-button ${activeTab === "employees" ? "active" : ""}`,
              onClick: () => setActiveTab("employees"),
              children: "Performance employés"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chart-container", children: [
          activeTab === "revenue" && getRevenueChartData() && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chart-wrapper", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Évolution du Chiffre d'Affaires" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Line,
              {
                data: getRevenueChartData(),
                options: {
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top"
                    },
                    title: {
                      display: false
                    }
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
                }
              }
            )
          ] }),
          activeTab === "sales" && getSalesChartData() && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chart-wrapper", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Ventes et Recettes par période" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Bar,
              {
                data: getSalesChartData(),
                options: {
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top"
                    }
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
                }
              }
            )
          ] }),
          activeTab === "packages" && getPackagePopularityData() && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chart-wrapper", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Popularité des forfaits" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Doughnut,
              {
                data: getPackagePopularityData(),
                options: {
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "right"
                    }
                  }
                }
              }
            )
          ] }),
          activeTab === "employees" && getEmployeePerformanceData() && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chart-wrapper", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Performance des employés" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Bar,
              {
                data: getEmployeePerformanceData(),
                options: {
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top"
                    }
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
                }
              }
            )
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "no-data", children: "Aucune donnée statistique disponible" })
    ] })
  ] }) });
};
const AnnualProfitModal = ({ isOpen, onClose }) => {
  const [annualData, setAnnualData] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [selectedYear, setSelectedYear] = reactExports.useState((/* @__PURE__ */ new Date()).getFullYear());
  const API_URL = "http://localhost:3001/api/v1";
  const fetchAnnualProfit = async (year) => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_URL}/dashboard/reports/annual-profit?year=${year}`);
      setAnnualData(response.data.data);
    } catch (error2) {
      console.error("Failed to fetch annual profit data:", error2);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    if (isOpen) {
      fetchAnnualProfit(selectedYear);
    }
  }, [isOpen, selectedYear]);
  const handleYearChange = (year) => {
    setSelectedYear(year);
  };
  const getAvailableYears = () => {
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    return years;
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal-overlay", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-content annual-profit-modal", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Bénéfices Annuels" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "close-button", children: "×" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-body", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "year-selector", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "year-select", children: "Année:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            id: "year-select",
            value: selectedYear,
            onChange: (e) => handleYearChange(parseInt(e.target.value)),
            children: getAvailableYears().map((year) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: year, children: year }, year))
          }
        )
      ] }),
      loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "loading-container", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "loading-spinner" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Chargement des données..." })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "error-message", children: error }),
      annualData && !loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "annual-profit-content", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "annual-summary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { children: [
            "Résumé Annuel ",
            annualData.year
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-cards", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Chiffre d'Affaires Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "summary-value", children: [
                "€",
                annualData.annualTotals.totalTurnover.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Charges Totales" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "summary-value", children: [
                "€",
                annualData.annualTotals.totalExpenses.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Commissions Totales" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "summary-value", children: [
                "€",
                annualData.annualTotals.totalCommissions.toFixed(2)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "summary-card profit-card", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { children: "Bénéfice Net Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "summary-value", children: [
                "€",
                annualData.annualTotals.totalProfit.toFixed(2)
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monthly-breakdown", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Détail Mensuel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "monthly-table", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "table-header", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "table-cell", children: "Mois" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "table-cell", children: "CA (€)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "table-cell", children: "Charges (€)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "table-cell", children: "Commissions (€)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "table-cell", children: "Bénéfice (€)" })
            ] }),
            annualData.monthlyProfits.map((month, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "table-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "table-cell month-cell", children: month.month }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "table-cell", children: month.turnover.toFixed(2) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "table-cell", children: month.expenses.toFixed(2) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "table-cell", children: month.commissions.toFixed(2) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `table-cell profit-cell ${month.profit >= 0 ? "positive" : "negative"}`, children: month.profit.toFixed(2) })
            ] }, index))
          ] })
        ] })
      ] })
    ] })
  ] }) });
};
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = reactExports.useState(null);
  const [employees, setEmployees] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [error, setError] = reactExports.useState("");
  const [showCreateEmployeeModal, setShowCreateEmployeeModal] = reactExports.useState(false);
  const [selectedEmployee, setSelectedEmployee] = reactExports.useState(null);
  const [showEmployeeDetailsModal, setShowEmployeeDetailsModal] = reactExports.useState(false);
  const [showPackageManagementModal, setShowPackageManagementModal] = reactExports.useState(false);
  const [showExpenseModal, setShowExpenseModal] = reactExports.useState(false);
  const [showStatisticsModal, setShowStatisticsModal] = reactExports.useState(false);
  const [showEmployeeManagementModal, setShowEmployeeManagementModal] = reactExports.useState(false);
  const [showAnnualProfitModal, setShowAnnualProfitModal] = reactExports.useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = reactExports.useState(false);
  const menuRef = reactExports.useRef(null);
  const API_URL = "http://localhost:3001/api/v1";
  const socketRef = reactExports.useRef(null);
  const fetchDashboardData = reactExports.useCallback(async () => {
    try {
      console.log("AdminDashboard - Fetching dashboard data from:", `${API_URL}/dashboard`);
      const response = await axios.get(`${API_URL}/dashboard`);
      console.log("AdminDashboard - Dashboard data fetched:", response.data);
      setDashboardData(response.data);
      const employeesResponse = await axios.get(`${API_URL}/employees`);
      console.log("AdminDashboard - Employees data fetched:", employeesResponse.data);
      setEmployees(employeesResponse.data.data || []);
    } catch (error2) {
      console.error("AdminDashboard - Failed to fetch dashboard data:", error2);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [API_URL]);
  reactExports.useEffect(() => {
    console.log("AdminDashboard - User data:", user);
    fetchDashboardData();
    if (user && user.id) {
      const socketUrl = "http://localhost:3001";
      socketRef.current = lookup(socketUrl);
      socketRef.current.emit("join-dashboard", user.id);
      socketRef.current.on("dashboard-data-updated", () => {
        console.log("AdminDashboard - Real-time update received, refreshing data");
        fetchDashboardData();
      });
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user, fetchDashboardData]);
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
  const handleLogout = () => {
    console.log("AdminDashboard - Logout clicked");
    logout();
  };
  const handleHamburgerMenuToggle = () => {
    setShowHamburgerMenu(!showHamburgerMenu);
  };
  const handleMenuItemClick = (action) => {
    setShowHamburgerMenu(false);
    switch (action) {
      case "dashboard":
        break;
      case "createEmployee":
        setShowCreateEmployeeModal(true);
        break;
      case "manageEmployees":
        setShowEmployeeManagementModal(true);
        break;
      case "managePackages":
        setShowPackageManagementModal(true);
        break;
      case "expenses":
        setShowExpenseModal(true);
        break;
      case "statistics":
        setShowStatisticsModal(true);
        break;
      case "annualProfit":
        setShowAnnualProfitModal(true);
        break;
    }
  };
  const handleEmployeeCreated = (newEmployee) => {
    setEmployees((prev) => [...prev, newEmployee]);
    fetchDashboardData();
  };
  const handleEmployeeUpdated = () => {
    fetchDashboardData();
  };
  const handleEmployeeCardClick = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetailsModal(true);
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "loading-container", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "loading-spinner" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Loading dashboard..." })
    ] });
  }
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dashboard-container", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "error-message", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleLogout, className: "logout-button", children: "Logout" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dashboard-container", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "dashboard-header", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { children: "Admin Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "user-info", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Welcome, ",
          user?.name || user?.email
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleHamburgerMenuToggle, className: "hamburger-btn", children: "☰" })
      ] })
    ] }),
    showHamburgerMenu && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hamburger-menu", ref: menuRef, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleMenuItemClick("dashboard"), className: "menu-item", children: "Dashboard Admin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleMenuItemClick("createEmployee"), className: "menu-item", children: "Créer Employé" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleMenuItemClick("manageEmployees"), className: "menu-item", children: "Gestion des Employés" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleMenuItemClick("managePackages"), className: "menu-item", children: "Gestion des Forfaits" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleMenuItemClick("expenses"), className: "menu-item", children: "Charges" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleMenuItemClick("statistics"), className: "menu-item", children: "Statistiques" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleMenuItemClick("annualProfit"), className: "menu-item", children: "Bénéfices Annuels" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "menu-divider" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleLogout, className: "menu-item logout-item", children: "Déconnexion" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dashboard-content", children: [
      dashboardData && dashboardData.data ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "dashboard-stats", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Chiffre d'Affaires" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "stat-value", children: [
            "€",
            dashboardData.data.summary?.turnover || 0
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Bénéfice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "stat-value", children: [
            "€",
            dashboardData.data.summary?.profit || 0
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Employés" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "stat-value", children: dashboardData.data.summary?.employeeCount || 0 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "stat-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { children: "Forfaits Actifs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "stat-value", children: dashboardData.data.summary?.packageCount || 0 })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "no-data", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Aucune donnée disponible" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "employees-section", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Équipe" }),
        employees.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "employees-grid", children: employees.map((employee) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          EmployeeCard,
          {
            employee,
            onCardClick: handleEmployeeCardClick
          },
          employee.id
        )) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "no-employees", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Aucun employé enregistré" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowCreateEmployeeModal(true), className: "create-employee-button", children: "Créer le premier employé" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CreateEmployeeModal,
      {
        isOpen: showCreateEmployeeModal,
        onClose: () => setShowCreateEmployeeModal(false),
        onEmployeeCreated: handleEmployeeCreated
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      EmployeeDetailsModal,
      {
        isOpen: showEmployeeDetailsModal,
        onClose: () => setShowEmployeeDetailsModal(false),
        employee: selectedEmployee
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PackageManagementModal,
      {
        isOpen: showPackageManagementModal,
        onClose: () => setShowPackageManagementModal(false)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ExpenseModal,
      {
        isOpen: showExpenseModal,
        onClose: () => setShowExpenseModal(false)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StatisticsModal,
      {
        isOpen: showStatisticsModal,
        onClose: () => setShowStatisticsModal(false)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      EmployeeManagementModal,
      {
        isOpen: showEmployeeManagementModal,
        onClose: () => setShowEmployeeManagementModal(false),
        onEmployeeUpdated: handleEmployeeUpdated
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AnnualProfitModal,
      {
        isOpen: showAnnualProfitModal,
        onClose: () => setShowAnnualProfitModal(false)
      }
    )
  ] });
};
export {
  AdminDashboard as default
};
