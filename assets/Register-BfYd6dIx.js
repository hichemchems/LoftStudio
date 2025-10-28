import { u as useAuth, j as jsxRuntimeExports } from "./index-BR6G2AvJ.js";
import { r as reactExports, c as useNavigate, L as Link } from "./router-BXlQiAzZ.js";
import { u as useForm } from "./index.esm-Bxh-u2zK.js";
import "./vendor-Bag_gwg1.js";
import "./ui-C9wwLtAx.js";
const Register = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [error, setError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const password = watch("password");
  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    const result = await registerUser({
      username: data.username,
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role || "user"
    });
    setLoading(false);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "auth-container", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Register for Loft Barber" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "auth-form", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "username", children: "Username" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            id: "username",
            autoComplete: "username",
            ...register("username", {
              required: "Username is required",
              minLength: { value: 3, message: "Username must be at least 3 characters" },
              maxLength: { value: 50, message: "Username must be less than 50 characters" },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: "Username can only contain letters, numbers, and underscores"
              }
            }),
            className: errors.username ? "error" : ""
          }
        ),
        errors.username && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "error-message", children: errors.username.message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "email",
            id: "email",
            autoComplete: "email",
            ...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address"
              }
            }),
            className: errors.email ? "error" : ""
          }
        ),
        errors.email && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "error-message", children: errors.email.message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "name", children: "Full Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            id: "name",
            autoComplete: "name",
            ...register("name", {
              required: "Full name is required",
              minLength: { value: 2, message: "Name must be at least 2 characters" },
              maxLength: { value: 100, message: "Name must be less than 100 characters" }
            }),
            className: errors.name ? "error" : ""
          }
        ),
        errors.name && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "error-message", children: errors.name.message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "password", children: "Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "password",
            id: "password",
            autoComplete: "new-password",
            ...register("password", {
              required: "Password is required",
              minLength: { value: 14, message: "Password must be at least 14 characters" },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                message: "Password must contain uppercase, lowercase, number, and special character"
              }
            }),
            className: errors.password ? "error" : ""
          }
        ),
        errors.password && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "error-message", children: errors.password.message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "confirmPassword", children: "Confirm Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "password",
            id: "confirmPassword",
            autoComplete: "new-password",
            ...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) => value === password || "Passwords do not match"
            }),
            className: errors.confirmPassword ? "error" : ""
          }
        ),
        errors.confirmPassword && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "error-message", children: errors.confirmPassword.message })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "role", children: "Role" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { id: "role", ...register("role"), defaultValue: "user", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "user", children: "User" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "admin", children: "Admin" })
        ] })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "error-message", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: loading, className: "auth-button", children: loading ? "Registering..." : "Register" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "auth-link", children: [
      "Already have an account? ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", children: "Login here" })
    ] })
  ] }) });
};
export {
  Register as default
};
