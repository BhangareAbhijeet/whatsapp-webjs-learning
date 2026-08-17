import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import healthRoutes from "./routes/health.routes.js";
import { initializeWhatsapp } from "./whatsapp/client.js";
import whatsappRoutes from "./routes/whatsapp.routes.js";

///socket io
import http from "http";
import { initializeSocket } from "./socket/socket.js";



dotenv.config();

const app = express();
const server = http.createServer(app);

const uploadsDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/health", healthRoutes);
app.use("/api/whatsapp", whatsappRoutes);

const PORT = process.env.PORT || 5000;

initializeSocket(server);

server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);

  initializeWhatsapp();
});