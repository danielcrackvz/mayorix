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

// Genera un identificador único y determinístico para la conversación
function buildChatId(buyerId, sellerId, productId) {
  return `${productId}_${buyerId}_${sellerId}`;
}

export async function getOrCreateChat(buyerId, sellerId, productId, productTitle) {
  if (!buyerId || !sellerId || !productId) {
    throw new Error("Identificadores incompletos para crear el chat.");
  }

  const chatId = buildChatId(buyerId, sellerId, productId);
  const chatRef = doc(db, "chats", chatId);

  await setDoc(
    chatRef,
    {
      buyerId,
      sellerId,
      participants: [buyerId, sellerId],
      productId,
      productTitle: productTitle || "Producto en Mayorix",
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return chatId;
}

// Escucha en tiempo real los mensajes de un chat abierto
export function listenToMessages(chatId, callback) {
  if (!chatId) return () => {};
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(messages);
    },
    (error) => {
      console.error("Error al escuchar mensajes en tiempo real:", error);
    }
  );
}

// Envía un mensaje y actualiza el encabezado del chat para ambas partes
export async function sendMessage(chatId, senderId, text) {
  if (!chatId || !senderId || !text.trim()) return;

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

// Escucha los detalles del producto vinculado al chat
export function listenToChatDetails(chatId, callback) {
  if (!chatId) return () => {};
  const chatRef = doc(db, "chats", chatId);
  return onSnapshot(chatRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  });
}

// Escucha en tiempo real todas las conversaciones donde participa el usuario
export function listenToUserChats(userId, callback) {
  if (!userId) return () => {};
  const chatsRef = collection(db, "chats");

  const qBuyer = query(chatsRef, where("buyerId", "==", userId));
  const qSeller = query(chatsRef, where("sellerId", "==", userId));

  let buyerChats = [];
  let sellerChats = [];

  function mergeAndSort() {
    const chatMap = new Map();
    [...buyerChats, ...sellerChats].forEach((chat) => {
      chatMap.set(chat.id, chat);
    });

    const merged = Array.from(chatMap.values());

    merged.sort((a, b) => {
      const timeA = a.lastMessageAt?.toMillis ? a.lastMessageAt.toMillis() : (a.lastMessageAt?.seconds * 1000 || a.updatedAt?.seconds * 1000 || 0);
      const timeB = b.lastMessageAt?.toMillis ? b.lastMessageAt.toMillis() : (b.lastMessageAt?.seconds * 1000 || b.updatedAt?.seconds * 1000 || 0);
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