import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
    status,
    send,
    bulkSend,
    groupBulkSend,
    getQr,
    logout,
    groups,
    debugGroups,
    profile,
} from "../controllers/whatsapp.controller.js";

const router = express.Router();

const uploadsDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
            return;
        }

        cb(new Error("Unsupported file type. Use JPG, JPEG, PNG, or WEBP."));
    },
});

router.post("/bulk-send", upload.single("image"), bulkSend);
router.post("/group-bulk-send", upload.single("image"), groupBulkSend);

router.get("/status", status);

router.get("/qr", getQr);

router.post("/send", send);

router.post("/bulk-send", bulkSend);

router.post("/group-bulk-send", groupBulkSend);

router.post("/logout",logout);

router.get("/groups", groups);
router.get("/debug-groups", debugGroups);

router.get("/profile", profile);

export default router;