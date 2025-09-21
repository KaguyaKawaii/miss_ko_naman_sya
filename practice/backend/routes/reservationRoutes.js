const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");

// ✅ Reservation limits
router.get("/check-limit/:userId", reservationController.checkUserReservationLimit);

// ✅ Reservations CRUD
router.get("/", reservationController.getAllReservations);
router.get("/user/:userId", reservationController.getUserReservations);
router.get("/active/:userId", reservationController.getActiveReservation);
router.post("/", reservationController.createReservation);
router.put("/:id", reservationController.updateReservationStatus);
router.delete("/:id", reservationController.cancelReservation);

// ✅ Permanently delete archived reservation
router.delete("/archived/:id", reservationController.deleteArchivedReservation);

// ✅ Availability (calls controller, which now uses availabilityService)
router.get("/availability", reservationController.getAvailability);

// ✅ Archive & Restore
router.get("/archived", reservationController.getArchivedReservations);
router.put("/archive/:id", reservationController.archiveReservation);
router.put("/restore/:id", reservationController.restoreReservation);

module.exports = router;
