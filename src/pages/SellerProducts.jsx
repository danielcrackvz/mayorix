import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProductsBySeller } from "../services/products";
import { getSellerProfile } from "../services/sellers";
import VerifiedBadge from "../components/location/VerifiedBadge";

export default function SellerProducts() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    Promise.all([
      getProductsBySeller(currentUser.uid),
      getSellerProfile(currentUser.uid)
    ])
      .then(([prods, profile]) => {
        if (!isMounted) return;
        setProducts(prods || []);
        setSellerProfile(profile);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar panel de vendedor:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser?.uid]);

  const isVerified = Boolean(
    sellerProfile?.location?.lat &&
    sellerProfile?.location?.lng &&
    sellerProfile?.storePhotoUrl
  );

  return (
    <div className="container main-content">
      {/* Cabecera responsiva: en móvil se apila y nunca se sale de la pantalla */}
      <section className="seller-dashboard-header">
        <div className="seller-header-left">
          <div className="seller-title-badge-row">
            <h1>Mis publicaciones</h1>
            <VerifiedBadge verified={isVerified} />
          </div>
          <p className="seller-subtitle">
            Administra los artículos que tienes en venta dentro del marketplace Mayorix.
          </p>
        </div>

        <Link to="/publicar" className="btn btn-primary btn-add-product">
          + Nuevo producto
        </Link>
      </section>

      {/* Tarjetas de estadísticas rápidas */}
      <div className="seller-stats-strip">
        <div className="stat-card">
          <span className="stat-num">{products.length}</span>
          <span className="stat-text">Productos activos</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">
            {products.reduce((acc, curr) => acc + (parseInt(curr.stock, 10) || 0), 0)}
          </span>
          <span className="stat-text">Unidades en stock</span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          Cargando tus publicaciones...
        </div>
      ) : products.length === 0 ? (
        <div className="empty-catalog">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 1rem", color: "var(--text-light)" }}>
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
          <h3 style={{ marginBottom: "0.4rem" }}>Aún no tienes productos publicados</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
            Comienza a vender al por mayor o al por menor publicando tu primer artículo.
          </p>
          <Link to="/publicar" className="btn btn-primary">
            Publicar mi primer producto
          </Link>
        </div>
      ) : (
        <div className="catalog-grid">
          {products.map((product) => {
            const imageSrc = (product.images && product.images.length > 0)
              ? product.images[0]
              : "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80";

            return (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <img src={imageSrc} alt={product.title} className="product-image" loading="lazy" />
                  <div className="product-badge-overlay">
                    <span className="stock-pill">Stock: {product.stock || 0} u.</span>
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

                  <Link to={`/producto/${product.id}`} className="btn btn-outline" style={{ marginTop: "0.75rem", fontSize: "0.82rem", padding: "0.45rem" }}>
                    Ver detalle público
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}