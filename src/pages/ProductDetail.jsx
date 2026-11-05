import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProductById } from "../services/products";
import { getSellerProfile } from "../services/sellers";
import { getOrCreateChat } from "../services/chat";
import SellerVerificationInfo from "../components/location/SellerVerificationInfo";

export default function ProductDetail() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isContacting, setIsContacting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getProductById(id)
      .then(async (data) => {
        if (!isMounted) return;
        if (!data) {
          setProduct(null);
          setLoading(false);
          return;
        }

        setProduct(data);
        if (data.sellerId) {
          try {
            const sellerData = await getSellerProfile(data.sellerId);
            if (isMounted) setSeller(sellerData);
          } catch (err) {
            console.error("Error al cargar perfil del vendedor:", err);
          }
        }
        if (isMounted) setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener producto:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  async function handleContact() {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      setIsContacting(true);
      const chatId = await getOrCreateChat(
        currentUser.uid,
        product.sellerId,
        product.id,
        product.title
      );
      navigate(`/mensajes/${chatId}`);
    } catch (error) {
      console.error("Error al iniciar el chat:", error);
      setIsContacting(false);
    }
  }

  if (loading) {
    return (
      <div className="container main-content">
        <div className="loading-container">
          <div className="spinner"></div>
          <p style={{ color: "var(--text-muted)", fontWeight: 500 }}>Cargando información del producto...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container main-content">
        <div className="empty-catalog" style={{ marginTop: "3rem" }}>
          <h3>Producto no encontrado</h3>
          <p>El artículo que buscas no existe o fue retirado por el vendedor.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const images = (product.images && product.images.length > 0)
    ? product.images
    : ["https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80"];

  const isOwner = currentUser?.uid === product.sellerId;

  return (
    <div className="container main-content">
      {/* Botón de regreso / Breadcrumb */}
      <div className="detail-breadcrumb">
        <Link to="/" className="back-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Volver al catálogo
        </Link>
      </div>

      <div className="product-detail-layout">
        {/* Columna Izquierda: Galería y Descripción */}
        <div className="detail-left-col">
          <div className="main-image-viewport">
            <img
              src={images[selectedImageIndex] || images[0]}
              alt={product.title}
              className="detail-main-img"
            />
          </div>

          {images.length > 1 && (
            <div className="thumbnails-strip">
              {images.map((imgUrl, index) => (
                <button
                  key={index}
                  type="button"
                  className={`thumbnail-btn ${selectedImageIndex === index ? "active" : ""}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img src={imgUrl} alt={`${product.title} miniatura ${index + 1}`} />
                </button>
              ))}
            </div>
          )}

          {/* Tarjeta de descripción detallada */}
          <div className="detail-card description-card">
            <h3>Descripción del producto</h3>
            <p className="description-text">{product.description || "Sin descripción proporcionada."}</p>
          </div>
        </div>

        {/* Columna Derecha: Precios, Acciones y Verificación */}
        <div className="detail-right-col">
          <div className="detail-card product-summary-card">
            <span className="product-sale-tag">
              {product.saleType === "ambos"
                ? "Venta por mayor y menor"
                : `Venta al por ${product.saleType}`}
            </span>

            <h1 className="detail-product-title">{product.title}</h1>

            <div className="detail-price-box">
              <span className="price-currency">Bs</span>
              <span className="price-amount">{product.price}</span>
            </div>

            <div className="detail-meta-grid">
              <div className="meta-box">
                <span className="meta-label">Stock disponible</span>
                <span className="meta-value">{product.stock || 0} unidades</span>
              </div>
              <div className="meta-box">
                <span className="meta-label">Vendedor</span>
                <span className="meta-value">{seller?.name || product.sellerName || "Vendedor local"}</span>
              </div>
            </div>

            {/* Acciones de Contacto */}
            <div className="detail-cta-zone">
              {isOwner ? (
                <div className="owner-alert-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>Esta es tu publicación activa. Puedes gestionarla desde «Mis productos».</span>
                </div>
              ) : (
                <button
                  onClick={handleContact}
                  disabled={isContacting}
                  className="btn btn-primary btn-contact-seller"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  {isContacting ? "Abriendo chat..." : "Contactar al vendedor"}
                </button>
              )}
            </div>
          </div>

          {/* Módulo de Verificación Geográfica y Frontis Comercial */}
          <SellerVerificationInfo seller={seller} />
        </div>
      </div>
    </div>
  );
}