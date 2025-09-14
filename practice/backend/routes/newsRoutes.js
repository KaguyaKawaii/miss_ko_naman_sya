const express = require("express");
const router = express.Router();
const News = require("../models/News");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "..", "uploads", "news");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// --- Multer setup for image uploads with validation ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// --- SEARCH news (put BEFORE /:id route) ---
router.get("/search/:query", async (req, res) => {
  try {
    const query = req.params.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const regex = new RegExp(query, "i");

    const newsList = await News.find({
      $or: [{ title: regex }, { content: regex }],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await News.countDocuments({
      $or: [{ title: regex }, { content: regex }],
    });

    res.json({
      news: newsList,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    });
  } catch (err) {
    console.error("Error searching news:", err);
    res.status(500).json({ error: "Failed to search news." });
  }
});

router.get("/", async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GET all news with optional pagination ---
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const newsList = await News.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await News.countDocuments();

    res.json({
      news: newsList,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalNews: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    });
  } catch (err) {
    console.error("Error fetching news:", err);
    res.status(500).json({ error: "Failed to fetch news." });
  }
});

// --- GET single news item ---
router.get("/:id", async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ error: "News item not found." });
    }
    res.json(newsItem);
  } catch (err) {
    console.error("Error fetching news item:", err);
    res.status(500).json({ error: "Failed to fetch news item." });
  }
});

// --- POST news ---
router.post("/", upload.single("image"), async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  try {
    const image = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/news/${req.file.filename}`
      : null;

    const newNews = new News({ title, content, image });
    await newNews.save();

    res.status(201).json({
      message: "News posted successfully!",
      news: newNews,
    });
  } catch (err) {
    console.error("Error posting news:", err);
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({ error: "Failed to post news." });
  }
});

// --- UPDATE news ---
// --- UPDATE news ---
router.put("/:id", upload.single("image"), async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  try {
    const existingNews = await News.findById(req.params.id);
    if (!existingNews) {
      return res.status(404).json({ error: "News not found." });
    }

    const updateData = { title, content };

    if (req.file) {
      // ✅ New image uploaded
      if (existingNews.image) {
        const oldPath = path.join(
          __dirname,
          "..",
          existingNews.image.replace(`${req.protocol}://${req.get("host")}/`, "")
        );
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, (err) => {
            if (err) console.error("Error deleting old image:", err);
          });
        }
      }
      updateData.image = `${req.protocol}://${req.get("host")}/uploads/news/${req.file.filename}`;
    } else {
      // ✅ Keep old image if no new file
      updateData.image = existingNews.image;
    }

    const updatedNews = await News.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      message: "News updated successfully!",
      news: updatedNews,
    });
  } catch (err) {
    console.error("Error updating news:", err);
    res.status(500).json({ error: "Failed to update news." });
  }
});


// --- DELETE news ---
router.delete("/:id", async (req, res) => {
  try {
    const deletedNews = await News.findByIdAndDelete(req.params.id);
    if (!deletedNews) {
      return res.status(404).json({ error: "News not found." });
    }

    if (deletedNews.image) {
      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        "news",
        path.basename(deletedNews.image)
      );
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, () => {});
      }
    }

    res.json({
      message: "News deleted successfully!",
      deletedId: deletedNews._id,
    });
  } catch (err) {
    console.error("Error deleting news:", err);
    res.status(500).json({ error: "Failed to delete news." });
  }
});

module.exports = router;
