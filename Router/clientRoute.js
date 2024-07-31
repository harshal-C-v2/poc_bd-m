const express = require("express");
const router = express.Router();
const clientController = require("../Controller/clientController");

router.route("/").get(clientController.getClients).post(clientController.createClient);

router.route("/all").get(clientController.getAllClients);

router
  .route("/:id")
  .patch(clientController.updateClient)
  .delete(clientController.deleteClient)
  .get(clientController.getClientById);

module.exports = router;
