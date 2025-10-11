const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');

// Backup routes
router.get('/backups', backupController.listBackups);
router.post('/backup', backupController.createBackup);
router.get('/backup/download/:filename', backupController.downloadBackup);
router.delete('/backup/:filename', backupController.deleteBackup);
router.get('/backup/info/:filename', backupController.getBackupInfo); // New endpoint
router.get('/test', backupController.testBackup);

module.exports = router;