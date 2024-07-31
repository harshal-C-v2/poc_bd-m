const express = require("express");
const vendorController = require("../Controller/vendorController");

const router = express.Router();

router.route("/").get(vendorController.getVendors).post(vendorController.createVendor);

router.route("/all").get(vendorController.getAllVendors);

router
  .route("/:id")
  .patch(vendorController.updateVendor)
  .delete(vendorController.deleteVendor)
  .get(vendorController.getVendorById);

module.exports = router;
