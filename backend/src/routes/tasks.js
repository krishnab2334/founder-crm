const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getTasks,
  getMyTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

// All routes require authentication
router.use(authMiddleware);

router.get('/', getTasks);
router.get('/my-tasks', getMyTasks);
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
