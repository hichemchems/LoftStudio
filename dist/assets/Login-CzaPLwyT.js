import { u as useAuth, j as jsxRuntimeExports } from "./index-BR6G2AvJ.js";
import { r as reactExports, c as useNavigate, u as useLocation, L as Link } from "./router-BXlQiAzZ.js";
import { u as useForm } from "./index.esm-Bxh-u2zK.js";
import "./vendor-Bag_gwg1.js";
import "./ui-C9wwLtAx.js";
const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  console.log("Login component rendered");
  const onSubmit = async (data) => {
    console.log("Login form submitted with data:", { email: data.email, password: "***" });
    setLoading(true);
    setError("");
    const result = await login(data.email, data.password);
    setLoading(false);
    if (result.success) {
      console.log("Login successful, navigating to:", from);
      navigate(from, { replace: true });
    } else {
      console.log("Login failed with error:", result.error);
      setError(result.error);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "auth-container", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "auth-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Login to EasyGestion" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "auth-form", children: [
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "password", children: "Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "password",
            id: "password",
            autoComplete: "current-password",
            ...register("password", { required: "Password is required" }),
            className: errors.password ? "error" : ""
          }
        ),
        errors.password && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "error-message", children: errors.password.message })
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "error-message", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: loading, className: "auth-button", children: loading ? "Logging in..." : "Login" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "auth-link", children: [
      "Don't have an account? ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/register", children: "Register here" })
    ] })
  ] }) });
};
export {
  Login as default
};
