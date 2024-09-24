import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import WebSocket from 'ws'
import { connectDatabase, disconnectDatabase } from './config/db'
import connectUsersToMQTT from './config/mqtt'
import { saveToRedis } from './utils/redis'
import { redisClient } from './config/redis.db'

const app = express()
let mqttClients = []

app.use(cors())
app.use(morgan('dev'))

// Health check endpoint
app.get('/', async (req, res) => {
  res.status(200).json({ data: "Running ok" })
})

// Redis connection setup with error handling
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

// Function to set up MQTT clients with error handling
function setupMQTTClient(clients, wsServer) {
  clients.forEach(({ client, userId }) => {
    client.on('message', (topic, message) => {
      const Message = message.toString()
      saveToRedis({ topic, message: Message, userId, wsServer })
        .then(() => {
        })
        .catch((error) => {
          console.error(`Error saving message for user ${userId}:`, error)
        })
    })

    client.on('error', (error) => {
      console.error(`MQTT client error for user ${userId}:`, error)
    })
  })
}

const startServer = async () => {
  try {
    await connectDatabase()

    const PORT = process.env.PORT || 8000
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })

    // WebSocket server with connection handling
    const wsServer = new WebSocket.Server({ server })

    wsServer.on('connection', (ws) => {
      console.log('WebSocket client connected')

      ws.on('close', () => {
        console.log('WebSocket client disconnected')
      })

      ws.on('error', (err) => {
        console.error('WebSocket error:', err)
      })
    })

    // Initial MQTT client setup
    mqttClients = await connectUsersToMQTT()
    setupMQTTClient(mqttClients, wsServer)

    // Periodic check for new users to update MQTT connections every minute
    setInterval(async () => {
      console.log('Checking for new users and updating MQTT connections...')
      mqttClients = await connectUsersToMQTT()
      setupMQTTClient(mqttClients, wsServer)
    }, 60000)

  } catch (error) {
    console.error('Error starting server:', error)
  }
}

startServer().catch(console.error)

// Graceful shutdown on SIGINT
process.on('SIGINT', async () => {
  try {
    console.log('Received SIGINT. Gracefully shutting down...')
    await disconnectDatabase()
    process.exit(0)
  } catch (error) {
    console.error('Error during shutdown:', error)
    process.exit(1)
  }
})

// Global error handling to keep the app running
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message)
  console.error(err.stack)
  // Keep the app alive despite the exception
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  // Keep the app alive
})
