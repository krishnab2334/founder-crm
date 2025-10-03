const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getDeals,
  getDealsByPipeline,
  getDeal,
  createDeal,
  updateDeal,
  updateDealStage,
  deleteDeal
} = require('../controllers/dealController');

// All routes require authentication
router.use(authMiddleware);

router.get('/', getDeals);
router.get('/pipeline', getDealsByPipeline);
router.get('/:id', getDeal);
router.post('/', createDeal);
router.put('/:id', updateDeal);
router.patch('/:id/stage', updateDealStage);
router.delete('/:id', deleteDeal);

module.exports = router;
