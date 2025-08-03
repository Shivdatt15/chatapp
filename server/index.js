import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import AuthRoutes from "./routes/AuthRoutes.js";
import MessageRoutes from "./routes/MessageRoutes.js";
import AiRoutes from "./routes/AiRoutes.js";
import FileMessageRoutes from "./routes/FileMessageRoutes.js"; // ✅ ADD THIS
import getPrismaInstance from "./utils/PrismaClient.js";


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads/files", express.static("uploads/files"));
app.use("/uploads/recordings", express.static("uploads/recordings"));
app.use("/uploads/images", express.static("uploads/images"));

app.use("/api/files", FileMessageRoutes); // ✅ THIS WORKS NOW
app.use("/api/ai", AiRoutes);
app.use("/api/auth", AuthRoutes);
app.use("/api/messages", MessageRoutes);

// Server setup
const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: "https://chatapp-backend-yr0h.onrender.com",
  },
});

app.set("io", io);

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });

  socket.on("signout", (id) => {
    onlineUsers.delete(id);
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-receive", {
        from: data.from,
        message: data.message,
      });
    }
  });

  socket.on("outgoing-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-voice-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });

  socket.on("outgoing-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-video-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });

  socket.on("reject-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.from);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("voice-call-rejected");
    }
  });

  socket.on("reject-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.from);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("video-call-rejected");
    }
  });

  socket.on("accept-incoming-call", ({ id }) => {
    const sendUserSocket = onlineUsers.get(id);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("accept-call");
    }
  });

    socket.on("mark-as-read", async ({ messageIds, senderId, receiverId }) => {
  if (!messageIds?.length) return;

  const prisma = getPrismaInstance();

  await prisma.messages.updateMany({
    where: { id: { in: messageIds } },
    data: { messageStatus: "read" },
  });

  const senderSocketId = global.onlineUsers.get(parseInt(senderId));
  if (senderSocketId) {
    io.to(senderSocketId).emit("message-status-updated", {
      messageIds,
      status: "read",
      contactId: parseInt(receiverId), // ✅ Required for updating contact list
    });
  }
});

});
