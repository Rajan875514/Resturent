const express = require("express");
const AuthController = require("../controllers/AuthController.js");
const router = express.Router();
const asyncErrorHandler = require("../middlewares/asyncErrorHandler");
const isLoggedIn = require("../middlewares/isLoggedIn");


router.post("/signup", asyncErrorHandler(AuthController.userSignUp));

router.post("/login", asyncErrorHandler(AuthController.userLogin));

router.post("/logout", asyncErrorHandler(AuthController.userLogout));

router.post("/forgotpassword", asyncErrorHandler(AuthController.forgotPassword));

router.put("/password/reset/:token", asyncErrorHandler(AuthController.resetPassword));

router.get("/user", isLoggedIn, asyncErrorHandler(AuthController.getLoggedInUserDetails));
// router.get("/user/details", isLoggedIn, asyncErrorHandler(AuthController.getLoggedInUserDetails));

router.put("/password/update", isLoggedIn, asyncErrorHandler(AuthController.updateLoggedInUserPassword));

router.put('/user/update', isLoggedIn, asyncErrorHandler(AuthController.updateUser));

router.put('/user/role', isLoggedIn, asyncErrorHandler(AuthController.changeRole));

module.exports = router;




