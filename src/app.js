const express = require("express");
const cors = require("cors");
const mainRouter = require("./routes/index.js");
const logger = require("./middlewares/logger.js");

const app = express();

app.use(cors());
app.use(logger);

app.use("/", mainRouter);

module.exports = app; 