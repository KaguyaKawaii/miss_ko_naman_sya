const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const upload = require("../middleware/upload");

// Public routes
router.post("/signup", upload.single("profile"), userController.signup);
router.post("/login", userController.login);

// ✅ Admin & special routes first (to avoid conflict with "/:id")
router.put("/toggle-suspend/:id", userController.toggleSuspendUser);
router.put("/suspend/:id", userController.suspendUser);
router.put("/unsuspend/:id", userController.unsuspendUser);
router.put("/verify/:id", userController.verifyUser);
router.put("/archive/:id", userController.archiveUser);
router.put("/restore/:id", userController.restoreUser);
router.put("/admin-edit/:id", upload.single("profile"), userController.adminEditUser);
router.post("/add-user", upload.single("profile"), userController.addUser);
router.get("/archived/all", userController.getArchivedUsers);
router.delete("/archived/:id", userController.deleteArchivedUser);
router.get("/all/users", userController.getAllUsers);
router.get("/search/users", userController.searchUsers);
router.get("/unread/counts", userController.getUnreadCounts);
router.get("/check/participant", userController.checkParticipant);

// ✅ NEW: Fetch users by role (Staff, Student, etc.)
router.get("/", userController.getUsersByRole);

// ✅ Profile routes after special routes
router.put("/:id/update-profile", userController.updateProfile);
router.post("/upload-picture/:id", upload.single("profile"), userController.uploadPicture);
router.delete("/remove-picture/:id", userController.removePicture);
router.put("/change-password/:id", userController.changePassword);

// ✅ Generic route LAST (avoid route conflicts)
router.get("/:id", userController.getUserById);

module.exports = router;
