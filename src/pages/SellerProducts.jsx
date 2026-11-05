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
      <section style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 0 1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary)" }}>Mis publicaciones</h1>
            <VerifiedBadge verified={isVerified} />
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Administra los artículos que tienes en venta en Mayorix.
          </p>
        </div>

        <Link to="/publicar" className="btn btn-primary">
          + Nuevo producto
        </Link>
      </section>

      {/* Contadores con separación adecuada */}
      <div style={{ display: "flex", gap: "1rem", margin: "1rem 0 1.5rem" }}>
        <div style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "0.75rem 1.25rem" }}>
          <span style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--primary)", display: "block" }}>
            {products.length}
          </span>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)" }}>
            Productos activos
          </span>
        </div>
        <div style={{ background: "#ffffff", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "0.75rem 1.25rem" }}>
          <span style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--primary)", display: "block" }}>
            {products.reduce((acc, curr) => acc + (parseInt(curr.stock) || 0), 0)}
          </span>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)" }}>
            Unidades en stock
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>Cargando tus productos...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", background: "#ffffff", borderRadius: "12px", border: "1px dashed var(--border-color)" }}>
          <h3 style={{ marginBottom: "0.4rem" }}>Aún no tienes productos publicados</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
            Publica tu primer artículo al por mayor o menor.
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
                  <img src={imageSrc} alt={product.title} className="product-image" />
                </div>
                <div className="product-card-body">
                  <h4 className="product-title">{product.title}</h4>
                  <div className="product-pricing-row">
                    <span className="product-price">Bs {product.price}</span>
                    <span className="product-sale-tag">Stock: {product.stock}</span>
                  </div>
                  <Link to={`/producto/${product.id}`} className="btn btn-outline" style={{ marginTop: "0.75rem", fontSize: "0.8rem", padding: "0.4rem" }}>
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