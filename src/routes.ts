import { Router } from 'express'
import createBlockchainRouter from 'creating-blockchain/routes'

const router = Router()

router.use('/creating-blockchain', createBlockchainRouter)

export default router
