// Submission Routes - Creator domain routes
import express from 'express'
import { SubmissionController } from '../controllers/submissions.js'

const router = express.Router()

// Creator submission routes
router.post('/', SubmissionController.create)                           // POST /api/submissions
router.get('/creator', SubmissionController.getByCreator)               // GET /api/submissions/creator?creator_address=0x...
router.get('/campaign/:campaignId', SubmissionController.getByCampaign) // GET /api/submissions/campaign/:campaignId
router.get('/:id', SubmissionController.getById)                        // GET /api/submissions/:id
router.post('/:id/update-metrics', SubmissionController.updateMetrics)  // POST /api/submissions/:id/update-metrics
router.post('/:id/process-payment', SubmissionController.processPayment) // POST /api/submissions/:id/process-payment
router.post('/:id/verify', SubmissionController.runAIVerification)      // POST /api/submissions/:id/verify
router.delete('/:id', SubmissionController.delete)                      // DELETE /api/submissions/:id

export default router