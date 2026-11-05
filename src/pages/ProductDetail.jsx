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
            console.error("Error al cargar vendedor:", err);
          }
        }
        if (isMounted) setLoading(false);
      })
      .catch((err) => {
        console.error(err);
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
      console.error("Error al iniciar chat:", error);
      setIsContacting(false);
    }
  }

  if (loading) {
    return (
      <div className="container main-content" style={{ textAlign: "center", padding: "3rem" }}>
        Cargando producto...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container main-content" style={{ textAlign: "center", padding: "3rem" }}>
        <h3>Producto no encontrado</h3>
        <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const isOwner = currentUser?.uid === product.sellerId;
  const imageSrc = (product.images && product.images.length > 0)
    ? product.images[0]
    : "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="container main-content">
      <div className="detail-breadcrumb">
        <Link to="/" className="back-link">
          ← Volver al catálogo
        </Link>
      </div>

      <div className="product-detail-layout">
        {/* Imagen y descripción */}
        <div className="detail-left-col">
          <div className="main-image-viewport">
            <img
              src={imageSrc}
              alt={product.title}
              className="detail-main-img"
            />
          </div>

          <div className="detail-card">
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "0.5rem" }}>
              Descripción del producto
            </h3>
            <p style={{ fontSize: "0.92rem", color: "#334155", lineHeight: 1.5 }}>
              {product.description || "Sin descripción proporcionada."}
            </p>
          </div>
        </div>

        {/* Datos comerciales, contacto y mapa de verificación */}
        <div className="detail-right-col">
          <div className="detail-card">
            <span className="product-sale-tag">
              {product.saleType === "ambos"
                ? "Al por mayor y menor"
                : `Al por ${product.saleType}`}
            </span>

            <h1 className="detail-product-title">{product.title}</h1>

            <div className="detail-price-box">
              <span className="price-currency">Bs</span>
              <span className="price-amount">{product.price}</span>
            </div>

            <div className="detail-meta-grid">
              <div className="meta-box">
                <span className="meta-label">Stock disponible:</span>
                <span className="meta-value">{product.stock || 0} unidades</span>
              </div>
              <div className="meta-box">
                <span className="meta-label">Vendedor:</span>
                <span className="meta-value">{seller?.name || product.sellerName || "Vendedor local"}</span>
              </div>
            </div>

            {isOwner ? (
              <div style={{ backgroundColor: "#e6f4f1", color: "#07433a", padding: "0.75rem", borderRadius: "8px", fontWeight: 700, fontSize: "0.85rem", textAlign: "center" }}>
                Esta es tu publicación activa.
              </div>
            ) : (
              <button
                type="button"
                onClick={handleContact}
                disabled={isContacting}
                className="btn btn-primary btn-contact-seller"
              >
                💬 {isContacting ? "Abriendo chat..." : "Contactar al vendedor"}
              </button>
            )}
          </div>

          {/* Panel con mapa y foto de la fachada */}
          <SellerVerificationInfo seller={seller} />
        </div>
      </div>
    </div>
  );
}