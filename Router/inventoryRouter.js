const express = require("express");
const authMiddleware = require("../Midelwares/AuthMiddleware");
const inventoryController = require("../Controller/inventoryController");

const router = express.Router();

router.use(authMiddleware.protectedRoute);
router.route("/").get(inventoryController.getAllInventory).post(inventoryController.createInventory);

router
  .route("/:id")
  .patch(inventoryController.updateInventory)
  .delete(inventoryController.deleteInventory)
  .get(inventoryController.getSpecificInventory);

router.route("/image/:id").delete(inventoryController.deleteImage);
router.route("/inventoryItem/:id").delete(inventoryController.deleteItemFromInventory);

router.route("/addImage").post(inventoryController.addImage);

module.exports = router;
