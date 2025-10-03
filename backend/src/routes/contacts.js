const express = require('express');
const router = express.Router();
const { authMiddleware, checkWorkspaceAccess } = require('../middleware/auth');
const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  addInteraction
} = require('../controllers/contactController');

// All routes require authentication
router.use(authMiddleware);

router.get('/', getContacts);
router.get('/:id', getContact);
router.post('/', createContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);
router.post('/:contactId/interactions', addInteraction);

module.exports = router;
