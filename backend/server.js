const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const app = express();
require("dotenv").config();
const auth = require("./Auth");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ credentials: true, origin: true  }));

const CHAT = require("./MODELS/Chat");

const chatRoutes = require("./ROUTES/chatRoutes");
const userRoutes = require("./ROUTES/userRoutes");

app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);

app.use((req, res, next) => {
  res.status(404);
  res.json({ message: "ROUTE NOT FOUND" });
  return next();
});

app.use((err, req, res, next) => {
  if (res.headerSent) {
    return next(err);
  }

  res
    .status(err.code || 500)
    .json({ message: err.message || "SOMETHING WENT WRONG" });
});

const serverr = http.createServer(app);

const io = new Server(serverr, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let users = [];

const adduser = (userId, socketId) => {
  users.some((user) => user.userId === userId) === false &&
    users.push({ userId, socketId });
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

io.on("connection", (socket) => {
  console.log("USER CONNECTED" + " " + socket.id);

  socket.on("add-user", (userId) => {
    console.log("JOINED ROOM BY SOCKET ID" + socket.id);
    adduser(userId, socket.id);

    const onlineUsers = users.map((item) => item.userId);
    io.emit("online-users", onlineUsers);
  });

  socket.on("send-msg", (data) => {
    console.log("SENT MESSAGE", data);

    const user = getUser(data.to);

    const membersss = [data.from, data.to];
    if (user) {
      const dataa = {
        message: data.message,
        time: data.time,
        to: data.to,
        author: data.from,
        authorName: data.authorName,
        members: [...membersss],
      };

      console.log(user);

      io.to(user.socketId).emit("recieve-msg", dataa);
    }
  });

  // customer disconnect when user logout
  socket.on("logout", (userId) => {
    const user = getUser(userId);
    console.log("USER DISCONNECTED");

    removeUser(user.socketId);

    const onlineUsers = users.map((item) => item.userId);
    io.emit("online-users", onlineUsers);
  });

  // when user switches or reloads
  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");

    removeUser(socket.id);

    const onlineUsers = users.map((item) => item.userId);
    io.emit("online-users", onlineUsers);
  });
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MONGOOSE CONNECTED");
  } catch (err) {
    console.log("ERROR" + " " + err);
  }
};

connectDB();

serverr.listen(process.env.PORT, () => {
  console.log("SERVER RUNNING");
});
