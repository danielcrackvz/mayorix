import VerifiedBadge from "./VerifiedBadge";
import SellerLocationMap from "./SellerLocationMap";

export default function SellerVerificationInfo({ seller }) {
  // Regla estricta: tiene mapa Y foto
  const isVerified = Boolean(
    seller?.location?.lat &&
    seller?.location?.lng &&
    seller?.storePhotoUrl
  );

  return (
    <section className={`verification-panel ${isVerified ? "panel-verified" : "panel-unverified"}`}>
      <div className="verification-panel-header">
        <div className="verification-title-group">
          <h4>Seguridad y ubicación</h4>
          <span className="verification-subtitle">Respaldo físico del comercio</span>
        </div>
        <VerifiedBadge verified={isVerified} />
      </div>

      {isVerified ? (
        <div className="verification-content">
          <p className="verification-explainer">
            Este comercio registró su localización física y la imagen de su frontis comercial para brindar certeza sobre su existencia real.
          </p>

          <div style={{ marginBottom: "1rem" }}>
            <span className="block-label">Ubicación física en el mapa:</span>
            <SellerLocationMap location={seller.location} sellerName={seller.name} />
          </div>

          {seller.storePhotoUrl && (
            <div>
              <span className="block-label">Fotografía del frontis comercial / local:</span>
              <div className="store-photo-wrapper">
                <img
                  src={seller.storePhotoUrl}
                  alt={`Fachada de ${seller.name || "tienda"}`}
                  className="store-facade-img"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="unverified-warning-box">
          <div>
            <h5>Vendedor sin verificación física completa</h5>
            <p>
              Este vendedor aún no ha completado el registro de su ubicación en el mapa y la fotografía de su fachada comercial. Coordina la entrega en lugares públicos seguros.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}