import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <span className="brand-name">Mayorix</span>
        </Link>

        {/* Botón Hamburguesa Móvil */}
        <button
          className={`menu-toggle ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Alternar menú de navegación"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        {/* Enlaces de Navegación */}
        <nav className={`navbar-links ${menuOpen ? "active" : ""}`}>
          <Link to="/" className="nav-item" onClick={closeMenu}>
            Catálogo
          </Link>

          {currentUser ? (
            <>
              <Link to="/mis-productos" className="nav-item" onClick={closeMenu}>
                Mis productos
              </Link>
              <Link to="/mensajes" className="nav-item" onClick={closeMenu}>
                Mensajes
              </Link>
              <Link to="/publicar" className="btn-publish-nav" onClick={closeMenu}>
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Publicar producto
              </Link>
              <button onClick={handleLogout} className="navbar-logout-btn">
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item" onClick={closeMenu}>
                Ingresar
              </Link>
              <Link to="/registro" className="btn-nav-outline" onClick={closeMenu}>
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}