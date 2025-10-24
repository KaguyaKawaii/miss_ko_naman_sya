const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

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
router.post('/:id/archive', reservationController.archiveReservation);
router.post('/start/:id', reservationController.startReservation);
router.post('/:id/end-early', reservationController.endReservationEarly);
router.put('/:id/request-extension', reservationController.requestExtension);
router.put('/:id/handle-extension', reservationController.handleExtension);
router.patch('/:id/status', reservationController.updateReservationStatus);
router.delete('/:id', reservationController.cancelReservation);

// Generic ID route - SHOULD BE LAST
router.get('/:id', reservationController.getReservationById);

// Archive routes with specific patterns
router.post('/archived/:id/restore', reservationController.restoreReservation);
router.delete('/archived/:id', reservationController.deleteArchivedReservation);

module.exports = router;