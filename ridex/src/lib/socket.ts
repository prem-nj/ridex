import { io, Socket } from "socket.io-client"

let socket: Socket | null = null
let identityUserId: string | null = null

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

      // The server maps userId -> socket, and the socket id changes on every
      // reconnect, so the identity has to be re-sent each time.
      if (identityUserId) {
        socket?.emit("identity", identityUserId)
      }
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

export const registerSocketIdentity = (userId: string) => {
  if (!userId || identityUserId === userId) return

  identityUserId = userId

  const activeSocket = getSocket()

  if (activeSocket.connected) {
    activeSocket.emit("identity", userId)
  }
}
