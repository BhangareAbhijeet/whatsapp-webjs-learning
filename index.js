const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false,
    },
});

client.on("qr", (qr) => {
    console.log("📱 Scan the QR Code");
    qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
    console.log("✅ Authentication Successful");
});

client.on("ready", () => {
    console.log("🚀 WhatsApp Connected Successfully");
});

client.on("disconnected", (reason) => {
    console.log("❌ Disconnected:", reason);
});

client.on("auth_failure", (msg) => {
    console.log("❌ Authentication Failed:", msg);
});

client.initialize();