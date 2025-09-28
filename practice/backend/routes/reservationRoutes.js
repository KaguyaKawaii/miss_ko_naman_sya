const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");

// ✅ Reservation limits
router.get("/check-limit/:userId", reservationController.checkUserReservationLimit);

// ✅ Availability
router.get("/availability", reservationController.getAvailability);

// ✅ Floor-based filter
router.get("/floor/:floor", reservationController.getReservationsByFloor);

// ✅ Archived Reservations
router.get("/archived", reservationController.getArchivedReservations);
router.delete("/archived/:id", reservationController.deleteArchivedReservation);

// ✅ Reservations CRUD
router.get("/", reservationController.getAllReservations);
router.get("/user/:userId", reservationController.getUserReservations);
router.get("/active/:userId", reservationController.getActiveReservation);
router.post("/", reservationController.createReservation);
router.put("/:id", reservationController.updateReservationStatus);
router.delete("/:id", reservationController.cancelReservation);

// ✅ Archive & Restore
router.put("/archive/:id", reservationController.archiveReservation);
router.put("/restore/:id", reservationController.restoreReservation);

// ✅ Expired reservations check
router.get("/check-expired", reservationController.checkExpiredReservations);

// ✅ New PATCH for status updates
router.patch("/:id/status", reservationController.updateReservationStatus);



module.exports = router;
