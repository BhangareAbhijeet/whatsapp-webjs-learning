import fs from "fs/promises";
import { processQueue } from "../services/queue.service.js";
import {
  sendMessage,
  getWhatsappStatus,
  getQrCode,
  logoutWhatsapp,
  getGroups,
  inspectGroupRuntime,
} from "../whatsapp/client.js";

export const status = async (req, res) => {
  const whatsapp = await getWhatsappStatus();

  res.json({
    success: true,
    whatsapp,
  });
};

export const send = async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Phone and message are required",
      });
    }

    const result = await sendMessage(phone, message);

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

///bulk msg send

const parseTargets = (rawValue) => {
  if (!rawValue) {
    return [];
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    return [];
  }
};

export const bulkSend = async (req, res) => {
  try {
    const contacts = parseTargets(req.body.contacts);
    const message = req.body.message || "";
    const imageFile = req.file;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Contacts are required",
      });
    }

    if (!message.trim() && !imageFile) {
      return res.status(400).json({
        success: false,
        message: "Message or image is required",
      });
    }

    const sendWithMedia = async (target, personalizedMessage) => {
      if (!imageFile) {
        return sendMessage(target, personalizedMessage);
      }

      return sendMessage(target, personalizedMessage, imageFile.path);
    };

    const results = await processQueue(contacts, message, sendWithMedia);
    if (imageFile) {
  try {
    await fs.unlink(imageFile.path);
  } catch (err) {
    console.warn("Cleanup failed:", err.message);
  }
}

    const failed = results.filter((item) => item.status === "Failed");
    const sent = results.filter((item) => item.status === "Sent");

    res.json({
      success: failed.length === 0,
      total: contacts.length,
      sent: sent.length,
      failed: failed.length,
      results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const groupBulkSend = async (req, res) => {
  try {
    const groups = parseTargets(req.body.groups);
    const message = req.body.message || "";
    const imageFile = req.file;

    if (!Array.isArray(groups) || groups.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Groups are required",
      });
    }

    if (!message.trim() && !imageFile) {
      return res.status(400).json({
        success: false,
        message: "Message or image is required",
      });
    }

    const validGroups = groups.filter((group) => group && group.id);

    if (validGroups.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one valid group is required",
      });
    }

    const sendWithMedia = async (target, personalizedMessage) => {
      if (!imageFile) {
        return sendMessage(target, personalizedMessage);
      }

      return sendMessage(target, personalizedMessage, imageFile.path);
    };

    const results = await processQueue(validGroups, message, sendWithMedia);
    

    // Delete image AFTER queue completes
    if (imageFile) {
      try {
        await fs.unlink(imageFile.path);
      } catch (err) {
        console.warn("Cleanup failed:", err.message);
      }
    }

    const failed = results.filter((item) => item.status === "Failed");
    const sent = results.filter((item) => item.status === "Sent");

    res.json({
      success: failed.length === 0,
      total: validGroups.length,
      sent: sent.length,
      failed: failed.length,
      results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



//get qr code image

export const getQr = (req, res) => {
  res.json({
    success: true,

    qr: getQrCode(),
  });
};

// export const logout = async (req, res) => {

//     try{

//         await logoutWhatsapp();

//         res.json({

//             success:true,

//             message:"WhatsApp Logged Out"

//         });

//     }

//     catch(error){

//         res.status(500).json({

//             success:false,

//             message:error.message

//         });

//     }

// };

export const logout = async (req, res) => {
  console.log("🚨 /logout API CALLED");
  try {
    await logoutWhatsapp();

    res.json({
      success: true,

      message: "Logout Successful",
    });
  } catch (err) {
    res.status(500).json({
      success: false,

      message: err.message,
    });
  }
};

export const groups = async (req, res) => {
  try {
    const data = await getGroups();

    res.json({
      success: true,
      total: data.length,
      groups: data,
    });
  } catch (err) {
    console.error("❌ Groups Error:");
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const debugGroups = async (req, res) => {
  try {
    const data = await inspectGroupRuntime();

    res.json({
      success: true,
      ...data,
    });
  } catch (err) {
    console.error("❌ Debug groups error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
