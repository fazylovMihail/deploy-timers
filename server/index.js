require("dotenv").config(); // dotenv import

// imports
const express = require("express");
const cookieParser = require("cookie-parser");
const validateSession = require("./modules/middlewares/validateSession");
const authRoute = require("./modules/routes/auth");
const timersRoute = require("./modules/routes/timers");
const path = require("path");

const STATIC_DIR = path.join(__dirname, "public");
const VIEWS_DIR = path.join(STATIC_DIR, "views");

const app = express(); // root

// middlewaresa
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(validateSession);

// routes
app.use("/auth", authRoute);
app.use("/timers", timersRoute);

// launch server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`   Server listen on http://localhost:${PORT}`);
});
