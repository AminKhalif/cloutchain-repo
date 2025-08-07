// Campaign Routes - Brand domain routes
import express from 'express'
import { CampaignController } from '../controllers/campaigns.js'
import { upload } from '../services/fileUpload.js'

const router = express.Router()

// Brand campaign routes
router.post('/', upload.single('brandImage'), CampaignController.create)  // POST /api/campaigns (with image upload)
router.get('/', CampaignController.getAll)                     // GET /api/campaigns
router.get('/open', CampaignController.getOpenCampaigns)       // GET /api/campaigns/open
router.get('/:id', CampaignController.getById)                 // GET /api/campaigns/:id
router.patch('/:id/status', CampaignController.updateStatus)   // PATCH /api/campaigns/:id/status
router.patch('/:id/funding', CampaignController.updateFunding) // PATCH /api/campaigns/:id/funding
router.delete('/:id', CampaignController.delete)               // DELETE /api/campaigns/:id

export default router