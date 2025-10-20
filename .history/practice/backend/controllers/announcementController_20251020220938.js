const Announcement = require('../models/Announcement');
const Log = require('../models/Log');

const announcementController = {
  // Create new announcement
  async createAnnouncement(req, res) {
    try {
      const { title, message, endDate } = req.body;
      
      // For demo purposes, use a default user ID if not provided
      const createdBy = req.user?._id || '65d8f1a9e4b3c1a2b3c4d5e6'; // Default admin user ID
      
      const announcement = new Announcement({
        title,
        message,
        type: 'info', // Always set to info
        priority: 'medium', // Always set to medium
        endDate: endDate || null, // Make endDate optional
        targetAudience: 'all', // Always set to all users (excluding admins)
        createdBy: createdBy
      });

      await announcement.save();
      await announcement.populate('createdBy', 'name email');

      // Log the announcement creation
      await Log.create({
        userId: createdBy,
        action: 'CREATE_ANNOUNCEMENT',
        details: `Created announcement: ${title}`,
        id_number: req.user?.id_number || 'system',
        userName: req.user?.name || 'System'
      });

      // Emit socket event for real-time updates
      const io = req.app.get('socketio');
      if (io) {
        io.emit('new-announcement', announcement);
      }

      res.status(201).json({
        success: true,
        message: 'Announcement created successfully',
        announcement
      });
    } catch (error) {
      console.error('Create announcement error:', error);
      
      // Log the error
      await Log.create({
        userId: req.user?._id || '65d8f1a9e4b3c1a2b3c4d5e6',
        action: 'CREATE_ANNOUNCEMENT_ERROR',
        details: `Failed to create announcement: ${error.message}`,
        id_number: req.user?.id_number || 'system',
        userName: req.user?.name || 'System'
      });

      res.status(500).json({
        success: false,
        message: 'Failed to create announcement',
        error: error.message
      });
    }
  },

  // Get all announcements
  async getAnnouncements(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const announcements = await Announcement.find()
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Announcement.countDocuments();

      // Log the fetch action
      await Log.create({
        userId: req.user?._id,
        action: 'FETCH_ANNOUNCEMENTS',
        details: `Fetched announcements page ${page} with limit ${limit}`,
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

      res.json({
        success: true,
        announcements,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get announcements error:', error);
      
      // Log the error
      await Log.create({
        userId: req.user?._id,
        action: 'FETCH_ANNOUNCEMENTS_ERROR',
        details: `Failed to fetch announcements: ${error.message}`,
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

      res.status(500).json({
        success: false,
        message: 'Failed to fetch announcements',
        error: error.message
      });
    }
  },

  // Get active announcements for current user - FIXED VERSION
  async getActiveAnnouncements(req, res) {
    try {
      const userId = req.query.userId; // Get userId from query params
      const userRole = (req.query.userRole || 'student').toLowerCase(); // Convert to lowercase

      console.log('Fetching active announcements for:', { userId, userRole });

      // Use the static method from the model
      const announcements = await Announcement.getActiveForUser(userId, userRole);

      console.log('Found announcements:', announcements.length);

      // Log the active announcements fetch
      await Log.create({
        userId: userId,
        action: 'FETCH_ACTIVE_ANNOUNCEMENTS',
        details: `Fetched ${announcements.length} active announcements for ${userRole}`,
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

      res.json({
        success: true,
        announcements
      });
    } catch (error) {
      console.error('Get active announcements error:', error);
      
      // Log the error
      await Log.create({
        userId: req.query.userId,
        action: 'FETCH_ACTIVE_ANNOUNCEMENTS_ERROR',
        details: `Failed to fetch active announcements: ${error.message}`,
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

      res.status(500).json({
        success: false,
        message: 'Failed to fetch active announcements',
        error: error.message
      });
    }
  },

  // Get announcement by ID
  async getAnnouncementById(req, res) {
    try {
      const announcement = await Announcement.findById(req.params.id)
        .populate('createdBy', 'name email');

      if (!announcement) {
        // Log not found
        await Log.create({
          userId: req.user?._id,
          action: 'ANNOUNCEMENT_NOT_FOUND',
          details: `Announcement with ID ${req.params.id} not found`,
          id_number: req.user?.id_number,
          userName: req.user?.name
        });

        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }

      // Log successful fetch
      await Log.create({
        userId: req.user?._id,
        action: 'FETCH_ANNOUNCEMENT_BY_ID',
        details: `Fetched announcement: ${announcement.title}`,
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

      res.json({
        success: true,
        announcement
      });
    } catch (error) {
      console.error('Get announcement error:', error);
      
      // Log the error
      await Log.create({
        userId: req.user?._id,
        action: 'FETCH_ANNOUNCEMENT_BY_ID_ERROR',
        details: `Failed to fetch announcement ${req.params.id}: ${error.message}`,
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

      res.status(500).json({
        success: false,
        message: 'Failed to fetch announcement',
        error: error.message
      });
    }
  },

  // Update announcement
  async updateAnnouncement(req, res) {
    try {
      const announcement = await Announcement.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('createdBy', 'name email');

      if (!announcement) {
        // Log not found
        await Log.create({
          userId: req.user?._id,
          action: 'UPDATE_ANNOUNCEMENT_NOT_FOUND',
          details: `Announcement with ID ${req.params.id} not found for update`,
          id_number: req.user?.id_number,
          userName: req.user?.name
        });

        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }

      // Log the update
      await Log.create({
        userId: req.user?._id,
        action: 'UPDATE_ANNOUNCEMENT',
        details: `Updated announcement: ${announcement.title}`,
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

      // Emit socket event for real-time updates
      const io = req.app.get('socketio');
      if (io) {
        io.emit('announcement-updated', announcement);
      }

      res.json({
        success: true,
        message: 'Announcement updated successfully',
        announcement
      });
    } catch (error) {
      console.error('Update announcement error:', error);
      
      // Log the error
      await Log.create({
        userId: req.user?._id,
        action: 'UPDATE_ANNOUNCEMENT_ERROR',
        details: `Failed to update announcement ${req.params.id}: ${error.message}`,
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

      res.status(500).json({
        success: false,
        message: 'Failed to update announcement',
        error: error.message
      });
    }
  },

  // Delete announcement
  async deleteAnnouncement(req, res) {
    try {
      const announcement = await Announcement.findByIdAndDelete(req.params.id);

      if (!announcement) {
        // Log not found
        await Log.create({
          userId: req.user?._id,
          action: 'DELETE_ANNOUNCEMENT_NOT_FOUND',
          details: `Announcement with ID ${req.params.id} not found for deletion`,
          id_number: req.user?.id_number,
          userName: req.user?.name
        });

        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }

      // Log the deletion
      await Log.create({
        userId: req.user?._id,
        action: 'DELETE_ANNOUNCEMENT',
        details: `Deleted announcement: ${announcement.title}`,
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

      // Emit socket event for real-time updates
      const io = req.app.get('socketio');
      if (io) {
        io.emit('announcement-deleted', announcement._id);
      }

      res.json({
        success: true,
        message: 'Announcement deleted successfully'
      });
    } catch (error) {
      console.error('Delete announcement error:', error);
      
      // Log the error
      await Log.create({
        userId: req.user?._id,
        action: 'DELETE_ANNOUNCEMENT_ERROR',
        details: `Failed to delete announcement ${req.params.id}: ${error.message}`,
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

      res.status(500).json({
        success: false,
        message: 'Failed to delete announcement',
        error: error.message
      });
    }
  },

  // Dismiss announcement for user
  async dismissAnnouncement(req, res) {
    try {
      const announcement = await Announcement.findById(req.params.id);
      const userId = req.body.userId; // Get userId from request body

      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required to dismiss announcement'
        });
      }

      await announcement.dismissForUser(userId);

      // Log the dismissal
      await Log.create({
        userId: userId,
        action: 'DISMISS_ANNOUNCEMENT',
        details: `Dismissed announcement: ${announcement.title}`,
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

      res.json({
        success: true,
        message: 'Announcement dismissed'
      });
    } catch (error) {
      console.error('Dismiss announcement error:', error);
      
      // Log the error
      await Log.create({
        userId: req.body.userId,
        action: 'DISMISS_ANNOUNCEMENT_ERROR',
        details: `Failed to dismiss announcement ${req.params.id}: ${error.message}`,
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

      res.status(500).json({
        success: false,
        message: 'Failed to dismiss announcement',
        error: error.message
      });
    }
  },

  // Get all announcements for management (with delete option)
  async getAllAnnouncementsForManagement(req, res) {
    try {
      const announcements = await Announcement.find()
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

      // Log management access
      await Log.create({
        userId: req.user?._id,
        action: 'MANAGEMENT_ACCESS_ANNOUNCEMENTS',
        details: 'Accessed announcements management panel',
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

      res.json({
        success: true,
        announcements
      });
    } catch (error) {
      console.error('Get all announcements error:', error);
      
      // Log the error
      await Log.create({
        userId: req.user?._id,
        action: 'MANAGEMENT_ACCESS_ANNOUNCEMENTS_ERROR',
        details: `Failed to access announcements management: ${error.message}`,
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

      res.status(500).json({
        success: false,
        message: 'Failed to fetch announcements',
        error: error.message
      });
    }
  }
};

module.exports = announcementController;