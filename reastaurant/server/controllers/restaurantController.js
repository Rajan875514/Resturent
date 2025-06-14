






const Restaurant = require("../models/Restaurant");
const Food = require("../models/Food");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary");
const { getCoordinates } = require("../helpers/utils/getCoordinates");

const {
    CLOUDINARY_NAME,
    CLOUDINARY_API,
    CLOUDINARY_API_SECRET,
} = require("../config/appConfig");

cloudinary.v2.config({
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_API,
    api_secret: CLOUDINARY_API_SECRET,
});

async function createRestaurant(req, res) {
    try {
        // Check if a restaurant already exists for the user
        const existingUserRestaurant = await Restaurant.findOne({ user_id: req.user._id });
        if (existingUserRestaurant) {
            return res.status(400).json({
                success: false,
                error: "Restaurant already exists for current user",
            });
        }

        // Destructure request body
        const {
            address,
            restaurantName,
            phoneNumber,
            cuisines,
            quickDescription,
            detailedDescription,
            openingHours,
            closingHours,
            deliveryCharges,
            email, // Add email if needed
            promotions, // Add promotions if needed
        } = req.body;

        // Validate required fields
        if (
            !address ||
            !restaurantName ||
            !phoneNumber ||
            !cuisines ||
            !quickDescription ||
            !detailedDescription ||
            !openingHours ||
            !closingHours ||
            !deliveryCharges
        ) {
            return res.status(400).json({
                success: false,
                error: "Please provide all required details",
            });
        }

        // Validate length constraints
        if (quickDescription.length > 30) {
            return res.status(400).json({
                success: false,
                error: "Quick description must be at most 30 characters long",
            });
        }

        if (detailedDescription.length < 100) {
            return res.status(400).json({
                success: false,
                error: "Detailed description must be at least 100 characters long",
            });
        }

        // Check if a photo is uploaded
        if (!req.files || !req.files.photo) {
            return res.status(400).json({
                success: false,
                error: "Photo is required",
            });
        }


//================================================================================================

        // // Upload photo to Cloudinary
        // const file = req.files.photo;
        // let photoId, photoUrl;
        // try {
        //     const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        //         folder: "FOA_Restaurants",
        //         width: 150,
        //         public_id: file.name,
        //     });
        //     photoId = result.public_id;
        //     photoUrl = result.secure_url;
        // } catch (cloudinaryError) {
        //     console.error("Cloudinary upload error:", cloudinaryError);
        //     return res.status(500).json({
        //         success: false,
        //         error: "Failed to upload photo to Cloudinary",
        //         details: cloudinaryError.message,
        //     });
        // }



        // Get coordinates
       
         const file = req.files.photo;
        let photoId, photoUrl;
        try {
            const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
                folder: "FOA_Restaurants",
                // width: 150, // <-- इस लाइन को हटा दें ताकि इमेज कंप्रेस न हो
                public_id: file.name,
                quality: 'auto:best',    // <-- यह ऑटोमैटिकली सबसे अच्छी क्वालिटी चुनेगा
                fetch_format: 'auto'     // <-- यह ब्राउज़र के लिए सबसे अच्छा फॉर्मेट चुनेगा
            });
            photoId = result.public_id;
            photoUrl = result.secure_url;
        } catch (cloudinaryError) {
            console.error("Cloudinary upload error:", cloudinaryError);
            return res.status(500).json({
                success: false,
                error: "Failed to upload photo to Cloudinary",
                details: cloudinaryError.message,
            });
        }
//==================================================================================================       
        let coordinates;
        try {
            coordinates = await getCoordinates(address); // Pass address if required
            if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
                throw new Error("Invalid coordinates");
            }
        } catch (coordError) {
            console.error("Geolocation error:", coordError);
            return res.status(500).json({
                success: false,
                error: "Failed to fetch coordinates",
                details: coordError.message,
            });
        }

        // Split cuisines into an array
        const cuisinesList = cuisines.split(",").map((cuisine) => cuisine.trim());

        // Create new restaurant
        const newRes = new Restaurant({
            user_id: req.user._id,
            restaurantName,
            phoneNumber,
            address,
            cuisines: cuisinesList,
            quickDescription,
            detailedDescription,
            openingHours,
            closingHours,
            deliveryCharges,
            email, // Include if schema supports
            promotions, // Include if schema supports
            location: {
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
            },
            photo: {
                id: photoId,
                photoUrl: photoUrl,
            },
        });

        // Save to database
        try {
            const savedRestaurant = await newRes.save();
            return res.status(201).json({
                success: true,
                message: "New Restaurant Created",
                data: savedRestaurant,
            });
        } catch (dbError) {
            console.error("Error saving restaurant:", dbError);
            if (dbError.code === 11000 && dbError.keyPattern && dbError.keyPattern.restaurantName) {
                return res.status(400).json({
                    success: false,
                    error: "Restaurant name already exists",
                });
            }
            return res.status(500).json({
                success: false,
                error: "Failed to save restaurant to database",
                details: dbError.message,
            });
        }
    } catch (error) {
        console.error("Error in createRestaurant:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
            details: error.message,
        });
    }
}

async function deleteRestaurant(req, res) {
    try {
        const deletedRestaurant = await Restaurant.findByIdAndDelete(req.params.id);
        if (!deletedRestaurant) {
            return res
                .status(404)
                .json({ success: false, error: "Restaurant not found" });
        }
        res.status(200).json({
            success: true,
            message: "Restaurant Deleted Successfully",
        });
    } catch (error) {
        console.error("Error deleting restaurant:", error);
        return res.status(500).json({ success: false, error: "Internal server error", details: error.message });
    }
}

async function getAllRestaurants(req, res) {
    try {
        const restaurants = await Restaurant.find({});
        if (!restaurants || restaurants.length === 0) {
            return res
                .status(404)
                .json({ success: false, error: "No Restaurants found" });
        }
        res.status(200).json({ success: true, data: restaurants });
    } catch (error) {
        console.error("Error fetching all restaurants:", error);
        return res.status(500).json({ success: false, error: "Internal server error", details: error.message });
    }
}

async function getRestaurantById(req, res) {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res
                .status(404)
                .json({ success: false, error: "Restaurant not found" });
        }
        res.status(200).json({ success: true, data: restaurant });
    } catch (error) {
        console.error("Error fetching restaurant by ID:", error);
        return res.status(500).json({ success: false, error: "Internal server error", details: error.message });
    }
}

async function updateRestaurantDetails(req, res) {
    try {
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true } // Enable validation during update
        );
        if (!updatedRestaurant) {
            return res
                .status(404)
                .json({ success: false, error: "Restaurant not found" });
        }
        res.status(202).json({
            success: true,
            data: updatedRestaurant,
            message: "Restaurant Update Successfully",
        });
    } catch (error) {
        console.error("Error updating restaurant details:", error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(el => el.message);
            return res.status(400).json({ success: false, error: "Validation error", details: errors });
        }
        return res.status(500).json({ success: false, error: "Internal server error", details: error.message });
    }
}

async function addMenuItem(req, res) {
    try {
        const currRes = await Restaurant.findOne({ user_id: req.user._id });
        if (!currRes) {
            return res
                .status(404)
                .json({ success: false, error: "Restaurant Not found" });
        }

        const { name, price, type } = req.body;
        if (!name || !price || !type) {
            return res
                .status(400)
                .json({ success: false, error: "Please enter necessary details" });
        }
        if (req.files && req.files.photo) {
            const foodImg = req.files.photo;
            const result = await cloudinary.v2.uploader.upload(
                foodImg.tempFilePath,
                {
                    folder: "FOA_Food_Items",
                    width: 150,
                    public_id: foodImg.name,
                }
            );
            const newItem = new Food({
                name,
                price,
                foodImg: {
                    id: result.public_id,
                    url: result.secure_url,
                },
                type,
                restaurant: {
                    resId: currRes._id,
                    resName: currRes.restaurantName,
                },
            });
            const response = await newItem.save();
            await Restaurant.findByIdAndUpdate(currRes._id, {
                $push: { menu: response._id },
            });
            res.status(200).json({
                success: true,
                message: "New Menu Item Created",
                newItem: response,
            });
        } else {
            return res
                .status(400)
                .json({ success: false, error: "Provide the food image" });
        }
    } catch (error) {
        console.error("Error adding menu item:", error);
        return res.status(500).json({ success: false, error: "Internal server error", details: error.message });
    }
}

async function updateMenuItem(req, res) {
    try {
        const foodId = req.params.id;
        if (!foodId) {
            return res
                .status(400)
                .json({ success: false, error: "Provide the food id" });
        }
        const food = await Food.findById(foodId);
        if (!food) {
            return res
                .status(404)
                .json({ success: false, error: "Food Item not found" });
        }
        const currUserId = req.user._id;
        if (!currUserId) {
            return res
                .status(404)
                .json({ success: false, error: "User not found" });
        }
        const currRes = await Restaurant.findOne({ user_id: currUserId });
        if (!currRes) {
            return res
                .status(404)
                .json({ success: false, error: "Restaurant not Found" });
        }

        const { name, price, type } = req.body;
        if (!name || !price || !type) {
            return res.status(400).json({
                success: false,
                error: "Please provide necessary details",
            });
        }
        const newFood = {
            name,
            price,
            type,
        };
        if (req.files && req.files.photo) {
            const foodImgId = food.foodImg.id;
            if (foodImgId) {
                await cloudinary.v2.uploader.destroy(foodImgId);
            }
            const result = await cloudinary.v2.uploader.upload(
                req.files.photo.tempFilePath,
                {
                    folder: "FOA_Food_Items",
                    width: 150,
                    crop: "scale",
                }
            );

            newFood.foodImg = {
                id: result.public_id,
                url: result.secure_url,
            };
        }

        const updatedMenuItem = await Food.findByIdAndUpdate(
            req.params.id,
            {
                $set: newFood,
            },
            { new: true, runValidators: true } // Enable validation during update
        );
        if (!updatedMenuItem) {
            return res
                .status(404)
                .json({ success: false, error: "Menu item not found" });
        }
        res.status(202).json({
            success: true,
            message: "Menu Item Updated",
            data: updatedMenuItem,
        });
    } catch (error) {
        console.error("Error updating menu item:", error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(el => el.message);
            return res.status(400).json({ success: false, error: "Validation error", details: errors });
        }
        return res.status(500).json({ success: false, error: "Internal server error", details: error.message });
    }
}

async function deleteMenuItem(req, res) {
    try {
        const orderId = req.params.id;
        const deletedRestaurant = await Restaurant.findOneAndUpdate(
            { user_id: req.user._id },
            { $pull: { menu: orderId } },
            { new: true }
        );
        if (!deletedRestaurant) {
            return res
                .status(404)
                .json({ success: false, error: "Restaurant Not Found" });
        }
        const deletedOrder = await Food.findByIdAndDelete(req.params.id);
        if (!deletedOrder) {
            return res
                .status(404)
                .json({ success: false, error: "Order Not Found" });
        }
        res.status(200).json({ success: true, message: "Menu Item Removed" });
    } catch (error) {
        console.error("Error deleting menu item:", error);
        return res.status(500).json({ success: false, error: "Internal server error", details: error.message });
    }
}

const fetchmenuItems = async (req, res) => {
    try {
        const restaurantId = req.params.id;
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        // Fetch menu items using the object IDs stored in the menuItems array
        const menuItems = await Food.find({ _id: { $in: restaurant.menu } });

        res.status(200).json({
            success: true,
            message: "Menu Item Fetched successfully",
            data: menuItems,
        });
    } catch (error) {
        console.error("Error fetching menu items:", error);
        return res.status(500).json({ success: false, error: "Internal server error", details: error.message });
    }
};

module.exports = {
    createRestaurant,
    getAllRestaurants,
    getRestaurantById,
    updateRestaurantDetails,
    deleteRestaurant,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    fetchmenuItems,
};