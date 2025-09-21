const availabilityService = require("../services/availabilityService");

exports.getAvailability = async (req, res) => {
  const { date, userId } = req.query;
  if (!date || !userId) {
    return res.status(400).json({ message: "Missing date or userId" });
  }

  try {
    const data = await availabilityService.generateAvailability(date, userId);
    res.json(data);
  } catch (err) {
    console.error("Error fetching availability:", err);
    res.status(500).json({ message: "Failed to fetch availability" });
  }
};
