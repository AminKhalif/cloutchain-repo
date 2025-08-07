// Payment Routes
import express from 'express'
import { PaymentController } from '../controllers/payments.js'

const router = express.Router()

// Payment routes
router.get('/history', PaymentController.getHistory)  // GET /api/payments/history?creator_address=0x...

export default router