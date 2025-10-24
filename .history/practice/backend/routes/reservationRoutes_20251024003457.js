const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

router.get('/check-limit/:userId', reservationController.checkUserReservationLimit);

// Reservation routes
router.get('/', reservationController.getAllReservations);
router.get('/user/:userId', reservationController.getUserReservations);
router.get('/active/:userId', reservationController.getActiveReservation);

// ✅ FIXED: Use only ONE participants route
router.get('/:id/participants', reservationController.getParticipantsDetails);

// Availability route
router.get('/availability', reservationController.getAvailability);

// ✅ REMOVED: Duplicate participants route
// router.get('/participants/details/:reservationId', reservationController.getParticipantsDetails);

// DELETE route for participants
router.delete('/:id/participants', reservationController.removeParticipant);

// Single reservation by ID route
router.get('/:id', reservationController.getReservationById);

router.post('/', reservationController.createReservation);
router.patch('/:id/status', reservationController.updateReservationStatus);
router.delete('/:id', reservationController.cancelReservation);

// Archive routes
router.post('/:id/archive', reservationController.archiveReservation);
router.get('/archived/all', reservationController.getArchivedReservations);
router.post('/archived/:id/restore', reservationController.restoreReservation);
router.delete('/archived/:id', reservationController.deleteArchivedReservation);

// Reservation actions
router.post('/start/:id', reservationController.startReservation);
router.post('/:id/end-early', reservationController.endReservationEarly);

// Extension routes
router.put('/:id/request-extension', reservationController.requestExtension);
router.put('/:id/handle-extension', reservationController.handleExtension);

// Floor access validation
router.post('/validate-floor-access', reservationController.validateFloorAccess);

// Maintenance
router.post('/check-expired', reservationController.checkExpiredReservations);

module.exports = router;