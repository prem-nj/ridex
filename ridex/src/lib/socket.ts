import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export const getSocket = () => {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL

    if (!url) {
      console.error(
        "❌ NEXT_PUBLIC_SOCKET_SERVER_URL is not set at build time"
      )
    }

    socket = io(url, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    })

    socket.on("connect", () => {
      console.log("🟢 SOCKET CONNECTED:", socket?.id)
    })

    socket.on("disconnect", () => {
      console.log("🔴 SOCKET DISCONNECTED")
    })

    socket.on("connect_error", (error) => {
      console.error("❌ SOCKET ERROR:", error.message)
    })
  }

  return socket
}
