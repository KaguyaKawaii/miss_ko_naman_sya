const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const archiver = require('archiver');
const Backup = require('../models/Backup');

class BackupService {
  constructor() {
    this.backupDir = path.join(__dirname, '../../backups');
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log('✅ Backup directory created:', this.backupDir);
    }
  }

  async createBackup(userId = null) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `system-backup-${timestamp}`;
      const fileName = `${backupName}.zip`; // Ensure .zip extension
      const filePath = path.join(this.backupDir, fileName);

      console.log('🔄 Starting ZIP backup creation...');
      
      // Create ZIP archive
      const output = fs.createWriteStream(filePath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      return new Promise((resolve, reject) => {
        output.on('close', async () => {
          console.log('✅ ZIP backup created:', archive.pointer() + ' total bytes');
          
          const fileStats = fs.statSync(filePath);
          const fileSize = this.formatFileSize(fileStats.size);

          // Save backup info to MongoDB
          try {
            const backupData = await this.collectBackupData();
            
            const backup = new Backup({
              name: backupName,
              filename: fileName, // This should be .zip
              data: {
                timestamp: new Date().toISOString(),
                system: 'Room Reservation System - Full Backup',
                version: '1.0.0',
                totalCollections: Object.keys(backupData.collections || {}).length,
                zipContents: await this.getZipContentsDescription(),
                fileType: 'zip',
                compression: 'high'
              },
              size: fileSize,
              type: 'full_system_zip',
              createdBy: userId
            });

            await backup.save();

            console.log('✅ Backup saved to MongoDB:', backupName);
            
            resolve({ 
              fileName: backupName,
              filename: fileName, // Ensure this is the .zip filename
              size: fileSize,
              id: backup._id,
              date: backup.createdAt,
              zipSize: archive.pointer(),
              fileType: 'zip'
            });
          } catch (error) {
            reject(error);
          }
        });

        archive.on('error', (err) => {
          console.error('❌ Archive error:', err);
          reject(err);
        });

        archive.on('warning', (err) => {
          if (err.code === 'ENOENT') {
            console.warn('Archive warning:', err);
          } else {
            reject(err);
          }
        });

        archive.pipe(output);

        // Create organized backup structure
        this.createOrganizedBackup(archive)
          .then(() => {
            console.log('🔄 Finalizing archive...');
            archive.finalize();
          })
          .catch(reject);
      });
    } catch (error) {
      console.error('❌ Backup creation failed:', error);
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  async createOrganizedBackup(archive) {
    try {
      console.log('🔄 Creating organized backup structure in ZIP...');

      // Add README file
      const readmeContent = this.createReadmeFile();
      archive.append(readmeContent, { name: 'README.txt' });

      // Get all collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      console.log(`📊 Found ${collections.length} collections to backup`);

      const collectionStats = {};

      // Backup each collection with organized structure
      for (const collectionInfo of collections) {
        const collectionName = collectionInfo.name;
        
        // Skip system collections
        if (collectionName.startsWith('system.') || collectionName === 'backups') {
          console.log(`⏭️  Skipping system collection: ${collectionName}`);
          continue;
        }

        console.log(`🔄 Backing up collection: ${collectionName}`);
        
        try {
          const collection = mongoose.connection.db.collection(collectionName);
          const allData = await collection.find({}).toArray();
          
          // Create JSON file for the collection
          const collectionData = {
            collection: collectionName,
            count: allData.length,
            timestamp: new Date().toISOString(),
            data: allData
          };

          // Add to ZIP with organized path
          const collectionPath = `collections/${collectionName}.json`;
          archive.append(JSON.stringify(collectionData, null, 2), { name: collectionPath });

          collectionStats[collectionName] = {
            count: allData.length,
            files: [`collections/${collectionName}.json`]
          };

          console.log(`✅ ${collectionName}: ${allData.length} records backed up`);
        } catch (error) {
          console.error(`❌ Error backing up ${collectionName}:`, error.message);
          collectionStats[collectionName] = {
            error: error.message
          };
        }
      }

      // Add metadata file
      const metadata = {
        timestamp: new Date().toISOString(),
        system: 'Room Reservation System',
        version: '1.0.0',
        database: mongoose.connection.name,
        format: 'ZIP',
        collections: collectionStats,
        totalCollections: Object.keys(collectionStats).length,
        totalRecords: Object.values(collectionStats).reduce((sum, stat) => sum + (stat.count || 0), 0)
      };

      archive.append(JSON.stringify(metadata, null, 2), { name: 'backup-metadata.json' });

      // Add database stats
      const dbStats = await this.getDatabaseStats();
      archive.append(JSON.stringify(dbStats, null, 2), { name: 'database-stats.json' });

      console.log('✅ Organized backup structure created in ZIP');
    } catch (error) {
      console.error('❌ Error creating organized backup:', error);
      throw error;
    }
  }

  async collectBackupData() {
    // This is used for MongoDB storage, not for ZIP content
    const collections = await mongoose.connection.db.listCollections().toArray();
    const backupData = {
      timestamp: new Date().toISOString(),
      collections: {}
    };

    for (const coll of collections) {
      if (coll.name.startsWith('system.')) continue;
      backupData.collections[coll.name] = { count: await this.getCollectionCount(coll.name) };
    }

    return backupData;
  }

  async getCollectionCount(collectionName) {
    try {
      const collection = mongoose.connection.db.collection(collectionName);
      return await collection.countDocuments();
    } catch (error) {
      return 0;
    }
  }

  async getDatabaseStats() {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const stats = {
      timestamp: new Date().toISOString(),
      database: mongoose.connection.name,
      collections: []
    };

    for (const coll of collections) {
      if (coll.name.startsWith('system.')) continue;
      
      try {
        const collection = mongoose.connection.db.collection(coll.name);
        const count = await collection.countDocuments();
        
        stats.collections.push({
          name: coll.name,
          count: count,
          status: 'backed_up'
        });
      } catch (error) {
        stats.collections.push({
          name: coll.name,
          error: error.message,
          status: 'failed'
        });
      }
    }

    return stats;
  }

  async getZipContentsDescription() {
    const collections = await this.getCollectionList();
    return {
      format: "ZIP Archive",
      compression: "High (Level 9)",
      contents: [
        "README.txt - Backup information and instructions",
        "backup-metadata.json - Backup metadata and collection list",
        "database-stats.json - Database statistics",
        "collections/ - Complete collections as JSON files"
      ],
      totalCollections: collections.length
    };
  }

  async getCollectionList() {
    const collections = await mongoose.connection.db.listCollections().toArray();
    return collections.filter(coll => !coll.name.startsWith('system.'));
  }

  createReadmeFile() {
    return `Room Reservation System Backup
===============================

Backup created: ${new Date().toISOString()}
Format: ZIP Archive
Compression: High

CONTENTS:
---------
/README.txt           - This file
/backup-metadata.json - Backup information and collection list
/database-stats.json  - Database statistics
/collections/         - Complete collections as JSON files

RESTORATION:
------------
1. Extract this ZIP file
2. Use the JSON files in /collections/ for data restoration
3. Refer to backup-metadata.json for collection information

NOTES:
------
- This is a complete database backup
- All timestamps are in ISO format
- Collections are stored as complete JSON files
- This backup contains all non-system collections
`;
  }

  async getBackupList() {
    try {
      const backups = await Backup.find()
        .sort({ createdAt: -1 })
        .select('name filename size createdAt type data')
        .populate('createdBy', 'name email')
        .lean();

      return backups.map(backup => ({
        name: backup.name,
        filename: backup.filename,
        size: backup.size,
        date: backup.createdAt,
        type: backup.type,
        id: backup._id,
        createdBy: backup.createdBy ? backup.createdBy.name : 'System',
        isZip: backup.filename.endsWith('.zip'),
        totalCollections: backup.data?.totalCollections || 0,
        format: 'ZIP',
        fileType: backup.data?.fileType || 'zip'
      }));
    } catch (error) {
      console.error('Error listing backups from MongoDB:', error);
      throw new Error(`Failed to list backups: ${error.message}`);
    }
  }

  async getBackupData(backupName) {
    try {
      const backup = await Backup.findOne({ name: backupName });
      if (!backup) {
        throw new Error('Backup not found in database');
      }
      return backup;
    } catch (error) {
      throw new Error(`Failed to get backup data: ${error.message}`);
    }
  }

  getBackupPath(filename) {
    // Security check
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new Error('Invalid filename');
    }
    
    const filePath = path.join(this.backupDir, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Backup file not found: ' + filename);
    }
    
    return filePath;
  }

  async deleteBackup(backupName) {
    try {
      // Find backup in database first
      const backup = await Backup.findOne({ name: backupName });
      if (!backup) {
        throw new Error('Backup not found in database');
      }

      // Delete local file
      const filePath = this.getBackupPath(backup.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete from MongoDB
      await Backup.deleteOne({ name: backupName });

      console.log('✅ Backup deleted from MongoDB and locally:', backupName);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete backup: ${error.message}`);
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = new BackupService();