const express = require("express");
const router = express.Router();
const contactController = require("../Controller/contactController");

router.route("/:id").delete(contactController.deleteContact);

module.exports = router;
