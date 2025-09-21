const express = require("express");
const router = express.Router();
const multer = require("multer");
const newsController = require("../controllers/newsController");

// Multer (memory storage for images)
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed!"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// 🔹 Routes order is important!

// Search news
router.get("/search/:query", newsController.searchNews);

// Get archived news
router.get("/archived", newsController.getArchivedNews);

// Get all active news
router.get("/active", newsController.getAllNews);

// Get single news item by ID
router.get("/:id", newsController.getNewsById);

// Create news
router.post("/", upload.single("image"), newsController.createNews);

// Update news
router.put("/:id", upload.single("image"), newsController.updateNews);

// Archive / Restore
router.put("/archive/:id", newsController.archiveNews);
router.put("/restore/:id", newsController.restoreNews);

// Delete news (only archived)
router.delete("/:id", newsController.deleteNews);

module.exports = router;
