const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

// GET /rooms
router.get("/", roomController.getRooms);

// POST /rooms
router.post("/", roomController.createRoom);

// DELETE /rooms/:id
router.delete("/:id", roomController.deleteRoom);

module.exports = router;
