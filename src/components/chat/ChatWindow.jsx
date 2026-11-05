import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { listenToMessages, sendMessage, listenToChatDetails } from "../../services/chat";

export default function ChatWindow({ chatId }) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [chatInfo, setChatInfo] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Escuchar metadatos de la cabecera del chat
  useEffect(() => {
    if (!chatId) return;
    const unsubDetails = listenToChatDetails(chatId, setChatInfo);
    return unsubDetails;
  }, [chatId]);

  // Escuchar mensajes en tiempo real
  useEffect(() => {
    if (!chatId) return;
    const unsubMessages = listenToMessages(chatId, setMessages);
    return unsubMessages;
  }, [chatId]);

  // Scroll automático hacia el mensaje más reciente
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || sending) return;

    try {
      setSending(true);
      const textToSend = text.trim();
      setText("");
      await sendMessage(chatId, currentUser.uid, textToSend);
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    } finally {
      setSending(false);
    }
  }

  function formatTime(timestamp) {
    if (!timestamp) return "Enviando...";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const isSeller = currentUser?.uid === chatInfo?.sellerId;

  return (
    <div className="chat-window-container">
      {/* Cabecera del chat */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-avatar-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <div>
            <h4 className="chat-product-title">
              {chatInfo?.productTitle || "Consulta de producto"}
            </h4>
            <span className="chat-role-indicator">
              {isSeller ? "Conversando con un comprador interesado" : "Conversando con el vendedor"}
            </span>
          </div>
        </div>

        {chatInfo?.productId && (
          <Link
            to={`/producto/${chatInfo.productId}`}
            className="chat-view-product-link"
            title="Abrir publicación del producto"
          >
            Ver producto
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </Link>
        )}
      </div>

      {/* Área de mensajes con scroll */}
      <div className="chat-messages-area">
        {messages.length === 0 ? (
          <div className="chat-empty-conversation">
            <div className="welcome-chat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h5>Comienza la conversación directa</h5>
            <p>
              Coordina el precio al por mayor o menor, acuerda el método de entrega o resuelve cualquier duda sobre el producto con confianza.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUser.uid;
            return (
              <div
                key={msg.id}
                className={`message-row ${isMine ? "message-outgoing" : "message-incoming"}`}
              >
                <div className="message-bubble">
                  <p className="message-text">{msg.text}</p>
                  <span className="message-timestamp">{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Formulario de envío de texto */}
      <form onSubmit={handleSend} className="chat-input-bar">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe tu mensaje aquí..."
          className="chat-text-input"
          autoFocus
        />
        <button
          type="submit"
          className="btn btn-primary btn-chat-send"
          disabled={!text.trim() || sending}
          aria-label="Enviar mensaje"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
}