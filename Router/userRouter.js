const express = require("express");
const userController = require("../Controller/userController");
const authMiddleware = require("../Midelwares/AuthMiddleware");

const router = express.Router();

router.route("/setPassword").post(authMiddleware.hashPassword, userController.setPassword);

router.use(authMiddleware.protectedRoute);
router.route("/").get(userController.getUsers);
router.route("/").post(authMiddleware.returnTempToken, userController.createUser);
router.route("/me").get(userController.getMe);
router.route("/generateSetPasswordLink/:id").post(userController.generateSetPasswordLink);
router.route("/:id").get(userController.getUserById).patch(userController.updateUser);
router.route("/deactivateUser/:id").delete(userController.deactivateUser);

module.exports = router;
