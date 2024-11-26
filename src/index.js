import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import WebSocket, { WebSocketServer } from 'ws'
import GetHosts from './api/getServers'
import { redisClient } from './config/redis.db'
import { saveToRedis } from './utils/redis'

const app = express()
app.use(cors())
app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.status(200).json({ data: 'Server Running ok' })
})

// Initialize Redis
redisClient
  .connect()
  .then(() => console.log('Redis connected'))
  .catch((err) => console.error('Redis connection error:', err))

redisClient.on('error', (err) => {
  console.error('Redis Client Connection Error:', err)
})

// WebSocket connection pool
const connections = new Map()
const reconnectDelay = 5000 // Initial delay in ms

const MAX_RETRY_ATTEMPTS = 25

let currentHosts = new Set()

const isValidWebSocketUrl = (url) => {
  try {
    const parsedUrl = new URL(url) // Throws if invalid
    return parsedUrl.protocol === 'ws:' || parsedUrl.protocol === 'wss:'
  } catch (error) {
    return false
  }
}

const connectWebSocketFromAddon = async (newHosts) => {
  newHosts.forEach((host) => {
    if (currentHosts.has(host)) {
      return
    }

    const serverUrl = `ws://${host}:6789`
    let retryCount = 0

    const establishConnection = () => {
      if (retryCount >= MAX_RETRY_ATTEMPTS) {
        console.error(`Max retries reached . Giving up.`)
        return
      }
      const trimmedHost = host.trim()
      const serverUrl = `ws://${trimmedHost}:6789`

      if (!isValidWebSocketUrl(serverUrl)) {
        console.error(`Invalid WebSocket URL: ${serverUrl}`)
        return
      }

      const WS = new WebSocket(serverUrl)
      connections.set(host, WS)
      currentHosts.add(host)

      WS.on('open', () => {
        console.log(`Connected to WebSocket Server at ${serverUrl}`)
        retryCount = 0 // Reset retry count on successful connection
      })

      WS.on('message', (obj) => {
        try {
          const messageString = obj?.toString()
          try {
            const parsedMessage = JSON.parse(messageString)

            const { topic, message, userId } = parsedMessage

            saveToRedis({ topic, message, userId })
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
        console.log(`WebSocket connection to ${serverUrl} closed`)
        connections.delete(host) // Remove from pool
        currentHosts.delete(host) // Remove from connected hosts
        retryWithBackoff()
      })

      WS.on('error', (err) => {
        console.error(`WebSocket error for ${serverUrl}:`, err.message)
        connections.delete(host) // Remove from pool
        currentHosts.delete(host) // Remove from connected hosts
        retryWithBackoff()
      })
    }

    const retryWithBackoff = () => {
      const jitter = Math.random() * 1000 // Random jitter between 0 and 1 second
      const delay = Math.min(reconnectDelay * 2 ** retryCount, 60000) + jitter
      console.log(
        `Retrying connection to ${serverUrl} in ${delay / 1000} seconds`
      )
      retryCount++
      setTimeout(establishConnection, delay)
    }

    establishConnection()
  })
}

setInterval(async () => {
  const newHosts = await GetHosts()
  if (newHosts && newHosts.length) {
    connectWebSocketFromAddon(newHosts)
  } else {
    console.log('No new hosts found.')
  }
}, 180000)

const startServer = async () => {
  try {
    const PORT = process.env.PORT || 8000
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })

    const wsServer = new WebSocketServer({ server })

    const initialHosts = await GetHosts()
    if (initialHosts && initialHosts.length) {
      connectWebSocketFromAddon(initialHosts)
    }

    wsServer.on('connection', (ws) => {
      console.log('WebSocket client connected')
      ws.on('close', () => console.log('WebSocket client disconnected'))
      ws.on('error', (err) => console.error('WebSocket error:', err))
    })
  } catch (error) {
    console.error('Error starting server:', error)
  }
}

// Graceful Shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...')
  connections.forEach((ws) => ws.close())
  redisClient.quit()
  process.exit(0)
})

startServer().catch(console.error)
