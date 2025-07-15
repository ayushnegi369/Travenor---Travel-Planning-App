import mongoose from "mongoose";

const GoogleUserSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            trim: true,
            default: "",
        },

        lastName: {
            type: String,
            trim: true,
            default: "",
        },

        username: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        password: {
            type: String,
            // required: true,
            // minlength: 6,
        },

        location: {
            type: String,
            required: false,
        },

        mobileNumber: {
            type: String,
            required: false,
        },

        profileImage: {
            type: String,
            default: "",
        },

        favoritePlaces: {
            type: [String],
            default: [],
        },

        bookedPlaces: [
            {
                destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
                title: String,
                coordinates: {
                    latitude: Number,
                    longitude: Number,
                },
                date: String, // ISO date string
                paymentId: String, // Razorpay payment id
            }
        ],
    },
    { timestamps: true }
);

export default mongoose.model("GoogleUser", GoogleUserSchema);
