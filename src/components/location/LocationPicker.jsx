import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import "./leafletIconFix";

// Controlador para centrar y reenfocar suavemente el mapa
function RecenterMap({ position }) {
  const map = useMap();
  if (position) {
    map.flyTo(position, 16, { animate: true, duration: 1.2 });
  }
  return null;
}

// Captura de clics manuales sobre el mapa
function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function LocationPicker({ onLocationSelect }) {
  const [showMap, setShowMap] = useState(false);
  const [position, setPosition] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Coordenadas por defecto (Zona Norte / Warnes / Santa Cruz)
  const defaultCenter = [-17.698, -63.155];

  function handleSelect(coords) {
    setPosition(coords);
    setResults([]);
    onLocationSelect({ lat: coords[0], lng: coords[1] });
  }

  async function runSearch() {
    if (!searchText.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&countrycodes=bo&limit=5`
      );
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Error en geocodificación Nominatim:", err);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function handleSearchClick(e) {
    e.preventDefault();
    runSearch();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      runSearch();
    }
  }

  function pickResult(r) {
    const lat = parseFloat(r.lat);
    const lon = parseFloat(r.lon);
    handleSelect([lat, lon]);
  }

  if (!showMap) {
    return (
      <div className="picker-trigger-box">
        <button
          type="button"
          onClick={() => setShowMap(true)}
          className="btn btn-outline btn-open-map"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          Abrir mapa y marcar ubicación física
        </button>
        <span className="picker-hint">Requerido para obtener la insignia de «Ubicación verificada».</span>
      </div>
    );
  }

  return (
    <div className="location-picker-card">
      <div className="picker-search-container">
        <div className="search-box-wrapper" style={{ maxWidth: "100%" }}>
          <input
            type="text"
            className="search-input"
            placeholder="Escribe tu barrio, avenida o referencia (ej. Satélite Norte, Warnes)..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button
          type="button"
          className="btn btn-primary btn-picker-search"
          onClick={handleSearchClick}
          disabled={searching}
        >
          {searching ? "Buscando..." : "Buscar zona"}
        </button>
      </div>

      {/* Resultados de búsqueda con Nominatim */}
      {results.length > 0 && (
        <ul className="picker-results-list">
          {results.map((r) => (
            <li key={r.place_id}>
              <button
                type="button"
                className="picker-result-item"
                onClick={() => pickResult(r)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>{r.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="picker-instructions">
        💡 <strong>Haz clic directamente en el mapa</strong> sobre la calle o manzana exacta donde queda tu tienda o casa para fijar el marcador.
      </p>

      {/* Contenedor del Mapa Leaflet */}
      <div className="picker-map-viewport">
        <MapContainer
          center={position || defaultCenter}
          zoom={14}
          className="leaflet-interactive-map"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onSelect={handleSelect} />
          {position && (
            <>
              <RecenterMap position={position} />
              <Marker position={position}>
                <Popup>
                  <strong>Tu tienda / domicilio</strong>
                  <br />
                  Ubicación física seleccionada
                </Popup>
              </Marker>
            </>
          )}
        </MapContainer>
      </div>

      {/* Indicador de posición seleccionada */}
      {position ? (
        <div className="picker-status-badge success">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Punto fijado: <strong>{position[0].toFixed(5)}, {position[1].toFixed(5)}</strong></span>
        </div>
      ) : (
        <div className="picker-status-badge pending">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Aún no has marcado el punto sobre el mapa. Haz clic sobre la zona.</span>
        </div>
      )}
    </div>
  );
}