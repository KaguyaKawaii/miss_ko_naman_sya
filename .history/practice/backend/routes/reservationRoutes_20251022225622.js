const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// ✅ VALIDATION & CHECK ROUTES
router.get('/check-limit/:userId', reservationController.checkUserReservationLimit);
router.post('/validate-floor-access', reservationController.validateFloorAccess);

// ✅ AVAILABILITY ROUTES
router.get('/availability', reservationController.getAvailability);

// ✅ RESERVATION CRUD ROUTES
router.get('/', reservationController.getAllReservations);
router.get('/user/:userId', reservationController.getUserReservations);
router.get('/active/:userId', reservationController.getActiveReservation);
router.post('/', reservationController.createReservation);

// ✅ SINGLE RESERVATION ROUTES (must be after specific routes)
router.get('/:id', reservationController.getReservationById);
router.patch('/:id/status', reservationController.updateReservationStatus);
router.delete('/:id', reservationController.cancelReservation);

// ✅ PARTICIPANT MANAGEMENT ROUTES
router.get('/participants/details/:reservationId', reservationController.getParticipantsDetails);
router.delete('/:id/participants/:participantId', reservationController.removeParticipant);
// ✅ ADD THE NEW PARTICIPANT REMOVAL ROUTE HERE
router.put('/:id/remove-participant', reservationController.removeParticipant);

// ✅ RESERVATION ACTION ROUTES
router.post('/start/:id', reservationController.startReservation);
router.post('/:id/end-early', reservationController.endReservationEarly);

// ✅ EXTENSION MANAGEMENT ROUTES
router.put('/:id/request-extension', reservationController.requestExtension);
router.put('/:id/handle-extension', reservationController.handleExtension);

// ✅ ARCHIVE MANAGEMENT ROUTES
router.post('/:id/archive', reservationController.archiveReservation);
router.get('/archived/all', reservationController.getArchivedReservations);
router.post('/archived/:id/restore', reservationController.restoreReservation);
router.delete('/archived/:id', reservationController.deleteArchivedReservation);

// ✅ MAINTENANCE ROUTES
router.post('/check-expired', reservationController.checkExpiredReservations);

module.exports = router;