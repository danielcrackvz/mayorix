import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listenToUserChats } from "../services/chat";
import ChatWindow from "../components/chat/ChatWindow";

export default function Messages() {
  const { currentUser } = useAuth();
  const { chatId } = useParams();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = listenToUserChats(currentUser.uid, (data) => {
      setChats(data || []);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser?.uid]);

  // Filtrado reactivo en la bandeja de conversaciones
  const filteredChats = chats.filter((c) =>
    (c.productTitle || "").toLowerCase().includes(searchFilter.toLowerCase()) ||
    (c.lastMessage || "").toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="container main-content">
      <div className="messages-page-wrapper">
        <div className="messages-layout">
          {/* Columna Izquierda: Lista de Conversaciones (Oculta en móvil si hay chat seleccionado) */}
          <aside className={`messages-sidebar ${chatId ? "mobile-hidden" : ""}`}>
            <div className="sidebar-header">
              <h3>Bandeja de mensajes</h3>
              <p className="sidebar-sub">Chats directos de compra y venta</p>
            </div>

            {/* Buscador de conversaciones */}
            <div className="sidebar-search">
              <input
                type="text"
                placeholder="Buscar por producto..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="sidebar-search-input"
              />
            </div>

            <div className="chats-list-scroll">
              {loading ? (
                <div className="sidebar-loading">
                  <div className="spinner small-spinner"></div>
                  <span>Sincronizando chats...</span>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="no-chats-box">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 0.5rem", color: "var(--text-light)" }}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <p>No hay mensajes que mostrar.</p>
                  <span className="no-chats-hint">
                    Los chats se iniciarán cuando contactes a un vendedor en el catálogo.
                  </span>
                </div>
              ) : (
                filteredChats.map((chat) => {
                  const isActive = chat.id === chatId;
                  return (
                    <Link
                      key={chat.id}
                      to={`/mensajes/${chat.id}`}
                      className={`chat-item-card ${isActive ? "active-chat" : ""}`}
                    >
                      <div className="chat-item-avatar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                      </div>

                      <div className="chat-item-content">
                        <div className="chat-item-row-top">
                          <strong className="chat-item-title">
                            {chat.productTitle || "Producto"}
                          </strong>
                        </div>

                        <p className="chat-item-snippet">
                          {chat.lastMessage || "Conversación iniciada..."}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </aside>

          {/* Columna Derecha: Ventana de Chat Activa */}
          <main className={`messages-chat-pane ${!chatId ? "mobile-hidden" : ""}`}>
            {chatId ? (
              <div className="chat-pane-content">
                {/* Botón de retroceso visible únicamente en pantallas móviles */}
                <div className="mobile-chat-back-bar">
                  <Link to="/mensajes" className="btn-mobile-back">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    Volver a todas las conversaciones
                  </Link>
                </div>
                <ChatWindow chatId={chatId} />
              </div>
            ) : (
              <div className="no-chat-selected-placeholder">
                <div className="placeholder-icon">
                  <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    <path d="M8 10h.01"></path>
                    <path d="M12 10h.01"></path>
                    <path d="M16 10h.01"></path>
                  </svg>
                </div>
                <h4>Selecciona una conversación</h4>
                <p>
                  Elige un chat de la lista izquierda para responder mensajes o consultar disponibilidad directamente con los vendedores.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}