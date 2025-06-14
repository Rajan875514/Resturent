require("dotenv").config(); // Must be first

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const cloudinary = require("cloudinary").v2;

const {
  DB_CONNECTION_STRING,
  PORT = 5000,
  LOCALHOST_ORIGIN,
  CLOUDINARY_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  STRIPE_TEST_SECRET_KEY,
} = require("./config/appConfig");

// Routes
const authRoutes = require("./routes/Auths");
const restaurantsRoutes = require("./routes/Restaurants");
const deliveryManRoutes = require("./routes/DeliveryMen");
const customerRoutes = require("./routes/Customers");
const orderRoutes = require("./routes/Orders");

// Initialize Express app
const app = express();
const server = require("http").createServer(app);

// Socket.IO setup with CORS allowed for frontend ports
const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Connect to MongoDB
mongoose
  .connect(DB_CONNECTION_STRING, { useUnifiedTopology: true })
  .then(() => console.log("Connected to Database"))
  .catch((err) => console.error("Error connecting to database:", err.message));

// Cloudinary config
cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.set("trust proxy", true);

// EJS Setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/restaurants", restaurantsRoutes);
app.use("/api/v1/deliveryman", deliveryManRoutes);
app.use("/api/v1/customer", customerRoutes);
app.use("/api/v1/order", orderRoutes);

// Test EJS Routes
app.get("/resboard", (req, res) => res.render("resupdate"));
app.get("/cusboard", (req, res) => res.render("cusview"));
app.get("/api/auth/signup", (req, res) => res.render("signupForm"));
app.get("/test", (req, res) => res.render("test"));

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Example: listen for custom events if needed
  socket.on("some-event", (data) => {
    console.log("Received some-event:", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running at port: ${PORT}`);
});

module.exports = { io, app, server, express, cloudinary };
