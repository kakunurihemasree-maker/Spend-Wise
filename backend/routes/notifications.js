import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  clearNotifications
} from '../db.js';

const router = express.Router();

// GET /api/notifications
router.get('/', (req, res) => {
  try {
    const notifications = getNotifications();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve notifications', details: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', (req, res) => {
  try {
    const success = markNotificationAsRead(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification', details: err.message });
  }
});

// DELETE /api/notifications
router.delete('/', (req, res) => {
  try {
    clearNotifications();
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear notifications', details: err.message });
  }
});

export default router;
