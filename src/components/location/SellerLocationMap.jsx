import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "./leafletIconFix";

export default function SellerLocationMap({ location, sellerName }) {
  // Validación de coordenadas para evitar errores de renderizado
  if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
    return (
      <div className="map-unavailable-fallback">
        <p>Coordenadas geográficas no especificadas.</p>
      </div>
    );
  }

  const coords = [location.lat, location.lng];
  const osmUrl = `https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}#map=17/${location.lat}/${location.lng}`;

  return (
    <div className="map-wrapper">
      <MapContainer
        center={coords}
        zoom={16}
        className="leaflet-detail-map"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coords}>
          <Popup>
            <strong>{sellerName || "Ubicación del vendedor"}</strong>
            <br />
            Punto registrado de venta
          </Popup>
        </Marker>
      </MapContainer>

      <div className="map-footer-bar">
        <a href={osmUrl} target="_blank" rel="noopener noreferrer" className="osm-external-link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
          Abrir en mapa completo
        </a>
      </div>
    </div>
  );
}