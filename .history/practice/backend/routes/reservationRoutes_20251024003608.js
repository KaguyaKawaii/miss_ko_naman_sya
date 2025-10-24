const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// ✅ FIXED ROUTE ORDER - SPECIFIC ROUTES FIRST
router.get('/check-limit/:userId', reservationController.checkUserReservationLimit);
router.get('/user/:userId', reservationController.getUserReservations);
router.get('/active/:userId', reservationController.getActiveReservation);
router.get('/availability', reservationController.getAvailability);
router.get('/archived/all', reservationController.getArchivedReservations);

// ✅ PARTICIPANTS ROUTE MUST COME BEFORE SINGLE :id ROUTE
router.get('/:id/participants', reservationController.getParticipantsDetails);

// ✅ NOW the single :id route
router.get('/:id', reservationController.getReservationById);

// All other routes...
router.get('/', reservationController.getAllReservations);
router.post('/', reservationController.createReservation);
router.patch('/:id/status', reservationController.updateReservationStatus);
router.delete('/:id', reservationController.cancelReservation);
router.post('/:id/archive', reservationController.archiveReservation);
router.post('/archived/:id/restore', reservationController.restoreReservation);
router.delete('/archived/:id', reservationController.deleteArchivedReservation);
router.post('/start/:id', reservationController.startReservation);
router.post('/:id/end-early', reservationController.endReservationEarly);
router.put('/:id/request-extension', reservationController.requestExtension);
router.put('/:id/handle-extension', reservationController.handleExtension);
router.post('/validate-floor-access', reservationController.validateFloorAccess);
router.post('/check-expired', reservationController.checkExpiredReservations);

module.exports = router;