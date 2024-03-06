const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const user = require("./routes/userRoute");
const project = require("./routes/projectRoute");

app.use("/api/v1", user);
app.use("/api/v1", project);

module.exports = app;
