const express = require("express");
const router = express.Router();
const News = require("../models/News");

// Get all news
router.get("/", async (req, res) => {
  try {
    const newsList = await News.find().sort({ createdAt: -1 });
    res.json(newsList);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch news." });
  }
});

// Post news
router.post("/", async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  try {
    const newNews = new News({ title, content });
    await newNews.save();
    res.status(201).json({ message: "News posted successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to post news." });
  }
});

module.exports = router;
