import { getIO } from "../socket/socket.js";

const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const processQueue = async (items, message, sendMessage) => {
  const results = [];

  for (const item of items) {
    const itemName = item.name || item.phone || item.id || "Unknown";
    const target = item.phone || item.id;

    try {
      console.log(`⏳ Waiting -> ${itemName}`);

      getIO().emit("log", {
        name: itemName,
        phone: target,
        status: "Waiting",
      });

      const personalizedMessage = message.replace("{{name}}", itemName);

      await sendMessage(target, personalizedMessage);

      console.log(`✅ Sent -> ${itemName}`);

      getIO().emit("log", {
        name: itemName,
        phone: target,
        status: "Sent",
      });

      results.push({
        name: itemName,
        phone: target,
        status: "Sent",
      });
    } catch (error) {
      console.error(`❌ Failed -> ${itemName}`);
      console.error(error.message);

      getIO().emit("log", {
        name: itemName,
        phone: target,
        status: "Failed",
      });

      results.push({
        name: itemName,
        phone: target,
        status: "Failed",
        error: error.message,
      });
    }

    await delay(10000); // Wait for 10 seconds before processing the next item
  }

  return results;
};
