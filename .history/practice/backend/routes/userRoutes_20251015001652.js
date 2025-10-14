const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../middleware/upload");

// ================== GET ALL USERS (for admin messaging) ==================
router.get("/", userController.getAllUsersForMessaging); // KEEP THIS ONE

// ================== PUBLIC ROUTES ==================
router.post("/signup", upload.single("profile"), userController.signup);
router.post("/login", userController.login);

// ================== ADMIN & SPECIAL ROUTES ==================
router.put("/toggle-suspend/:id", userController.toggleSuspendUser);
router.put("/toggle-verify/:id", userController.toggleVerifyUser); // ✅ ADDED THIS MISSING ROUTE
router.put("/suspend/:id", userController.suspendUser);
router.put("/unsuspend/:id", userController.unsuspendUser);
router.patch("/verify/:id", userController.verifyUser);
router.put("/archive/:id", userController.archiveUser);
router.put("/restore/:id", userController.restoreUser);
router.put("/admin-edit/:id", upload.single("profile"), userController.adminEditUser);
router.post("/add-user", upload.single("profile"), userController.addUser);

router.get("/archived/all", userController.getArchivedUsers);
router.delete("/archived/:id", userController.deleteArchivedUser);

router.get("/all/users", userController.getAllUsers);
router.get("/search/users", userController.searchUsers);

// ================== STATIC ROUTES ==================
router.get("/check-participant", userController.checkParticipant);

// ================== PROFILE ROUTES ==================
router.put("/:id/update-profile", userController.updateProfile);
router.post("/:id/upload-picture", upload.single("profile"), userController.uploadPicture);
router.delete("/:id/remove-picture", userController.removePicture);
router.put("/:id/change-password", userController.changePassword);

// ================== USER BY ROLE ROUTE ==================
router.get("/role/users", userController.getUsersByRole);

// ================== UNREAD COUNTS ROUTES ==================
router.get("/:userId/unread-counts", userController.getUserUnreadCounts);

// ================== TEST ROUTE ==================
router.get("/test/cloudinary", userController.testCloudinary);

// ================== GENERIC ROUTE LAST ==================
// ⚠️ THIS MUST BE AT THE BOTTOM - MOVE IT HERE
router.get("/:id", userController.getUserById);

module.exports = router;