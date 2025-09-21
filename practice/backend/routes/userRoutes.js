const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const multer = require("multer");

// ✅ Multer memory storage for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// -----------------------------
// User CRUD
// -----------------------------
router.post("/", upload.single("profile"), userController.addUser);
router.post("/signup", upload.single("profile"), userController.signup);
router.post("/login", userController.login);

// -----------------------------
// Profile Pictures
// -----------------------------
router.post("/upload-picture/:id", upload.single("profile"), userController.uploadPicture);
router.delete("/remove-picture/:id", userController.removePicture);

// -----------------------------
// Get Users & Participant Check
// -----------------------------
router.get("/check-participant", userController.checkParticipant);  // ✅ Fixed: placed before dynamic routes
router.get("/", userController.getAllUsers);

// -----------------------------
// Archived Users
// -----------------------------
router.get("/archived", userController.getArchivedUsers);
router.put("/archived/restore/:id", userController.restoreUser);
router.delete("/archived/:id", userController.deleteArchivedUser);
router.put("/archive/:id", userController.archiveUser);

// -----------------------------
// Update & Admin Edit
// -----------------------------
router.put("/:id/update-profile", upload.single("profile"), userController.updateProfile);
router.put("/change-password/:id", userController.changePassword);
router.patch("/verify/:id", userController.verifyUser);
router.put("/edit/:id", upload.single("profile"), userController.adminEditUser);

// -----------------------------
// Dynamic routes (must come last)
// -----------------------------
router.get("/:id/unread-counts", userController.getUnreadCounts);
router.get("/:id", userController.getUserById);

module.exports = router;