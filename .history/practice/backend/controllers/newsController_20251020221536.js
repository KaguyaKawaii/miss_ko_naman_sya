const News = require("../models/News");
const Log = require("../models/Log"); // Add Log import
const { uploadToCloudinary } = require("../services/cloudinaryService");

// 🔍 Search news
exports.searchNews = async (req, res) => {
  try {
    const regex = new RegExp(req.params.query, "i");
    const newsList = await News.find({
      $or: [{ title: regex }, { content: regex }],
    }).sort({ createdAt: -1 });

    // Log search action
    await Log.create({
      userId: req.user?._id,
      action: 'SEARCH_NEWS',
      details: `Searched news for: "${req.params.query}" - Found ${newsList.length} results`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    res.json(newsList);
  } catch (err) {
    console.error("Error searching news:", err);
    
    // Log search error
    await Log.create({
      userId: req.user?._id,
      action: 'SEARCH_NEWS_ERROR',
      details: `Failed to search news for "${req.params.query}": ${err.message}`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    res.status(500).json({ error: "Failed to search news." });
  }
};

// 📄 Get all active news
exports.getAllNews = async (req, res) => {
  try {
    const newsList = await News.find({ archived: false }).sort({ createdAt: -1 });
    
    // Log news fetch
    await Log.create({
      userId: req.user?._id,
      action: 'GET_ALL_NEWS',
      details: `Fetched ${newsList.length} active news items`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    res.json(newsList);
  } catch (err) {
    console.error("Error fetching news:", err);
    
    // Log fetch error
    await Log.create({
      userId: req.user?._id,
      action: 'GET_ALL_NEWS_ERROR',
      details: `Failed to fetch active news: ${err.message}`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    res.status(500).json({ error: "Failed to fetch news." });
  }
};

// 📄 Get archived news
exports.getArchivedNews = async (req, res) => {
  try {
    const archivedList = await News.find({ archived: true }).sort({ createdAt: -1 });
    
    // Log archived news fetch
    await Log.create({
      userId: req.user?._id,
      action: 'GET_ARCHIVED_NEWS',
      details: `Fetched ${archivedList.length} archived news items`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    res.json(archivedList);
  } catch (err) {
    console.error("Error fetching archived news:", err);
    
    // Log archived fetch error
    await Log.create({
      userId: req.user?._id,
      action: 'GET_ARCHIVED_NEWS_ERROR',
      details: `Failed to fetch archived news: ${err.message}`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

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
      // Log not found
      await Log.create({
        userId: req.user?._id,
        action: 'ARCHIVE_NEWS_NOT_FOUND',
        details: `News item not found for archiving: ${req.params.id}`,
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

      return res.status(404).json({ error: "News not found." });
    }

    // Log successful archiving
    await Log.create({
      userId: req.user?._id,
      action: 'ARCHIVE_NEWS',
      details: `Archived news: "${news.title}"`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    res.json(news);
  } catch (err) {
    console.error("Error archiving news:", err);
    
    // Log archiving error
    await Log.create({
      userId: req.user?._id,
      action: 'ARCHIVE_NEWS_ERROR',
      details: `Failed to archive news ${req.params.id}: ${err.message}`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

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
      // Log not found
      await Log.create({
        userId: req.user?._id,
        action: 'RESTORE_NEWS_NOT_FOUND',
        details: `News item not found for restoration: ${req.params.id}`,
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

      return res.status(404).json({ error: "News not found." });
    }

    // Log successful restoration
    await Log.create({
      userId: req.user?._id,
      action: 'RESTORE_NEWS',
      details: `Restored news: "${news.title}"`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    res.json(news);
  } catch (err) {
    console.error("Error restoring news:", err);
    
    // Log restoration error
    await Log.create({
      userId: req.user?._id,
      action: 'RESTORE_NEWS_ERROR',
      details: `Failed to restore news ${req.params.id}: ${err.message}`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    res.status(500).json({ error: "Failed to restore news." });
  }
};

// 📄 Get single news item
exports.getNewsById = async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id);
    if (!newsItem) {
      // Log not found
      await Log.create({
        userId: req.user?._id,
        action: 'GET_NEWS_BY_ID_NOT_FOUND',
        details: `News item not found: ${req.params.id}`,
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

      return res.status(404).json({ error: "News not found." });
    }

    // Log successful fetch
    await Log.create({
      userId: req.user?._id,
      action: 'GET_NEWS_BY_ID',
      details: `Fetched news: "${newsItem.title}"`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    res.json(newsItem);
  } catch (err) {
    console.error("Error fetching news item:", err);
    
    // Log fetch error
    await Log.create({
      userId: req.user?._id,
      action: 'GET_NEWS_BY_ID_ERROR',
      details: `Failed to fetch news item ${req.params.id}: ${err.message}`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    res.status(500).json({ error: "Failed to fetch news item." });
  }
};

// 🆕 Create news
exports.createNews = async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    // Log validation error
    await Log.create({
      userId: req.user?._id,
      action: 'CREATE_NEWS_VALIDATION_ERROR',
      details: 'Missing title or content for news creation',
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

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
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    res.status(201).json(newNews);
  } catch (err) {
    console.error("Error posting news:", err);
    
    // Log creation error
    await Log.create({
      userId: req.user?._id,
      action: 'CREATE_NEWS_ERROR',
      details: `Failed to create news "${title}": ${err.message}`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    res.status(500).json({ error: "Failed to post news." });
  }
};

// ✏️ Update news
exports.updateNews = async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    // Log validation error
    await Log.create({
      userId: req.user?._id,
      action: 'UPDATE_NEWS_VALIDATION_ERROR',
      details: 'Missing title or content for news update',
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    return res.status(400).json({ error: "Title and content are required." });
  }

  try {
    const existingNews = await News.findById(req.params.id);
    if (!existingNews) {
      // Log not found
      await Log.create({
        userId: req.user?._id,
        action: 'UPDATE_NEWS_NOT_FOUND',
        details: `News item not found for update: ${req.params.id}`,
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

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
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    res.json(updatedNews);
  } catch (err) {
    console.error("Error updating news:", err);
    
    // Log update error
    await Log.create({
      userId: req.user?._id,
      action: 'UPDATE_NEWS_ERROR',
      details: `Failed to update news ${req.params.id}: ${err.message}`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    res.status(500).json({ error: "Failed to update news." });
  }
};

// ❌ Delete news (only archived)
exports.deleteNews = async (req, res) => {
  try {
    const deletedNews = await News.findOneAndDelete({ _id: req.params.id, archived: true });
    if (!deletedNews) {
      // Log not found or not archived
      await Log.create({
        userId: req.user?._id,
        action: 'DELETE_NEWS_NOT_FOUND',
        details: `News not found or not archived for deletion: ${req.params.id}`,
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

      return res.status(404).json({ error: "News not found or not archived." });
    }

    // Log successful deletion
    await Log.create({
      userId: req.user?._id,
      action: 'DELETE_NEWS',
      details: `Permanently deleted archived news: "${deletedNews.title}"`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    res.json({ message: "Archived news deleted permanently.", deletedId: deletedNews._id });
  } catch (err) {
    console.error("Error deleting news:", err);
    
    // Log deletion error
    await Log.create({
      userId: req.user?._id,
      action: 'DELETE_NEWS_ERROR',
      details: `Failed to delete news ${req.params.id}: ${err.message}`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    res.status(500).json({ error: "Failed to delete news." });
  }
};