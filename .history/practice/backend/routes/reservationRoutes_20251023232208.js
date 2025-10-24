// routes/reservationRoutes.js
const express = require('express');
const router = express.Router();

// Import the controller with error handling
let reservationController;
try {
  reservationController = require('../controllers/reservationController');
  console.log('✅ reservationController loaded successfully');
} catch (error) {
  console.error('❌ Failed to load reservationController:', error);
  process.exit(1);
}

// Debug: Check if functions exist
const requiredFunctions = [
  'checkUserReservationLimit',
  'getAllReservations', 
  'getUserReservations',
  'getActiveReservation',
  'getAvailability',
  'getReservationById',
  'createReservation',
  'updateReservationStatus',
  'cancelReservation',
  'getReservationParticipants',
  'addParticipant',
  'removeParticipant',
  'archiveReservation',
  'getArchivedReservations',
  'restoreReservation',
  'deleteArchivedReservation',
  'startReservation',
  'endReservationEarly',
  'requestExtension',
  'handleExtension',
  'getParticipantsDetails',
  'validateFloorAccess',
  'checkExpiredReservations'
];

console.log('🔍 Checking required functions:');
requiredFunctions.forEach(funcName => {
  if (typeof reservationController[funcName] !== 'function') {
    console.log(`❌ Missing function: ${funcName}`);
  }
});

// Routes without ID parameters
router.get('/', reservationController.getAllReservations);
router.get('/user/:userId', reservationController.getUserReservations);
router.get('/active/:userId', reservationController.getActiveReservation);
router.get('/availability', reservationController.getAvailability);
router.get('/archived/all', reservationController.getArchivedReservations);
router.get('/participants/details/:reservationId', reservationController.getParticipantsDetails);
router.post('/', reservationController.createReservation);
router.post('/validate-floor-access', reservationController.validateFloorAccess);
router.post('/check-expired', reservationController.checkExpiredReservations);
router.get('/check-limit/:userId', reservationController.checkUserReservationLimit);

// Routes with ID parameters - SPECIFIC PATHS FIRST
router.get('/:id/participants', reservationController.getReservationParticipants);
router.post('/:id/participants', reservationController.addParticipant);
router.delete('/:id/participants', reservationController.removeParticipant);

// Other ID routes
router.post('/:id/archive', reservationController.archiveReservation);
router.post('/start/:id', reservationController.startReservation);
router.post('/:id/end-early', reservationController.endReservationEarly);
router.put('/:id/request-extension', reservationController.requestExtension);
router.put('/:id/handle-extension', reservationController.handleExtension);
router.patch('/:id/status', reservationController.updateReservationStatus);
router.delete('/:id', reservationController.cancelReservation);

// Archive routes with specific patterns
router.post('/archived/:id/restore', reservationController.restoreReservation);
router.delete('/archived/:id', reservationController.deleteArchivedReservation);

// Generic ID route - SHOULD BE LAST
router.get('/:id', reservationController.getReservationById);

console.log('✅ All reservation routes registered successfully');

module.exports = router;