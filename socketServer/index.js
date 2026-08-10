import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import http from "http"
import cors from "cors"
import { Server } from "socket.io"
import User from "./models/user.model.js"

dotenv.config()

const PORT = process.env.PORT || 5000
const MONGODB_URL = process.env.MONGO_URI

// Origins allowed to connect (comma separated), e.g.
// CLIENT_URL=https://ridex.vercel.app,http://localhost:3000
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean)

const corsOptions = {
  origin: allowedOrigins.includes("*") ? true : allowedOrigins,
  methods: ["GET", "POST"],
  credentials: true,
}

const app = express()

app.use(cors(corsOptions))
app.use(express.json())

// Test route
app.get("/", (req, res) => {
  res.send("Socket server is running")
})

// HTTP server
const server = http.createServer(app)

// Socket.IO
const io = new Server(server, {
  cors: corsOptions,
})

// MongoDB connection
const connectDb = async () => {
  try {
    await mongoose.connect(MONGODB_URL)
    console.log(" DB connected")

    // Socket ids from a previous process are dead after a restart
    // (Render redeploys / free instance spin down), so clear them.
    const { modifiedCount } = await User.updateMany(
      { $or: [{ isOnline: true }, { socketId: { $ne: null } }] },
      { $set: { isOnline: false, socketId: null } }
    )

    console.log(" Stale sockets cleared:", modifiedCount)
  } catch (error) {
    console.error("❌ DB ERROR:", error)
  }
}

// --------------------------------------------------
// EMIT EVENT TO A SPECIFIC USER
// --------------------------------------------------

app.post("/emit", async (req, res) => {
  const { event, userId, data } = req.body

  try {
    console.log(" EMIT REQUEST")
    console.log("Event:", event)
    console.log("User ID:", userId)

    const user = await User.findById(userId)

    if (!user) {
      console.log("❌ User not found:", userId)

      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    console.log("Socket ID:", user.socketId)

    if (user.socketId) {
      io.to(user.socketId).emit(event, data)

      console.log("✅ Event sent successfully")
    } else {
      console.log("❌ User has no socket ID")
    }

    return res.json({
      success: true,
    })

  } catch (error) {
    console.error("❌ EMIT ERROR:", error)

    return res.status(500).json({
      success: false,
      message: "Emit error",
    })
  }
})

// --------------------------------------------------
// SOCKET CONNECTION
// --------------------------------------------------

io.on("connection", (socket) => {

  console.log("🟢 USER CONNECTED:", socket.id)

  // ----------------------------------------------
  // IDENTITY
  // ----------------------------------------------

  socket.on("identity", async (userId) => {
    try {

      console.log("👤 IDENTITY RECEIVED:", userId)

      socket.userId = userId

      await User.findByIdAndUpdate(userId, {
        socketId: socket.id,
        isOnline: true,
      })

      console.log("✅ Identity registered:", userId)
      console.log("🔌 Socket ID:", socket.id)

    } catch (error) {
      console.error("❌ Identity error:", error)
    }
  })

  // ----------------------------------------------
  // UPDATE LOCATION
  // ----------------------------------------------

  socket.on(
    "update-location",
    async ({ userId, latitude, longitude }) => {

      try {

        await User.findByIdAndUpdate(userId, {
          location: {
            type: "Point",
            coordinates: [
              longitude,
              latitude,
            ],
          },
        })

        console.log(
          "📍 Location updated:",
          userId,
          latitude,
          longitude
        )

      } catch (error) {
        console.error("❌ Location update error:", error)
      }
    }
  )

  // ----------------------------------------------
  // JOIN RIDE
  // ----------------------------------------------

  socket.on("join-ride", (bookingId) => {

    console.log(" JOIN RIDE:", bookingId)

    socket.join(`ride-${bookingId}`)

  })

  // ----------------------------------------------
  // DRIVER LOCATION UPDATE
  // ----------------------------------------------

  socket.on(
    "driver-location-update",
    ({ bookingId, latitude, longitude, status }) => {

      console.log(
        " Driver location:",
        bookingId,
        latitude,
        longitude
      )

      io.to(`ride-${bookingId}`).emit(
        "driver-location",
        {
          latitude,
          longitude,
          status,
        }
      )
    }
  )

  // ----------------------------------------------
  // CHAT MESSAGE
  // ----------------------------------------------

  socket.on("chat-message", (data) => {

    console.log(" Chat message:", data)

    io.to(`ride-${data.bookingId}`).emit(
      "chat-message",
      data
    )

  })

  // ----------------------------------------------
  // DISCONNECT
  // ----------------------------------------------

  socket.on("disconnect", async () => {

    console.log(" USER DISCONNECTED:", socket.id)

    try {

      if (!socket.userId) {
        return
      }

      await User.findByIdAndUpdate(
        socket.userId,
        {
          socketId: null,
          isOnline: false,
        }
      )

      console.log(
        " User marked offline:",
        socket.userId
      )

    } catch (error) {
      console.error(
        "❌ Disconnect error:",
        error
      )
    }

  })

})

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

server.listen(PORT, "0.0.0.0", async () => {

  console.log(`🚀 Socket server listening on port ${PORT}`)
  console.log(" Allowed origins:", allowedOrigins.join(", "))

  await connectDb()

})