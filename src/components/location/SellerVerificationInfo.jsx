import VerifiedBadge from "./VerifiedBadge";
import SellerLocationMap from "./SellerLocationMap";

export default function SellerVerificationInfo({ seller }) {
  const isVerified = Boolean(
    seller?.hasVerifiedLocation &&
    seller?.location?.lat &&
    seller?.location?.lng
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
            Este comercio registró su localización física y la imagen de su frontis comercial para brindar certeza sobre su existencia física.
          </p>

          {/* Mapa con OpenStreetMap / Leaflet */}
          <div className="verification-map-block">
            <span className="block-label">Ubicación física en el mapa:</span>
            <SellerLocationMap location={seller.location} sellerName={seller.name} />
          </div>

          {/* Fotografía de fachada */}
          {seller.storePhotoUrl && (
            <div className="verification-photo-block">
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
          <div className="warning-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div>
            <h5>Vendedor sin verificación física</h5>
            <p>
              Este vendedor aún no ha completado el registro de su ubicación en el mapa ni la fotografía de su fachada. Coordina la entrega en lugares públicos seguros.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}