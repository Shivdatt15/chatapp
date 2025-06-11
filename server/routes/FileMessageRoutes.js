import express from "express";
import multer from "multer";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/files/",
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

router.post("/add-file-message", upload.single("file"), async (req, res) => {
  try {
    const { from, to } = req.query;
   const { originalname, mimetype, filename, size } = req.file;

    if (!from || !to || !req.file) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const message = await prisma.Messages.create({
  data: {
    senderId: parseInt(from),
    recieverId: parseInt(to),
    fileUrl: `/uploads/files/${filename}`,
    fileName: originalname,
    fileType: mimetype,
    fileSize: size, // 👈 Add this line
    message: "", // required field
    type: "file",
  },
});

    res.status(201).json({ message });
  } catch (err) {
    console.error("File upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
