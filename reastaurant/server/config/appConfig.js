// server/config/appConfig.js

// appConfig.js does NOT need require("dotenv").config(); if it's already in server.js
// module.exports = { ... } will automatically get values from process.env
// because server.js loads dotenv first.

const config = {
    // MongoDB
    DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING,

    // Server
    PORT: process.env.PORT || 5000,
    LOCALHOST_ORIGIN: process.env.LOCALHOST_ORIGIN,

    // Cloudinary
    CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

    // JWT
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    JWT_EXPIRY: process.env.JWT_EXPIRY,
    TOKEN_EXPIRY: process.env.TOKEN_EXPIRY,

    // OTP and Email
    FORGOT_PASSWORD_EXPIRY: process.env.FORGOT_PASSWORD_EXPIRY,
    OTP_EXPIRY: process.env.OTP_EXPIRY,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    GMAIL_EMAIL_ID: process.env.GMAIL_EMAIL_ID,
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
    MAILING_EMAIL_ID: process.env.MAILING_EMAIL_ID,

    // IP Info
    IP_INFO_URL: process.env.IP_INFO_URL,
    IPINFO_API_TOKEN: process.env.IPINFO_API_TOKEN,

    // Cookie
    COOKIE_MAX_AGE: process.env.COOKIE_MAX_AGE,

    // Stripe
    // This is the SECRET key for backend operations
    STRIPE_TEST_SECRET_KEY: process.env.STRIPE_TEST_SECRET_KEY, // <--- Correctly reads from .env
    // These are typically for redirects after payment
    PAYMENT_SUCCESS_URL: process.env.PAYMENT_SUCCESS_URL,
    PAYMENT_FAIL_URL: process.env.PAYMENT_FAIL_URL,

    // Frontend publishable key (if you need it on backend appConfig for some reason)
    STRIPE_TEST_PUBLISHABLE_KEY: process.env.VITE_STRIPE_PUBLISHABLE_KEY, // <--- Reads publishable key from .env
};

// Debugging: Log the secret key value when appConfig is loaded
console.log("DEBUG (appConfig.js): STRIPE_TEST_SECRET_KEY when loaded:", config.STRIPE_TEST_SECRET_KEY ? "Loaded (starts with " + config.STRIPE_TEST_SECRET_KEY.substring(0, 7) + "...)" : "UNDEFINED or EMPTY!");

module.exports = config;