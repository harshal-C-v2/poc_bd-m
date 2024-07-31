const express = require("express");
const app = express();
const cors = require("cors");
app.use(express.json());
require("./server");
const tempPort = 3500;
require("dotenv").config();
const PORT = process.env.PORT;

// Routers
const userRouter = require("./Router/userRouter");
const authRouter = require("./Router/authRouter");
const clientRouter = require("./Router/clientRoute");
const vendorRouter = require("./Router/vendorRouter");
const dbReportRouter = require("./Router/dBReportRouter");
const inventoryRouter = require("./Router/inventoryRouter");
const contactRouter = require("./Router/contactRouter");
const tpiaRouter = require("./Router/tpiaRouter");
const noteRoute = require("./Router/noteRoute");
const jobRouter = require("./Router/jobRouter");
const reportRouter = require("./Router/reportsRouter");
// const errorHandler = require('./controller/apiError');
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api.magirsha.com/v1/users", userRouter);
app.use("/api.magirsha.com/v1/auth", authRouter);
app.use("/api.magirsha.com/v1/clients", clientRouter);
app.use("/api.magirsha.com/v1/contact", contactRouter);
app.use("/api.magirsha.com/v1/vendors", vendorRouter);
app.use("/api.magirsha.com/v1/inventory", inventoryRouter);
app.use("/api.magirsha.com/v1/tpia", tpiaRouter);
app.use("/api.magirsha.com/v1/jobs", jobRouter);
app.use("/api.magirsha.com/v1/note", noteRoute);
app.use("/api.magirsha.com/v1/reports", reportRouter);
app.use("/api.magirsha.com/v1/", dbReportRouter);

// app.use(errorHandler);
app.all("*", (req, res, next) => {
  res.status(404).json({ status: "error", message: "this path does not exists" });
});

app.listen(tempPort, (err, data) => {
  console.log("Apps running on port " + tempPort);
});
