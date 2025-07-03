const mongoose = require("mongoose");
const Room = require("./models/Room");

const MONGODB_URI = "mongodb+srv://admin:admin@cluster0.9lvllcn.mongodb.net/USA-FLD?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  }
};

const seedRooms = async () => {
  const floorNames = ["Ground Floor", "2nd Floor", "4th Floor", "5th Floor"];
  const roomTypes = [
    "Discussion Room",
    "Collaboration Room",
    "Faculty Room",
    "Graduate Hub Research Room",
  ];

  const rooms = [];

  for (const floor of floorNames) {
    for (const type of roomTypes) {
      rooms.push({
        room: type,
        floor: floor,
        type: "General",
        capacity: 6,
        isActive: true,
      });
    }
  }

  try {
    await Room.deleteMany(); // Clear all existing
    const inserted = await Room.insertMany(rooms);
    console.log(`✅ Seeded ${inserted.length} rooms`);
  } catch (err) {
    console.error("❌ Seeding error:", err);
  } finally {
    mongoose.disconnect();
  }
};

connectDB().then(seedRooms);
