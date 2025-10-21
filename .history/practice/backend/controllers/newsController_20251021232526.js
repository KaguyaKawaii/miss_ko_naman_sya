const News = require("../models/News");
const Log = require("../models/Log");
const { uploadToCloudinary } = require("../services/cloudinaryService");

// 🔍 Search news
exports.searchNews = async (req, res) => {
  try {
    const regex = new RegExp(req.params.query, "i");
    const newsList = await News.find({
      $or: [{ title: regex }, { content: regex }],
    }).sort({ createdAt: -1 });

    res.json(newsList);
  } catch (err) {
    console.error("Error searching news:", err);
    res.status(500).json({ error: "Failed to search news." });
  }
};

// 📄 Get all active news
exports.getAllNews = async (req, res) => {
  try {
    const newsList = await News.find({ archived: false }).sort({ createdAt: -1 });
    res.json(newsList);
  } catch (err) {
    console.error("Error fetching news:", err);
    res.status(500).json({ error: "Failed to fetch news." });
  }
};

// 📄 Get archived news
exports.getArchivedNews = async (req, res) => {
  try {
    const archivedList = await News.find({ archived: true }).sort({ createdAt: -1 });
    res.json(archivedList);
  } catch (err) {
    console.error("Error fetching archived news:", err);
    res.status(500).json({ error: "Failed to fetch archived news." });
  }
};

// 🗄 Archive a news item
exports.archiveNews = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { archived: true },
      { new: true }
    );
    if (!news) {
      return res.status(404).json({ error: "News not found." });
    }

    // Log successful archiving
    await Log.create({
      userId: req.user?._id,
      action: 'ARCHIVE_NEWS',
      details: `Archived news: "${news.title}"`,
      id_number: 'N/A',
      userName: req.user?.name || 'Admin'
    });

    res.json(news);
  } catch (err) {
    console.error("Error archiving news:", err);
    res.status(500).json({ error: "Failed to archive news." });
  }
};

// ♻️ Restore a news item
exports.restoreNews = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { archived: false },
      { new: true }
    );
    if (!news) {
      return res.status(404).json({ error: "News not found." });
    }

    // Log successful restoration
    await Log.create({
      userId: req.user?._id,
      action: 'RESTORE_NEWS',
      details: `Restored news: "${news.title}"`,
      id_number: 'N/A',
      userName: req.user?.name || 'Admin'
    });

    res.json(news);
  } catch (err) {
    console.error("Error restoring news:", err);
    res.status(500).json({ error: "Failed to restore news." });
  }
};

// 📄 Get single news item
exports.getNewsById = async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ error: "News not found." });
    }

    res.json(newsItem);
  } catch (err) {
    console.error("Error fetching news item:", err);
    res.status(500).json({ error: "Failed to fetch news item." });
  }
};

// 🆕 Create news
exports.createNews = async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  try {
    let imageUrl = null;
    if (req.file) imageUrl = await uploadToCloudinary(req.file.buffer, "news_images");

    const newNews = new News({ title, content, image: imageUrl });
    await newNews.save();

    // Log successful creation
    await Log.create({
      userId: req.user?._id,
      action: 'CREATE_NEWS',
      details: `Created news: "${title}" ${imageUrl ? 'with image' : 'without image'}`,
      id_number: 'N/A',
      userName: req.user?.name || 'Admin'
    });

    res.status(201).json(newNews);
  } catch (err) {
    console.error("Error posting news:", err);
    res.status(500).json({ error: "Failed to post news." });
  }
};

// ✏️ Update news
exports.updateNews = async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  try {
    const existingNews = await News.findById(req.params.id);
    if (!existingNews) {
      return res.status(404).json({ error: "News not found." });
    }

    let imageUrl = existingNews.image;
    if (req.file) imageUrl = await uploadToCloudinary(req.file.buffer, "news_images");

    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      { title, content, image: imageUrl },
      { new: true, runValidators: true }
    );

    // Log successful update
    await Log.create({
      userId: req.user?._id,
      action: 'UPDATE_NEWS',
      details: `Updated news: "${title}" ${req.file ? 'with new image' : ''}`,
      id_number: 'N/A',
      userName: req.user?.name || 'Admin'
    });

    res.json(updatedNews);
  } catch (err) {
    console.error("Error updating news:", err);
    res.status(500).json({ error: "Failed to update news." });
  }
};

// ❌ Delete news (only archived)
exports.deleteNews = async (req, res) => {
  try {
    const deletedNews = await News.findOneAndDelete({ _id: req.params.id, archived: true });
    if (!deletedNews) {
      return res.status(404).json({ error: "News not found or not archived." });
    }

    // Log successful deletion
    await Log.create({
      userId: req.user?._id,
      action: 'DELETE_NEWS',
      details: `Permanently deleted archived news: "${deletedNews.title}"`,
      id_number: 'N/A',
      userName: req.user?.name || 'Admin'
    });

    res.json({ message: "Archived news deleted permanently.", deletedId: deletedNews._id });
  } catch (err) {
    console.error("Error deleting news:", err);
    res.status(500).json({ error: "Failed to delete news." });
  }
};