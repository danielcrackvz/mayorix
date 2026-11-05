import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);
      await signup(email.trim(), password, name.trim(), phone.trim());
      navigate("/");
    } catch (err) {
      console.error("Error al registrar cuenta:", err);
      setError("No se pudo completar el registro. Verifica el correo e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container main-content">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <h2>Crear cuenta en Mayorix</h2>
            <p>Regístrate como comprador o vendedor de productos al por mayor y menor.</p>
          </div>

          {error && (
            <div className="form-error-banner">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="field-label">Nombre completo o nombre del negocio *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. Benjamín Flores"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="field-label">Teléfono o WhatsApp de contacto *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="Ej. 70000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="field-label">Correo electrónico *</label>
              <input
                type="email"
                className="form-input"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="field-label">Contraseña (mínimo 6 caracteres) *</label>
              <input
                type="password"
                className="form-input"
                placeholder="Crea una contraseña segura"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-btn-submit"
              disabled={loading}
            >
              {loading ? "Creando tu cuenta..." : "Registrarme"}
            </button>
          </form>

          <div className="auth-footer-prompt">
            <span>¿Ya tienes una cuenta registrada?</span>
            <Link to="/login" className="auth-alt-link">
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}