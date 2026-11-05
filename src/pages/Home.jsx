import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllProducts } from "../services/products";
import { getSellerProfile } from "../services/sellers";
import VerifiedBadge from "../components/location/VerifiedBadge";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todos");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getAllProducts()
      .then(async (data) => {
        if (!isMounted) return;
        if (!data || data.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Consultar perfiles de vendedores para verificar los dos requisitos
        const sellerIds = [...new Set(data.map((p) => p.sellerId).filter(Boolean))];
        const sellersMap = {};

        await Promise.all(
          sellerIds.map(async (sid) => {
            try {
              const profile = await getSellerProfile(sid);
              if (profile) sellersMap[sid] = profile;
            } catch (err) {
              console.error("Error al cargar vendedor:", sid, err);
            }
          })
        );

        // Regla estricta: tiene mapa (lat+lng) Y foto del local
        const enriched = data.map((prod) => {
          const seller = sellersMap[prod.sellerId];
          const hasMap = Boolean(
            (seller?.location?.lat && seller?.location?.lng) ||
            (prod?.location?.lat && prod?.location?.lng)
          );
          const hasPhoto = Boolean(seller?.storePhotoUrl || prod?.storePhotoUrl);
          const isVerified = Boolean(hasMap && hasPhoto);

          return {
            ...prod,
            isSellerVerified: isVerified,
          };
        });

        if (isMounted) {
          setProducts(enriched);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error al cargar productos:", error);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === "todos") return true;
    if (filterType === "mayor") return product.saleType === "mayor" || product.saleType === "ambos";
    if (filterType === "menor") return product.saleType === "menor" || product.saleType === "ambos";
    return true;
  });

  return (
    <div className="container main-content">
      <section className="catalog-header">
        <div className="catalog-title-group">
          <h1>Catálogo Mayorix</h1>
          <p>Compra y venta al por mayor y menor con verificación física y geográfica de vendedores.</p>
        </div>

        <div className="catalog-controls">
          <div className="search-box-wrapper">
            <span className="search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar productos por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-pills">
            <button
              type="button"
              className={`pill-btn ${filterType === "todos" ? "active" : ""}`}
              onClick={() => setFilterType("todos")}
            >
              Todos ({products.length})
            </button>
            <button
              type="button"
              className={`pill-btn ${filterType === "mayor" ? "active" : ""}`}
              onClick={() => setFilterType("mayor")}
            >
              Al por mayor
            </button>
            <button
              type="button"
              className={`pill-btn ${filterType === "menor" ? "active" : ""}`}
              onClick={() => setFilterType("menor")}
            >
              Al por menor
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
          Cargando catálogo Mayorix...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
          <h3>No se encontraron productos</h3>
          <p>Intenta con otro término de búsqueda.</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {filteredProducts.map((product) => {
            const imageSrc = (product.images && product.images.length > 0)
              ? product.images[0]
              : "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80";

            return (
              <Link
                key={product.id}
                to={`/producto/${product.id}`}
                className="product-card"
              >
                <div className="product-image-container">
                  <img
                    src={imageSrc}
                    alt={product.title}
                    className="product-image"
                    loading="lazy"
                  />
                  <div className="product-badge-overlay">
                    <VerifiedBadge verified={product.isSellerVerified} />
                  </div>
                </div>

                <div className="product-card-body">
                  <h4 className="product-title">{product.title}</h4>
                  
                  <div className="product-pricing-row">
                    <span className="product-price">Bs {product.price}</span>
                    <span className="product-sale-tag">
                      {product.saleType === "ambos"
                        ? "Mayor y menor"
                        : `Al por ${product.saleType}`}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}