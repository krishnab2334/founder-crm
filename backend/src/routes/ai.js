const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  analyzeContactNote,
  prioritizeTasks,
  generateFollowUpEmail,
  categorizeContact,
  summarizeNotes,
  predictDealConversion,
  getAISuggestions,
  markSuggestionApplied
} = require('../controllers/aiController');

// All routes require authentication
router.use(authMiddleware);

router.post('/analyze-note', analyzeContactNote);
router.post('/prioritize-tasks', prioritizeTasks);
router.post('/generate-email', generateFollowUpEmail);
router.post('/categorize-contact', categorizeContact);
router.post('/summarize-notes', summarizeNotes);
router.get('/predict-deal/:dealId', predictDealConversion);
router.get('/suggestions', getAISuggestions);
router.patch('/suggestions/:id/applied', markSuggestionApplied);

module.exports = router;
