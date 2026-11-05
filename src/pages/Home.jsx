import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllProducts } from "../services/products";
import VerifiedBadge from "../components/location/VerifiedBadge";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todos");

  useEffect(() => {
    let isMounted = true;
    getAllProducts()
      .then((data) => {
        if (isMounted) {
          setProducts(data || []);
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

  // Filtrado reactivo por texto y modalidad (mayor/menor)
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === "todos") return true;
    if (filterType === "mayor") return product.saleType === "mayor" || product.saleType === "ambos";
    if (filterType === "menor") return product.saleType === "menor" || product.saleType === "ambos";
    return true;
  });

  return (
    <div className="container main-content">
      {/* Encabezado y Presentación */}
      <section className="catalog-header">
        <div className="catalog-title-group">
          <h1>Catálogo Mayorix</h1>
          <p>Compra y venta al por mayor y menor con verificación física y geográfica de vendedores.</p>
        </div>

        {/* Buscador y Filtros */}
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
              className={`pill-btn ${filterType === "todos" ? "active" : ""}`}
              onClick={() => setFilterType("todos")}
            >
              Todos ({products.length})
            </button>
            <button
              className={`pill-btn ${filterType === "mayor" ? "active" : ""}`}
              onClick={() => setFilterType("mayor")}
            >
              Al por mayor
            </button>
            <button
              className={`pill-btn ${filterType === "menor" ? "active" : ""}`}
              onClick={() => setFilterType("menor")}
            >
              Al por menor
            </button>
          </div>
        </div>
      </section>

      {/* Estado de carga */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p style={{ color: "var(--text-muted)", fontWeight: 500 }}>Cargando catálogo Mayorix...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-catalog">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 1rem", color: "var(--text-light)" }}>
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
          <h3>No se encontraron productos</h3>
          <p>Intenta cambiar los términos de búsqueda o selecciona otro filtro.</p>
        </div>
      ) : (
        /* Cuadrícula de Productos */
        <div className="catalog-grid">
          {filteredProducts.map((product) => {
            // Se valida si el vendedor o el producto cuenta con verificación geográfica
            const isVerified = Boolean(product.hasVerifiedLocation || product.sellerVerified);
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
                    <VerifiedBadge verified={isVerified} />
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