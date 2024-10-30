import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import WebSocket, { WebSocketServer } from 'ws'
import { connectDatabase, disconnectDatabase } from './config/db'
import { redisClient } from './config/redis.db'
import { saveToRedis } from './utils/redis'

const app = express()

app.use(cors())
app.use(morgan('dev'))

app.get('/', async (req, res) => {
  res.status(200).json({ data: 'Server Running ok' })
})

redisClient
  .connect()
  .then(() => {
    console.log('Redis connected')
  })
  .catch((err) => console.error('Redis connection error:', err))

redisClient.on('connect', () => console.log('Redis Client Connected'))
redisClient.on('error', (err) => {
  console.error('Redis Client Connection Error:', err)
})

const reconnectDelay = 5000

const connectWebSocketFRomAddon = (wsServer) => {
  const serverUrl = 'ws://192.168.160.55:6789'
  const WS = new WebSocket(serverUrl)

  WS.on('open', () => {
    console.log('Connected to WebSocket Server 1')

    WS.on('message', (obj) => {
      try {
        const messageString = obj?.toString()
        try {
          const parsedMessage = JSON.parse(messageString)

          const { topic, message, userId } = parsedMessage

          saveToRedis({ topic, message, userId ,wsServer})
            .then(() => {})
            .catch((error) => {
              console.error('Error saving data to Redis:', error)
            })
        } catch (err) {
          console.error('Failed to process message:', err)
        }
      } catch (error) {
        console.error('Error parsing message:', error)
      }
    })

    WS.on('close', () => {
      console.log('WebSocket connection closed, attempting to reconnect...')
      setTimeout(() => connectWebSocketFRomAddon(wsServer), reconnectDelay)
    })

    WS.on('error', (err) => {
      console.error('WebSocket Error:', err.message)
      console.error('Error Details:', err)
    })
  })

  WS.on('error', (err) => {
    console.error('WebSocket connection failed:', err.message)
    setTimeout(() => connectWebSocketFRomAddon(wsServer), reconnectDelay)
  })
}

const startServer = async () => {
  try {
    await connectDatabase()

    const PORT = process.env.PORT || 8000
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })

    const wsServer = new WebSocketServer({ server })

    connectWebSocketFRomAddon(wsServer)

    wsServer.on('connection', (ws) => {
      console.log('WebSocket client connected')

      ws.on('message', (obj) => {})

      ws.on('close', () => {
        console.log('WebSocket client disconnected')
      })

      ws.on('error', (err) => {
        console.error('WebSocket error:', err)
      })
    })
  } catch (error) {
    console.error('Error starting server:', error)
  }
}

startServer().catch(console.error)

process.on('SIGINT', async () => {
  try {
    await disconnectDatabase()
    process.exit(0)
  } catch (error) {
    console.error('Error during shutdown:', error)
    process.exit(1)
  }
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message)
  console.error(err.stack)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})
