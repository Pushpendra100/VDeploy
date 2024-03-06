const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  getUserDetails,
  getUserProjects,
} = require("../controllers/userController");
const { isAuthenticated } = require("../middleware/auth");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/user").get(isAuthenticated, getUserDetails);
router.route("/projects").get(isAuthenticated, getUserProjects);

module.exports = router;
