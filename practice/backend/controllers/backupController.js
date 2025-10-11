const backupService = require('../services/backupService');
const Backup = require('../models/Backup'); // Add this import

exports.createBackup = async (req, res) => {
  try {
    const userId = req.user?._id; // Assuming you have user authentication
    const result = await backupService.createBackup(userId);
    
    res.json({ 
      success: true, 
      message: 'Backup created successfully in database and locally', 
      backup: result
    });
  } catch (error) {
    console.error('Backup creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.listBackups = async (req, res) => {
  try {
    const backups = await backupService.getBackupList();
    res.json({ 
      success: true, 
      backups,
      total: backups.length
    });
  } catch (error) {
    console.error('Backup list error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.downloadBackup = async (req, res) => {
  try {
    const { filename } = req.params;
    console.log('🔄 Download request for filename:', filename);

    // FIX: Find backup by filename instead of name
    const backup = await Backup.findOne({ filename: filename });
    if (!backup) {
      console.error('❌ Backup not found for filename:', filename);
      return res.status(404).json({ 
        success: false, 
        message: 'Backup file not found in database' 
      });
    }

    console.log('✅ Found backup:', backup.name, 'filename:', backup.filename);

    // Get the file path and download
    const filePath = await backupService.getBackupPath(backup.filename);
    
    console.log('📁 File path:', filePath);
    
    // Set proper headers for ZIP file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${backup.filename}"`);
    
    res.download(filePath, backup.filename, (err) => {
      if (err) {
        console.error('❌ Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ 
            success: false, 
            message: 'Failed to download backup file' 
          });
        }
      } else {
        console.log('✅ Download completed successfully');
      }
    });
  } catch (error) {
    console.error('❌ Download backup error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.deleteBackup = async (req, res) => {
  try {
    const { filename } = req.params;
    console.log('🔄 Delete request for:', filename);

    // FIX: Find backup by filename instead of name
    const backup = await Backup.findOne({ filename: filename });
    if (!backup) {
      return res.status(404).json({ 
        success: false, 
        message: 'Backup not found' 
      });
    }

    await backupService.deleteBackup(backup.name);
    
    res.json({ 
      success: true, 
      message: 'Backup deleted successfully from database and locally' 
    });
  } catch (error) {
    console.error('Delete backup error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getBackupInfo = async (req, res) => {
  try {
    const { filename } = req.params;
    
    // FIX: Find backup by filename instead of name
    const backup = await Backup.findOne({ filename: filename });
    if (!backup) {
      return res.status(404).json({ 
        success: false, 
        message: 'Backup not found' 
      });
    }
    
    res.json({ 
      success: true, 
      backup: {
        name: backup.name,
        filename: backup.filename,
        size: backup.size,
        createdAt: backup.createdAt,
        type: backup.type,
        statistics: backup.data?.statistics
      }
    });
  } catch (error) {
    console.error('Get backup info error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Test endpoint
exports.testBackup = async (req, res) => {
  try {
    // Test database connection and get backup count
    const backupCount = await Backup.countDocuments();
    
    res.json({ 
      success: true, 
      message: 'Backup system is working!',
      storage: 'Backups are stored in MongoDB database AND local ZIP files',
      totalBackups: backupCount,
      endpoints: {
        list: 'GET /admin/system/backups',
        create: 'POST /admin/system/backup',
        download: 'GET /admin/system/backup/download/:filename',
        delete: 'DELETE /admin/system/backup/:filename',
        info: 'GET /admin/system/backup/info/:filename'
      },
      note: 'Download and delete endpoints use filename (e.g., system-backup-2024-01-15T10-30-45-123Z.zip)'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Backup system error: ' + error.message
    });
  }
};