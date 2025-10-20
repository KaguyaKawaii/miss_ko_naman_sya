const backupService = require('../services/backupService');
const Backup = require('../models/Backup');
const Log = require('../models/Log'); // Add Log import

exports.createBackup = async (req, res) => {
  try {
    const userId = req.user?._id; // Assuming you have user authentication
    const result = await backupService.createBackup(userId);
    
    // Log backup creation
    await Log.create({
      userId: userId,
      action: 'CREATE_BACKUP',
      details: `Created backup: ${result.name}`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    res.json({ 
      success: true, 
      message: 'Backup created successfully in database and locally', 
      backup: result
    });
  } catch (error) {
    console.error('Backup creation error:', error);
    
    // Log backup creation error
    await Log.create({
      userId: req.user?._id,
      action: 'CREATE_BACKUP_ERROR',
      details: `Failed to create backup: ${error.message}`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.listBackups = async (req, res) => {
  try {
    const backups = await backupService.getBackupList();

    // Log backup list access
    await Log.create({
      userId: req.user?._id,
      action: 'LIST_BACKUPS',
      details: `Listed ${backups.length} backup files`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    res.json({ 
      success: true, 
      backups,
      total: backups.length
    });
  } catch (error) {
    console.error('Backup list error:', error);
    
    // Log backup list error
    await Log.create({
      userId: req.user?._id,
      action: 'LIST_BACKUPS_ERROR',
      details: `Failed to list backups: ${error.message}`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

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
      
      // Log backup not found for download
      await Log.create({
        userId: req.user?._id,
        action: 'DOWNLOAD_BACKUP_NOT_FOUND',
        details: `Backup file not found: ${filename}`,
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

      return res.status(404).json({ 
        success: false, 
        message: 'Backup file not found in database' 
      });
    }

    console.log('✅ Found backup:', backup.name, 'filename:', backup.filename);

    // Get the file path and download
    const filePath = await backupService.getBackupPath(backup.filename);
    
    console.log('📁 File path:', filePath);
    
    // Log backup download
    await Log.create({
      userId: req.user?._id,
      action: 'DOWNLOAD_BACKUP',
      details: `Downloaded backup: ${backup.name} (${backup.filename})`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    // Set proper headers for ZIP file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${backup.filename}"`);
    
    res.download(filePath, backup.filename, (err) => {
      if (err) {
        console.error('❌ Download error:', err);
        
        // Log download error
        Log.create({
          userId: req.user?._id,
          action: 'DOWNLOAD_BACKUP_ERROR',
          details: `Failed to download backup ${backup.filename}: ${err.message}`,
          id_number: req.user?.id_number,
          userName: req.user?.name
        });

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
    
    // Log download backup error
    await Log.create({
      userId: req.user?._id,
      action: 'DOWNLOAD_BACKUP_ERROR',
      details: `Failed to download backup: ${error.message}`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

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
      // Log backup not found for deletion
      await Log.create({
        userId: req.user?._id,
        action: 'DELETE_BACKUP_NOT_FOUND',
        details: `Backup not found for deletion: ${filename}`,
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

      return res.status(404).json({ 
        success: false, 
        message: 'Backup not found' 
      });
    }

    await backupService.deleteBackup(backup.name);
    
    // Log backup deletion
    await Log.create({
      userId: req.user?._id,
      action: 'DELETE_BACKUP',
      details: `Deleted backup: ${backup.name} (${backup.filename})`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    res.json({ 
      success: true, 
      message: 'Backup deleted successfully from database and locally' 
    });
  } catch (error) {
    console.error('Delete backup error:', error);
    
    // Log backup deletion error
    await Log.create({
      userId: req.user?._id,
      action: 'DELETE_BACKUP_ERROR',
      details: `Failed to delete backup ${req.params.filename}: ${error.message}`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

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
      // Log backup info not found
      await Log.create({
        userId: req.user?._id,
        action: 'BACKUP_INFO_NOT_FOUND',
        details: `Backup info not found: ${filename}`,
        id_number: req.user?.id_number,
        userName: req.user?.name
      });

      return res.status(404).json({ 
        success: false, 
        message: 'Backup not found' 
      });
    }
    
    // Log backup info access
    await Log.create({
      userId: req.user?._id,
      action: 'GET_BACKUP_INFO',
      details: `Accessed backup info: ${backup.name}`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

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
    
    // Log backup info error
    await Log.create({
      userId: req.user?._id,
      action: 'GET_BACKUP_INFO_ERROR',
      details: `Failed to get backup info for ${req.params.filename}: ${error.message}`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

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
    
    // Log backup test
    await Log.create({
      userId: req.user?._id,
      action: 'TEST_BACKUP_SYSTEM',
      details: 'Tested backup system functionality',
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

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
    // Log backup test error
    await Log.create({
      userId: req.user?._id,
      action: 'TEST_BACKUP_SYSTEM_ERROR',
      details: `Backup system test failed: ${error.message}`,
      id_number: req.user?.id_number,
      userName: req.user?.name
    });

    res.status(500).json({
      success: false,
      message: 'Backup system error: ' + error.message
    });
  }
};