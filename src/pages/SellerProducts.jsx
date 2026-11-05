import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProductsBySeller } from "../services/products";
import VerifiedBadge from "../components/location/VerifiedBadge";

export default function SellerProducts() {
  const { currentUser, userProfile } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (currentUser?.uid) {
      getProductsBySeller(currentUser.uid)
        .then((data) => {
          if (isMounted) {
            setProducts(data || []);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error("Error al cargar productos del vendedor:", err);
          if (isMounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [currentUser?.uid]);

  const isVerified = Boolean(userProfile?.hasVerifiedLocation);

  return (
    <div className="container main-content">
      {/* Encabezado del Panel del Vendedor */}
      <section className="seller-dashboard-header">
        <div className="seller-header-left">
          <div className="seller-title-row">
            <h1>Mis publicaciones</h1>
            <VerifiedBadge verified={isVerified} />
          </div>
          <p className="seller-subtitle">
            Administra los artículos que tienes en venta dentro del marketplace Mayorix.
          </p>
        </div>

        <Link to="/publicar" className="btn btn-primary btn-add-product">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nuevo producto
        </Link>
      </section>

      {/* Resumen rápido */}
      <div className="seller-stats-strip">
        <div className="stat-card">
          <span className="stat-num">{products.length}</span>
          <span className="stat-text">Productos activos</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">
            {products.reduce((acc, curr) => acc + (parseInt(curr.stock) || 0), 0)}
          </span>
          <span className="stat-text">Unidades en inventario</span>
        </div>
      </div>

      {/* Estado de carga */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p style={{ color: "var(--text-muted)" }}>Cargando tu inventario...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-catalog">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 1rem", color: "var(--text-light)" }}>
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          <h3>Aún no tienes productos publicados</h3>
          <p>Comienza a vender al por mayor o menor publicando tu primer artículo.</p>
          <Link to="/publicar" className="btn btn-primary" style={{ marginTop: "1.25rem" }}>
            Publicar mi primer producto
          </Link>
        </div>
      ) : (
        /* Cuadrícula de productos del vendedor */
        <div className="catalog-grid">
          {products.map((product) => {
            const imageSrc = (product.images && product.images.length > 0)
              ? product.images[0]
              : "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80";

            return (
              <div key={product.id} className="product-card seller-product-card">
                <div className="product-image-container">
                  <img
                    src={imageSrc}
                    alt={product.title}
                    className="product-image"
                    loading="lazy"
                  />
                  <div className="product-badge-overlay">
                    <span className="stock-pill">
                      Stock: {product.stock || 0} u.
                    </span>
                  </div>
                </div>

                <div className="product-card-body">
                  <h4 className="product-title">{product.title}</h4>
                  
                  <div className="product-pricing-row">
                    <span className="product-price">Bs {product.price}</span>
                    <span className="product-sale-tag">
                      {product.saleType === "ambos" ? "Mayor y menor" : `Al por ${product.saleType}`}
                    </span>
                  </div>

                  <div className="seller-card-actions">
                    <Link to={`/producto/${product.id}`} className="btn btn-outline btn-sm-action">
                      Ver detalle público
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}