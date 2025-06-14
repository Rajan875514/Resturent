











//====================================================================================original=======

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const cookieToken = require("../helpers/utils/cookieToken");
const {
    COOKIE_MAX_AGE,
    JWT_SECRET_KEY,
    JWT_EXPIRY,
    FORGOT_PASSWORD_EXPIRY,
    CLOUDINARY_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    LOCALHOST_ORIGIN,
} = require("../config/appConfig");
const { sendEmailToGmail } = require("../helpers/mailer/mailer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");
const crypto = require("crypto"); // Import the crypto module

// Directly configure Cloudinary here, ensuring the values are what we expect
console.log("Cloudinary Name from config:", CLOUDINARY_NAME);
console.log("Cloudinary API Key from config:", CLOUDINARY_API_KEY);
console.log("Cloudinary API Secret from config:", CLOUDINARY_API_SECRET);

cloudinary.config({
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

//===================================================================================================

async function userSignUp(req, res) {
    console.log("Signup request:", { body: req.body, files: req.files });

    cloudinary.config({
        cloud_name: CLOUDINARY_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
    });

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, error: "Name, email, and password are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(409).json({ success: false, error: "User already exists, try a different email" });
    }

    try {
        if (!req.files || !req.files.photo) {
            return res.status(400).json({ success: false, error: "Photo is required" });
        }

        const file = req.files.photo;
        console.log("Uploading photo to Cloudinary:", file.name);
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "FOA_users",
            width: 150,
            public_id: file.name,
        });
        console.log("Cloudinary upload result:", result);

        console.time("hashingPassword");
        const hashedPassword = await User.createHashedPassword(password);
        console.timeEnd("hashingPassword");

        const user = new User({
            name,
            email,
            password: hashedPassword,
            photo: { id: result.public_id, photoUrl: result.secure_url },
            role: req.body.role || "user",
        });

        console.time("savingUser");
        const savedUser = await user.save();
        console.timeEnd("savingUser");

        console.time("sendingEmail");
        try {
            const htmlFilePath = path.join(__dirname, "../helpers/mailer/welcome_mail.html");
            const signUpTemplate = fs.readFileSync(htmlFilePath, "utf-8");
            await sendEmailToGmail({ email: savedUser.email, subject: "Welcome to our food ordering app!!!", html: signUpTemplate });
            console.timeEnd("sendingEmail");
        } catch (emailError) {
            console.error("Error sending welcome email:", emailError);
            // Consider logging the error but not failing the signup
        }

        console.time("generatingToken");
        await cookieToken(savedUser, res, "User created successfully");
        console.timeEnd("generatingToken");

        return res.status(201).json({ success: true, message: "User created successfully", data: savedUser });

    } catch (error) {
        console.error("Signup error (outer catch):", error);
        return res.status(500).json({ success: false, error: `Failed to create user: ${error.message || error}` });
    }
}


//===============================================================================================

async function userLogin(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: "Email and password are required",
        });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return res.status(404).json({
            success: false,
            error: "User not found",
        });
    }

    const isPasswordCorrect = await user.verifyPassword(password);
    if (!isPasswordCorrect) {
        return res.status(400).json({
            success: false,
            error: "Invalid password",
        });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET_KEY, {
        expiresIn: JWT_EXPIRY,
    });

    const { password: _, ...userData } = user._doc;
    res
        .cookie("access_token", token, {
            maxAge: COOKIE_MAX_AGE,
            httpOnly: true,
            sameSite: "none",
            secure: true,
        })
        .status(200)
        .json({
            success: true,
            message: "Login successful",
            data: userData,
        });
}


//===================================================================================================

async function userLogout(req, res) {
    res
        .cookie("access_token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
            sameSite: "none",
            secure: true,
        })
        .status(200)
        .json({
            success: true,
            message: "Logged out successfully",
        });
}


//===============================================================================================

async function forgotPassword(req, res) {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            error: "Email is required",
        });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({
            success: false,
            error: "User not found",
        });
    }

    const forgotPasswordToken = await user.getForgotPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${LOCALHOST_ORIGIN}/password/reset/${forgotPasswordToken}`;
    const message = `Follow this link to reset your password:\n\n${resetUrl}`;

    try {
        await sendEmailToGmail({
            email: user.email,
            subject: "Password Reset Request",
            content: message,
        });

        res.status(200).json({
            success: true,
            message: "Password reset email sent successfully",
        });
    } catch (error) {
        console.error("Forgot password email error:", error);
        return res.status(500).json({ success: false, error: "Failed to send password reset email" });
    }
}


//=============================================================================================

async function resetPassword(req, res) {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
        return res.status(400).json({
            success: false,
            error: "Password and confirm password are required",
        });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            error: "Passwords do not match",
        });
    }

    const encryptedToken = crypto // Use the imported crypto module
        .createHash("sha256")
        .update(token)
        .digest("hex");
    const user = await User.findOne({
        forgotPasswordToken: encryptedToken,
        forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({
            success: false,
            error: "Invalid or expired token",
        });
    }

    user.password = await User.createHashedPassword(password);
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password reset successfully",
    });
}

//======================================================================================================

async function getLoggedInUserDetails(req, res) {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            error: "User not found",
        });
    }
    res.status(200).json({
        success: true,
        data: user,
    });
}

//===========================================================================================

async function updateLoggedInUserPassword(req, res) {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            error: "Old and new passwords are required",
        });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
        return res.status(404).json({
            success: false,
            error: "User not found",
        });
    }

    const isPasswordCorrect = await user.verifyPassword(oldPassword);
    if (!isPasswordCorrect) {
        return res.status(400).json({
            success: false,
            error: "Incorrect old password",
        });
    }

    user.password = await User.createHashedPassword(newPassword);
    await user.save();

    await cookieToken(user, res, "Password updated successfully");
}

//=================================================================================================



async function updateUser(req, res) {
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized",
        });
    }

    const userId = req.user.id;
    const newData = {
        name: req.body.name,
        email: req.body.email,
    };

    if (req.files && req.files.photo) {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found",
            });
        }

        if (user.photo.id) {
            await cloudinary.uploader.destroy(user.photo.id);
        }

        const result = await cloudinary.uploader.upload(req.files.photo.tempFilePath, {
            folder: "FOA_users",
            width: 150,
            crop: "scale",
        });

        newData.photo = {
            id: result.public_id,
            photoUrl: result.secure_url,
        };
    }

    const updatedUser = await User.findByIdAndUpdate(userId, newData, {
        new: true,
        runValidators: true,
    });

    if (!updatedUser) {
        return res.status(404).json({
            success: false,
            error: "User not found",
        });
    }

    res.status(200).json({
        success: true,
        data: updatedUser,
    });
}


//===============================================================================================

async function changeRole(req, res) {
    const { role } = req.body;
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized",
        });
    }

    if (!role) {
        return res.status(400).json({
            success: false,
            error: "Role is required",
        });
    }

    const validRoles = ["user", "admin", "deliveryman", "Customer", "Restaurant", "DeliveryMan"];
    if (!validRoles.includes(role)) {
        return res.status(400).json({
            success: false,
            error: "Invalid role",
        });
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { role },
        { new: true, runValidators: true }
    );

    if (!user) {
        return res.status(404).json({
            success: false,
            error: "User not found",
        });
    }

    res.status(200).json({
        success: true,
        message: "Role updated successfully",
        data: user,
    });
}


//================================================================================================

module.exports = {
    userSignUp,
    userLogin,
    userLogout,
    forgotPassword,
    resetPassword,
    getLoggedInUserDetails,
    updateLoggedInUserPassword,
    updateUser,
    changeRole,
};
