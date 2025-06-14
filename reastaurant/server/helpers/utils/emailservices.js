const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { sendEmail } = require("../utils/emailService"); // Adjust path

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

const userSignUp = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        console.log("Signup request:", { email, name });
        if (!email || !password || !name) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Create user in MongoDB
        const user = new User({ email, password, name }); // Add password hashing in production
        await user.save();

        // Load welcome email template
        const templatePath = path.join(__dirname, "../templates/welcomeEmail.html");
        const htmlContent = fs.readFileSync(templatePath, "utf8");

        // Send welcome email
        await sendEmail({
            email,
            subject: "Welcome to ChewChew",
            html: htmlContent
        }, "gmail");

        res.status(201).json({ message: "User created successfully", user: { email, name } });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { userSignUp };