import pkg from "whatsapp-web.js";
import QRCode from "qrcode";
import fs from "fs/promises";
import path from "path";
import { getIO } from "../socket/socket.js";

const { Client, LocalAuth, MessageMedia } = pkg;

export const whatsappClient = new Client({
  authStrategy: new LocalAuth({
    clientId: "dashboard-client",
  }),
  puppeteer: {
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  webVersionCache: {
    type: "local",
  },
});

let isReady = false;
let qrCodeImage = "";

const emitWhatsappState = (connected, qr = "") => {
  if (!getIO()) {
    return;
  }

  getIO().emit("status", { connected });
  getIO().emit("qr", { qr });
};

whatsappClient.on("qr", async (qr) => {
  console.log("\n📱 Scan this QR Code:\n");
  qrcode.generate(qr, { small: true });
  qrCodeImage = await QRCode.toDataURL(qr);

  emitWhatsappState(false, qrCodeImage);
});

whatsappClient.on("authenticated", () => {
  console.log("✅ WhatsApp Authenticated");
});

whatsappClient.on("ready", async () => {
  isReady = true;

  console.log("🚀 Ready");

  console.log("Client Info:", whatsappClient.info);

  console.log("State:", await whatsappClient.getState());

  emitWhatsappState(true, "");
});

whatsappClient.on("disconnected", (reason) => {
  isReady = false;
  qrCodeImage = "";
  console.log("❌ WhatsApp Disconnected:", reason);

  emitWhatsappState(false, "");
});

export const getWhatsappStatus = async () => {
  try {
    const state = await whatsappClient.getState();
    const connected = state === "CONNECTED" || isReady;

    return {
      connected,
      authenticated: connected,
      state,
    };
  } catch (error) {
    return {
      connected: isReady,
      authenticated: isReady,
      state: "UNKNOWN",
    };
  }
};

export const getQrCode = () => qrCodeImage;

export const initializeWhatsapp = async () => {
  try {
    await whatsappClient.initialize();
  } catch (err) {
    console.log(err);
  }
};

export const waitForWhatsappReady = async (timeoutMs = 60000) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const state = await whatsappClient.getState().catch(() => "UNKNOWN");

    if (isReady && state === "CONNECTED") {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return false;
};

export const sendMessage = async (phone, message, imagePath = "") => {
  const state = await whatsappClient.getState().catch(() => "UNKNOWN");

  if (!isReady && state !== "CONNECTED") {
    throw new Error(
      "WhatsApp is disconnected. Please reconnect and try again.",
    );
  }

  if (!phone || (!message && !imagePath)) {
    throw new Error("Phone or group ID and message are required.");
  }

  const target = `${phone}`.trim();
  const sendToTarget = async (chatId) => {
    if (imagePath) {
      const media = MessageMedia.fromFilePath(imagePath);
      await whatsappClient.sendMessage(chatId, media, {
        caption: message || "",
      });
      return;
    }

    await whatsappClient.sendMessage(chatId, message);
  };

  if (target.includes("@")) {
    await sendToTarget(target);

    return {
      success: true,
      phone: target,
      message: "Message sent successfully",
    };
  }

  const cleanPhone = target.replace(/\D/g, "");

  if (!cleanPhone) {
    throw new Error("Invalid phone number.");
  }

  const chatId = `${cleanPhone}@c.us`;

  await sendToTarget(chatId);

  return {
    success: true,
    phone: target,
    message: "Message sent successfully",
  };
};

export const logoutWhatsapp = async () => {
  try {
    isReady = false;
    qrCodeImage = "";

    emitWhatsappState(false, "");

    await whatsappClient.destroy();

    const authPath = path.join(process.cwd(), ".wwebjs_auth");

    await fs.rm(authPath, {
      recursive: true,
      force: true,
    });

    await initializeWhatsapp();
  } catch (error) {
    console.log(error);

    throw error;
  }
};

const getGroupId = (chat) => {
  if (chat?.id?._serialized) return chat.id._serialized;
  if (typeof chat?.id === "string") return chat.id;
  if (chat?.id?.server && chat?.id?.user) {
    return `${chat.id.user}@${chat.id.server}`;
  }
  return "";
};

const getGroupName = (chat) => {
  return (
    chat?.name || chat?.formattedTitle || chat?.contact?.name || "Unnamed Group"
  );
};

const isGroupChat = (chat) => {
  if (!chat) return false;
  if (chat.isGroup === true || chat.groupMetadata) return true;

  const serializedId = getGroupId(chat);
  return Boolean(serializedId && serializedId.endsWith("@g.us"));
};

export const inspectGroupRuntime = async () => {
  const state = await whatsappClient.getState().catch(() => "UNKNOWN");

  try {
    const chats = await whatsappClient.getChats();

    const fromClient = chats.slice(0, 20).map((chat) => ({
      id: chat?.id?._serialized || chat?.id || "",
      name: chat?.name || chat?.formattedTitle || "",
      isGroup: chat?.isGroup,
      hasGroupMetadata: !!chat?.groupMetadata,
      groupMetadataKeys: chat?.groupMetadata
        ? Object.keys(chat.groupMetadata).slice(0, 20)
        : [],
      keys: Object.keys(chat || {}).slice(0, 20),
    }));

    let fromPage = [];

    if (whatsappClient.pupPage) {
      fromPage = await whatsappClient.pupPage.evaluate(() => {
        const getChatModels = () => {
          if (window.Store?.Chat?.getModelsArray) {
            return window.Store.Chat.getModelsArray();
          }

          if (window.Store?.Chat?.models) {
            const models = window.Store.Chat.models;
            return Array.isArray(models) ? models : Array.from(models || []);
          }

          return [];
        };

        return getChatModels()
          .slice(0, 20)
          .map((chat) => ({
            id: chat?.id?._serialized || chat?.id || "",
            name: chat?.name || chat?.formattedTitle || "",
            isGroup: chat?.isGroup,
            hasGroupMetadata: !!chat?.groupMetadata,
            keys: Object.keys(chat || {}).slice(0, 20),
          }));
      });
    }

    return {
      state,
      chatCount: chats.length,
      fromClient,
      fromPage,
    };
  } catch (error) {
    return {
      state,
      chatCount: 0,
      fromClient: [],
      fromPage: [],
      error: error.message,
    };
  }
};

export const getGroups = async () => {
  const state = await whatsappClient.getState().catch(() => "UNKNOWN");

  if (!isReady && state !== "CONNECTED") {
    throw new Error(
      "WhatsApp is not ready yet. Please complete the QR login first.",
    );
  }

  console.log("Fetching groups...");

  const collectGroups = (chats = []) =>
    chats
      .filter((chat) => isGroupChat(chat))
      .map((group) => ({
        id: getGroupId(group),
        name: getGroupName(group),
      }))
      .filter((group) => group.id);

  const inspectPageStore = async () => {
    if (!whatsappClient.pupPage) return [];

    return whatsappClient.pupPage.evaluate(() => {
      const getChatModels = () => {
        if (window.Store?.Chat?.getModelsArray) {
          return window.Store.Chat.getModelsArray();
        }

        if (window.Store?.Chat?.models) {
          const models = window.Store.Chat.models;
          return Array.isArray(models) ? models : Array.from(models || []);
        }

        if (window.require) {
          try {
            const collection = window
              .require("WAWebCollections")
              ?.Chat?.getModelsArray?.();
            return Array.isArray(collection) ? collection : [];
          } catch (err) {
            return [];
          }
        }

        return [];
      };

      const chatModels = getChatModels();
      const sample = chatModels.slice(0, 12).map((chat) => ({
        id: chat?.id?._serialized || chat?.id || "",
        name: chat?.name || chat?.formattedTitle || "",
        isGroup: chat?.isGroup,
        hasGroupMetadata: !!chat?.groupMetadata,
      }));

      console.log("[group-inspect] sample chats", JSON.stringify(sample));

      const isGroupChat = (chat) => {
        if (!chat) return false;
        if (chat.isGroup === true || chat.groupMetadata) return true;

        const serializedId = chat?.id?._serialized || chat?.id || "";
        return Boolean(serializedId && serializedId.endsWith("@g.us"));
      };

      return chatModels
        .filter((chat) => isGroupChat(chat))
        .map((group) => ({
          id: group?.id?._serialized || group?.id || "",
          name: group?.name || group?.formattedTitle || "Unnamed Group",
        }))
        .filter((group) => group.id);
    });
  };

  try {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const chats = await whatsappClient.getChats();
      const groups = collectGroups(chats);

      if (groups.length > 0) {
        return groups;
      }

      if (attempt < 3) {
        console.log(`No groups found yet on attempt ${attempt}; retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    console.warn(
      "⚠️ No groups found from getChats(), trying compatibility fallback...",
    );
    return inspectPageStore();
  } catch (error) {
    console.warn("⚠️ getChats() failed, trying compatibility fallback...");

    try {
      return await inspectPageStore();
    } catch (fallbackError) {
      console.error("❌ Group fetch failed:", fallbackError);
      throw new Error(
        "Unable to fetch WhatsApp groups with the current WhatsApp Web compatibility layer.",
      );
    }
  }
  // ======================================================
  // WHATSAPP PROFILE
  // Fetch connected WhatsApp account name + profile photo
  // ======================================================

  export const getWhatsappProfile = async () => {
    // Check WhatsApp connection state
    const state = await whatsappClient.getState().catch(() => "UNKNOWN");

    // If WhatsApp is not connected, don't fetch profile
    if (!isReady && state !== "CONNECTED") {
      throw new Error("WhatsApp is not connected.");
    }

    // Get logged-in WhatsApp account information
    const info = whatsappClient.info;

    // Make sure WhatsApp account information is available
    if (!info?.wid) {
      throw new Error("WhatsApp profile is unavailable.");
    }

    let profilePicUrl = "";

    // Try to fetch WhatsApp profile picture
    try {
      profilePicUrl = await whatsappClient.getProfilePicUrl(
        info.wid._serialized,
      );
    } catch (error) {
      console.warn("⚠️ Profile picture fetch failed:", error.message);
    }

    // Return profile information to controller
    return {
      name: info.pushname || info.name || "WhatsApp User",
      number: info.wid.user || "",
      profilePicUrl,
    };
  };
};
// ======================================================
// WHATSAPP PROFILE
// Fetch connected WhatsApp account name + profile photo
// ======================================================

export const getWhatsappProfile = async () => {

  // Check WhatsApp connection state
  const state = await whatsappClient
    .getState()
    .catch(() => "UNKNOWN");

  // If WhatsApp is not connected, don't fetch profile
  if (!isReady && state !== "CONNECTED") {
    throw new Error("WhatsApp is not connected.");
  }

  // Get logged-in WhatsApp account information
  const info = whatsappClient.info;

  // Make sure WhatsApp account information is available
  if (!info?.wid) {
    throw new Error("WhatsApp profile is unavailable.");
  }

  let profilePicUrl = "";

  // Try to fetch WhatsApp profile picture
  try {
    profilePicUrl = await whatsappClient.getProfilePicUrl(
      info.wid._serialized
    );
  } catch (error) {
    console.warn(
      "⚠️ Profile picture fetch failed:",
      error.message
    );
  }

  // Return profile information to controller
  return {
    name: info.pushname || info.name || "WhatsApp User",
    number: info.wid.user || "",
    profilePicUrl,
  };
};
