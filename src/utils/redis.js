import WebSocket from 'ws'

export const saveToRedis = async ({ topic, message, userId, wsServer }) => {
  let obj = {
    topic,
    message,
    userId,
  }
  try {
    wsServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(obj))
      }
    })
  } catch (error) {
    console.error('Error sending  to  Socket:', error)
  }
}

