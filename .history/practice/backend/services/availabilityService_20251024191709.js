const availabilityService = require("../services/availabilityService");

exports.getAvailability = async (req, res) => {
  const { date, userId } = req.query;
  
  console.log("🎯 [CONTROLLER DEBUG] getAvailability called");
  console.log("🎯 [CONTROLLER DEBUG] Query params:", { date, userId });
  console.log("🎯 [CONTROLLER DEBUG] Service path:", require.resolve("../services/availabilityService"));

  if (!date || !userId) {
    return res.status(400).json({ message: "Missing date or userId" });
  }

  try {
    const data = await availabilityService.generateAvailability(date, userId);
    console.log("🎯 [CONTROLLER DEBUG] Data ready to send - Total rooms:", data.length);
    console.log("🎯 [CONTROLLER DEBUG] Inactive rooms in response:", data.filter(room => !room.isActive).length);
    res.json(data);
  } catch (err) {
    console.error("❌ [CONTROLLER DEBUG] Error:", err);
    res.status(500).json({ message: "Failed to fetch availability" });
  }
};