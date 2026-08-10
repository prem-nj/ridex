import axios from "axios"

export const getSocketServerUrl = () =>
  process.env.SOCKET_SERVER_URL || process.env.NEXT_PUBLIC_SOCKET_SERVER_URL

export const emitToUser = async (
  event: string,
  userId: string,
  data: unknown
) => {
  const baseUrl = getSocketServerUrl()

  if (!baseUrl) {
    console.error("SOCKET_SERVER_URL is not defined, skipping emit:", event)
    return
  }

  try {
    await axios.post(
      `${baseUrl.replace(/\/+$/, "")}/emit`,
      { event, userId, data },
      { timeout: 5000 }
    )
  } catch (error) {
    console.error(`Failed to emit ${event}:`, error)
  }
}
