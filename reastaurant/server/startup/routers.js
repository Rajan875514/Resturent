const express = require("express");
const app = express();
const restaurantsRoutes = require("../routes/Restaurants");
const authRoutes = require("../routes/Auths");
const deliveryManRoutes = require("../routes/DeliveryMen");
const customerRoutes    = require("../routes/Customers");
const orderRoutes = require("../routes/Orders");

module.exports = function (req, res, next) {
      return () => {
            app.use('/api/restaurants', restaurantsRoutes);
            app.use('/api/auth', authRoutes);
            app.use('/api/deliveryman', deliveryManRoutes);
            app.use('/api/customer', customerRoutes);
            app.use('/api/order', orderRoutes);
      }
}





// const express = require("express");
// const router = express.Router();
// const fileUpload = require("express-fileupload");
// const {
//   userSignUp,
//   userLogin,
//   userLogout,
//   forgotPassword,
//   resetPassword,
//   getLoggedInUserDetails,
//   updateLoggedInUserPassword,
//   updateUser,
//   changeRole,
// } = require("../controllers/AuthController");
// const { createCustomer } = require("../controllers/CustomerController");
// const { createDeliveryMan } = require("../controllers/DeliveryManController");

// router.use(
//   fileUpload({
//     useTempFiles: true,
//     tempFileDir: "/tmp/",
//   })
// );

// router.post("/auth/signup", userSignUp);
// router.post("/auth/login", userLogin);
// router.get("/auth/logout", userLogout);
// router.post("/auth/forgotpassword", forgotPassword);
// router.post("/auth/password/reset/:token", resetPassword);
// router.get("/auth/user/details", getLoggedInUserDetails);
// router.post("/auth/password/update", updateLoggedInUserPassword);
// router.post("/auth/user/update", updateUser);
// router.post("/auth/user/role", changeRole);
// router.post("/customer/create", createCustomer);
// router.post("/deliveryman/create", createDeliveryMan);

// module.exports = router;