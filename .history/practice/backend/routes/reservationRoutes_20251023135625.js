const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { removeParticipant } = require('../controllers/reservationController');


router.get('/check-limit/:userId', reservationController.checkUserReservationLimit);

// Reservation routes
router.get('/', reservationController.getAllReservations);
router.get('/user/:userId', reservationController.getUserReservations);
router.get('/active/:userId', reservationController.getActiveReservation);

// ✅ MOVED: Availability route BEFORE the :id route
router.get('/availability', reservationController.getAvailability);

// Add these routes after the existing participants route

// Participant management routes
router.get('/:reservationId/participants/manage', reservationController.getParticipantsForManagement);
router.delete('/:reservationId/participants/:participantId', reservationController.removeParticipant);
router.post('/:reservationId/participants', reservationController.addParticipant);
router.post('/validate-participant-id', reservationController.validateParticipantId);

router.delete('/:reservationId/participants/:participantId', reservationController.removeParticipant);

router.delete('/:reservationId/participants/:participantId', reservationController.removeParticipant);

// ✅ MOVED: Single reservation by ID route AFTER specific routes
router.get('/:id', reservationController.getReservationById);

router.post('/', reservationController.createReservation);
router.patch('/:id/status', reservationController.updateReservationStatus);
router.delete('/:id', reservationController.cancelReservation);

// Archive routes - MOVED HIGHER UP
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

// Participants route
router.get('/participants/details/:reservationId', reservationController.getParticipantsDetails);

// ✅ FIXED: Remove duplicate "reservations" from the path since it's already in the base route
router.post('/validate-floor-access', reservationController.validateFloorAccess);

// Maintenance
router.post('/check-expired', reservationController.checkExpiredReservations);

module.exports = router;