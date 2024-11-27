import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import { WebSocketServer } from 'ws'
import { redisClient } from './config/redis.db'
import { saveToRedis } from './utils/redis'

const app = express()
app.use(cors())
app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.status(200).json({ data: 'Server Running ok' })
})


redisClient
  .connect()
  .then(() => console.log('Redis connected'))
  .catch((err) => console.error('Redis connection error:', err))

redisClient.on('error', (err) => {
  console.error('Redis Client Connection Error:', err)
})



const startServer = async () => {
  try {
    const PORT = process.env.PORT || 8000
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })

    const wsServer = new WebSocketServer({ server })

    wsServer.on('connection', (ws) => {
      console.log('WebSocket client connected')
      ws.on('message', (obj) => {
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
  redisClient.quit()
  process.exit(0)
})

startServer().catch(console.error)
