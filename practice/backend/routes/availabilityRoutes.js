const express = require("express");
const router = express.Router();
const availabilityController = require("../controllers/availabilityController");

router.get("/availability", availabilityController.getAvailability);

module.exports = router;
