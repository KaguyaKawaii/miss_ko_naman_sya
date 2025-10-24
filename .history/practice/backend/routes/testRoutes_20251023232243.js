// routes/testRoutes.js
const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

// Test routes
router.get('/:id/participants', testController.getReservationParticipants);
router.post('/:id/participants', testController.addParticipant);
router.delete('/:id/participants', testController.removeParticipant);

console.log('✅ Test routes registered');

module.exports = router;