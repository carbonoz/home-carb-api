import { Router } from 'express'
import topicRouter from './topic.route'

const router = Router()


router.use('topic',topicRouter)


export default router