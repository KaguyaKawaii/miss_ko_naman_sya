const roomService = require("../services/roomService");

exports.getRooms = async (req, res) => {
  try {
    const rooms = await roomService.getAllRooms();
    res.status(200).json(rooms);
  } catch (err) {
    console.error("❌ Error fetching rooms:", err);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const room = await roomService.createRoom(req.body, req);

    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to create room" });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    await roomService.deleteRoom(req.params.id, req);
    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete room" });
  }
};


