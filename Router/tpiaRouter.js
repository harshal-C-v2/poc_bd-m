const express = require("express");
const router = express.Router();
const tpiaController = require("../Controller/tpiaController");

router.route("/all").get(tpiaController.getAllTpia);
router.route("/").get(tpiaController.getTpias).post(tpiaController.createTpia);
router.route("/:id").patch(tpiaController.updateTpia).delete(tpiaController.deleteTpia).get(tpiaController.getTpiaById);
module.exports = router;
