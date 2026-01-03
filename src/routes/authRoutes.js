const router = require("express").Router();
const authController = require("../controllers/authController");
const AuthCheck = require("../middlewares/AuthCheck");

router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected
router.get("/dashboard", AuthCheck, authController.dashboard);
router.post("/logout", AuthCheck, authController.logout);

module.exports = router;
