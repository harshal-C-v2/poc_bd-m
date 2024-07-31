const express = require("express");
const router = express.Router();
const notesController = require("../Controller/notesController");
const authMiddleware = require("../Midelwares/AuthMiddleware");

router.use(authMiddleware.protectedRoute);
router.route("/").post(notesController.createNote);
router
  .route("/:id")
  .get(notesController.getNotesByJobId)
  .delete(notesController.deleteNote)
  .patch(notesController.updateNotes);
module.exports = router;
