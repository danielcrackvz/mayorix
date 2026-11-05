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
      console.error("Error al salir:", error);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="navbar">
        <div className="container navbar-inner">
          {/* Lado Izquierdo: Botón Hamburguesa + Logo Mayorix */}
          <div className="navbar-left-group">
            <button
              type="button"
              className={`hamburger-btn ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Abrir menú de navegación"
            >
              <span className="h-bar"></span>
              <span className="h-bar"></span>
              <span className="h-bar"></span>
            </button>

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
          </div>

          {/* Enlaces tradicionales visibles solo en computadoras */}
          <nav className="desktop-nav-links">
            <Link to="/" className="desktop-nav-item">Catálogo</Link>
            {currentUser && (
              <>
                <Link to="/mis-productos" className="desktop-nav-item">Mis productos</Link>
                <Link to="/mensajes" className="desktop-nav-item">Mensajes</Link>
                <Link to="/publicar" className="btn-nav-publish-desktop">+ Publicar</Link>
              </>
            )}
          </nav>

          {/* Lado Derecho del Header: Iniciar sesión o Salir */}
          <div className="navbar-right-group">
            {currentUser ? (
              <button onClick={handleLogout} className="btn-header-logout">
                Salir
              </button>
            ) : (
              <Link to="/login" className="btn-header-login">
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Menú Lateral (Drawer) que se abre de izquierda a derecha */}
      <aside className={`lateral-drawer ${menuOpen ? "drawer-open" : ""}`}>
        <div className="drawer-header">
          <div className="drawer-title-group">
            <div className="brand-icon small">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              </svg>
            </div>
            <span className="drawer-brand-name">Mayorix</span>
          </div>
          <button type="button" className="drawer-close-btn" onClick={closeMenu} aria-label="Cerrar menú">
            ✕
          </button>
        </div>

        <nav className="drawer-nav-list">
          <Link to="/" className="drawer-item" onClick={closeMenu}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Catálogo general</span>
          </Link>

          {currentUser ? (
            <>
              <Link to="/mis-productos" className="drawer-item" onClick={closeMenu}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                <span>Mis publicaciones</span>
              </Link>

              <Link to="/publicar" className="drawer-item" onClick={closeMenu}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                <span>Publicar nuevo producto</span>
              </Link>

              <Link to="/mensajes" className="drawer-item" onClick={closeMenu}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>Mensajes directos</span>
              </Link>

              <button type="button" className="drawer-logout-action" onClick={handleLogout}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Cerrar sesión</span>
              </button>
            </>
          ) : (
            <Link to="/registro" className="drawer-item" onClick={closeMenu}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              <span>Crear cuenta gratis</span>
            </Link>
          )}
        </nav>
      </aside>

      {/* Fondo oscuro traslúcido: al hacer clic sobre él, se cierra el menú */}
      <div
        className={`drawer-backdrop ${menuOpen ? "active" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
    </>
  );
}