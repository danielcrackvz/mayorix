import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createProduct } from "../services/products";
import { verifySellerLocation } from "../services/sellers";
import { uploadImage } from "../services/cloudinary";
import LocationPicker from "../components/location/LocationPicker";

export default function PublishProduct() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  // Campos comerciales del producto
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [saleType, setSaleType] = useState("ambos");
  const [files, setFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Campos de verificación física del vendedor
  const [location, setLocation] = useState(null);
  const [storePhoto, setStorePhoto] = useState(null);
  const [storePhotoPreview, setStorePhotoPreview] = useState(null);

  // Estados de proceso
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const needsVerification = !userProfile?.hasVerifiedLocation;

  // Manejo de fotografías del producto y generación de miniaturas locales
  function handleFilesChange(e) {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    const previews = selectedFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  }

  // Manejo de la foto de la fachada del local
  function handleStorePhotoChange(e) {
    const file = e.target.files[0];
    if (file) {
      setStorePhoto(file);
      setStorePhotoPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!currentUser) {
      setError("Debes iniciar sesión para publicar un producto.");
      return;
    }

    if (files.length === 0) {
      setError("Sube al menos una fotografía del producto.");
      return;
    }

    if (needsVerification && (!location || !storePhoto)) {
      setError("Debes marcar tu punto en el mapa y subir la foto del frontis de tu tienda para verificar tu cuenta.");
      return;
    }

    try {
      setUploading(true);

      // Subida de fotografías del producto a Cloudinary
      const imageUrls = await Promise.all(
        Array.from(files).map((file) => uploadImage(file))
      );

      // Si el vendedor aún no está verificado, procesar geolocalización y foto de fachada
      if (needsVerification) {
        const storePhotoUrl = await uploadImage(storePhoto);
        await verifySellerLocation(currentUser.uid, location, storePhotoUrl);
      }

      // Creación del registro en Firestore / Realtime Database
      await createProduct({
        sellerId: currentUser.uid,
        sellerName: userProfile?.name || currentUser.displayName || "Vendedor local",
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        saleType,
        images: imageUrls,
        hasVerifiedLocation: true,
      });

      navigate("/mis-productos");
    } catch (err) {
      console.error("Error al publicar:", err);
      setError("Ocurrió un error al guardar tu publicación. Revisa tu conexión e intenta nuevamente.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="container main-content">
      <div className="publish-wrapper">
        <div className="publish-header">
          <Link to="/mis-productos" className="back-link">
            ← Volver a mis publicaciones
          </Link>
          <h2>Publicar nuevo artículo</h2>
          <p className="publish-lead">
            Completa la información técnica, modalidad de venta y fotografías para exhibir tu producto en Mayorix.
          </p>
        </div>

        {error && (
          <div className="form-error-banner">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="publish-form">
          {/* Bloque 1: Información comercial */}
          <section className="form-section-card">
            <h3 className="section-title">1. Detalles del producto</h3>

            <div className="form-group">
              <label className="field-label">Nombre o título de la publicación *</label>
              <input
                className="form-input"
                type="text"
                placeholder="Ej. Fardo de ropa americana de primera calidad"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="field-label">Descripción detallada *</label>
              <textarea
                className="form-input form-textarea"
                rows={4}
                placeholder="Indica especificaciones, estado físico, colores o condiciones de entrega..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="field-label">Precio base (Bs) *</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.01"
                  min="0.1"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="field-label">Stock disponible (unidades) *</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  placeholder="Cantidad"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="field-label">Modalidad comercial *</label>
                <select
                  className="form-input form-select"
                  value={saleType}
                  onChange={(e) => setSaleType(e.target.value)}
                >
                  <option value="ambos">Al por mayor y menor</option>
                  <option value="mayor">Solo al por mayor</option>
                  <option value="menor">Solo al por menor</option>
                </select>
              </div>
            </div>
          </section>

          {/* Bloque 2: Fotos del Producto */}
          <section className="form-section-card">
            <h3 className="section-title">2. Fotografías del producto</h3>
            <p className="section-help-text">
              Selecciona una o varias imágenes claras del producto. La primera foto será la portada visible en el catálogo.
            </p>

            <div className="file-upload-box">
              <input
                type="file"
                id="product-images-input"
                accept="image/*"
                multiple
                onChange={handleFilesChange}
                className="hidden-file-input"
                required={imagePreviews.length === 0}
              />
              <label htmlFor="product-images-input" className="file-upload-label">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Hacer clic para seleccionar fotos</span>
                <small>Formatos JPG, PNG o WEBP</small>
              </label>
            </div>

            {/* Galería de previsualización */}
            {imagePreviews.length > 0 && (
              <div className="previews-grid">
                {imagePreviews.map((url, i) => (
                  <div key={i} className="preview-item">
                    <img src={url} alt={`Preview ${i + 1}`} />
                    {i === 0 && <span className="cover-tag">Portada</span>}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Bloque 3: Módulo de Verificación Geográfica */}
          <section className="form-section-card verification-block">
            <div className="verification-block-header">
              <div className="shield-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div>
                <h3 className="section-title" style={{ margin: 0 }}>
                  3. Verificación de ubicación y legitimidad
                </h3>
                <span className="section-help-text">
                  Requisito de seguridad física de Mayorix para certificar la existencia de tu tienda o negocio ante compradores.
                </span>
              </div>
            </div>

            {!needsVerification ? (
              <div className="already-verified-box">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Tu cuenta ya cuenta con ubicación verificada y foto de fachada comercial registradas previamente.</span>
              </div>
            ) : (
              <div className="verification-inputs-zone">
                <div className="form-group">
                  <label className="field-label">Selección en el mapa interactivo (OpenStreetMap) *</label>
                  <LocationPicker onLocationSelect={setLocation} />
                </div>

                <div className="form-group" style={{ marginTop: "1.25rem" }}>
                  <label className="field-label">Fotografía del frontis / fachada del local o casa *</label>
                  <p className="section-help-text">
                    Sube una foto clara del frente de tu establecimiento para que los compradores reconozcan el lugar.
                  </p>
                  
                  <div className="file-upload-box small">
                    <input
                      type="file"
                      id="facade-photo-input"
                      accept="image/*"
                      onChange={handleStorePhotoChange}
                      className="hidden-file-input"
                      required={needsVerification && !storePhoto}
                    />
                    <label htmlFor="facade-photo-input" className="file-upload-label">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <span>{storePhoto ? storePhoto.name : "Seleccionar foto de la fachada"}</span>
                    </label>
                  </div>

                  {storePhotoPreview && (
                    <div className="facade-preview-wrapper">
                      <img src={storePhotoPreview} alt="Fachada comercial" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Botón de Envío */}
          <div className="form-actions-bottom">
            <button
              type="submit"
              className="btn btn-primary btn-submit-publish"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="spinner small-spinner"></div>
                  Procesando y publicando en Mayorix...
                </>
              ) : (
                "Completar y publicar producto"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}