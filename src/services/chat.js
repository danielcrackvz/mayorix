import {
  collection,
  doc,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

// Genera un identificador determinístico para evitar duplicar conversaciones por producto
function buildChatId(buyerId, sellerId, productId) {
  return `${productId}_${buyerId}_${sellerId}`;
}

export async function getOrCreateChat(buyerId, sellerId, productId, productTitle) {
  const chatId = buildChatId(buyerId, sellerId, productId);
  const chatRef = doc(db, "chats", chatId);

  await setDoc(
    chatRef,
    {
      buyerId,
      sellerId,
      productId,
      productTitle: productTitle || "Producto en Mayorix",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return chatId;
}

// Escucha en tiempo real los mensajes de una conversación
export function listenToMessages(chatId, callback) {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(messages);
    },
    (error) => {
      console.error("Error al escuchar mensajes:", error);
      callback([]);
    }
  );
}

// Envía un mensaje y actualiza el último mensaje en el resumen del chat
export async function sendMessage(chatId, senderId, text) {
  if (!text.trim()) return;

  const messagesRef = collection(db, "chats", chatId, "messages");

  await addDoc(messagesRef, {
    senderId,
    text: text.trim(),
    createdAt: serverTimestamp(),
  });

  await setDoc(
    doc(db, "chats", chatId),
    {
      lastMessage: text.trim(),
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// Escucha en tiempo real los metadatos de un chat específico (cabecera)
export function listenToChatDetails(chatId, callback) {
  const chatRef = doc(db, "chats", chatId);
  return onSnapshot(chatRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  });
}

// Escucha en tiempo real todas las conversaciones donde el usuario es comprador o vendedor
export function listenToUserChats(userId, callback) {
  const chatsRef = collection(db, "chats");
  const qBuyer = query(chatsRef, where("buyerId", "==", userId));
  const qSeller = query(chatsRef, where("sellerId", "==", userId));

  let buyerChats = [];
  let sellerChats = [];

  function mergeAndSort() {
    // Deduplicación mediante Map para evitar colisiones
    const chatMap = new Map();
    [...buyerChats, ...sellerChats].forEach((chat) => {
      chatMap.set(chat.id, chat);
    });

    const merged = Array.from(chatMap.values());

    // Ordenar de más reciente a más antiguo
    merged.sort((a, b) => {
      const timeA = a.lastMessageAt?.toMillis ? a.lastMessageAt.toMillis() : (a.lastMessageAt?.seconds * 1000 || 0);
      const timeB = b.lastMessageAt?.toMillis ? b.lastMessageAt.toMillis() : (b.lastMessageAt?.seconds * 1000 || 0);
      return timeB - timeA;
    });

    callback(merged);
  }

  const unsubBuyer = onSnapshot(
    qBuyer,
    (snap) => {
      buyerChats = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      mergeAndSort();
    },
    (err) => console.error("Error consultando chats como comprador:", err)
  );

  const unsubSeller = onSnapshot(
    qSeller,
    (snap) => {
      sellerChats = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      mergeAndSort();
    },
    (err) => console.error("Error consultando chats como vendedor:", err)
  );

  return () => {
    unsubBuyer();
    unsubSeller();
  };
}