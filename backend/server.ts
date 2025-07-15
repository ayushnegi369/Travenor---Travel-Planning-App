import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB, connectGoogleDB } from "./config/db";
import passport from "passport";
import session from "express-session";
import GoogleStrategy from "passport-google-oauth20";
import Destination from "./models/Destination";
import User from "./models/User";
import GoogleUser from "./models/GoogleUser";
import { Profiler } from "react";
import { OAuth2Client } from "google-auth-library";
import nodemailer from "nodemailer";
// import otpStore from "./config/otpStore";

// =========================
// Import required modules and types for server, authentication, database, and mailing
// =========================

// Load env variables
dotenv.config();

// Init Express app
const app: Application = express();

// =========================
// Middleware setup: CORS for cross-origin requests, JSON parsing, HTTP request logging, session management
// =========================
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(
    session({
        secret: "secret",
        resave: "false",
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_WEB_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/callback",
        },
        (accessToken, refreshToken, profile, done) => {
            return done(null, profile);
        }
    )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Connect to MongoDB
connectDB();
// connectGoogleDB();

const JWT_SECRET = process.env.JWT_SECRET;

const googleClient = new OAuth2Client(
    "1058734721826-mrihdegerqmcqf4l7uirls2ui879u4pu.apps.googleusercontent.com"
);

// =========================
// Basic route for testing server and Google OAuth flow
// =========================
app.get("/", (req: Request, res: Response) => {
    res.send("<a href='/auth/google'>Click Me</a>");
});

// =========================
// Route: Fetch all destinations from the database
// =========================
app.get("/fetch-destinations", async (req, res) => {
    try {
        const destinations = await Destination.find();
        res.status(200).json(destinations);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch destinations" });
    }
});

// =========================
// Route: Check if a user already exists by email
// =========================
app.post("/check-user-exist", async (req, res) => {
    const { email } = req.body;

    try {
        // 🔍 Check if user already exists by email
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(200).json({ message: "User already exists" });
        }

        return res
            .status(200)
            .json({ message: "User is new, proceed with signup" });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// =========================
// Route: User signup (register new user)
// - Checks for existing user
// - Hashes password
// - Creates user and JWT token
// =========================
app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    // Validate request
    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Username, email, and password are required.",
        });
    }

    try {
        // Check if user already exists in either User or GoogleUser
        const existingUser = await User.findOne({ email });
        const existingGoogleUser = await GoogleUser.findOne({ email });

        if (existingUser || existingGoogleUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        // Create JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET, // Preferably from process.env.JWT_SECRET
            { expiresIn: "1d" }
        );

        // Respond with token and user info
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
            token,
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// =========================
// Route: User signin (login with email and password)
// - Validates credentials
// - Issues JWT token on success
// =========================
app.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Create token (optional)
        if (!user._id || !user.username || !user.email) {
            return res.status(500).json({ message: "User data incomplete" });
        }
        const token = jwt.sign({ userId: user._id }, "secret_key", {
            expiresIn: "1d",
        });
        res.status(200).json({
            message: "Signin successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
            token,
        });
    } catch (err) {
        console.error("Signin error:", err);
        const error = err as Error;
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// =========================
// Route: Google sign-in (register or login Google users)
// - Handles both new and existing Google users
// - Issues JWT token
// =========================
app.post("/google/signin", async (req, res) => {
    const { username, email } = req.body;
    try {
        // check if user exists
        const existingGoogleUser = await GoogleUser.findOne({ email });
        const existingUser = await User.findOne({ email });

        if (existingGoogleUser || existingUser) {
            const user = existingGoogleUser || existingUser;
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const token = jwt.sign(
                {
                    userId: user._id,
                    email: user.email,
                },
                "secret_key",
                { expiresIn: "1d" }
            );
            return res
                .status(200)
                .json({ message: "User already exists", user, token });
        }

        // save user
        const user = await GoogleUser.create({
            username,
            email,
        });

        // create JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
            token,
        });
    } catch (error) {
        res.status(500).json({ error });
    }
});

// =========================
// Email transporter setup using nodemailer for sending OTPs and notifications
// =========================
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// =========================
// Helper function: Generate a 6-digit OTP as a string
// =========================
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const otpStore = new Map();

// =========================
// Route: Send OTP to user's email for verification
// - Generates OTP
// - Stores OTP with expiry
// - Sends OTP via email
// =========================
app.post("/send-otp", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes from now

    // Store in memory
    otpStore.set(email, { otp, expiresAt });
    console.log("OTP is : ", otpStore.get(email));

    try {
        await transporter.sendMail({
            from: `${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is ${otp}. It expires in 5 minutes.`,
        });
        console.log("OTP: ", otp, "Expires At: ", expiresAt);
        res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
        console.error("Error sending OTP:", err);
        res.status(500).json({ message: "Failed to send OTP" });
    }
});

// =========================
// Route: Verify OTP for email verification
// - Checks OTP validity and expiry
// - Deletes OTP after successful verification
// =========================
app.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    const stored = otpStore.get(email);

    if (!stored) return res.status(400).json({ message: "No OTP found" });
    if (Date.now() > stored.expiresAt)
        return res.status(400).json({ message: "OTP expired" });

    if (stored.otp === otp) {
        otpStore.delete(email);
        return res.status(200).json({ message: "OTP verified" });
    } else {
        return res.status(400).json({ message: "Invalid OTP" });
    }
});

const forgotOtpStore = new Map();

// =========================
// Route: Forgot password - send OTP to user's email if user exists
// - Used for password reset flow
// =========================
app.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        const otp = generateOtp();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes from now
        forgotOtpStore.set(email, { otp, expiresAt });
        try {
            await transporter.sendMail({
                from: `${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Your OTP Code",
                text: `Your OTP is ${otp}. It expires in 5 minutes.`,
            });
            console.log("OTP: ", otp, "Expires At: ", expiresAt);
            res.status(200).json({ message: "OTP sent successfully" });
        } catch (err) {
            console.error("Error sending OTP:", err);
            res.status(500).json({ message: "Failed to send OTP" });
        }
    } else {
        res.status(400).json({ message: "User not found" });
    }
});

app.post("/forgot-password-otp-confirm", (req, res) => {
    const { email, otp } = req.body;
    const stored = forgotOtpStore.get(email);

    if (!stored) return res.status(400).json({ message: "No OTP found" });
    if (Date.now() > stored.expiresAt)
        return res.status(400).json({ message: "OTP expired" });

    if (stored.otp === otp) {
        forgotOtpStore.delete(email); // Clean up after success
        return res.status(200).json({ message: "OTP verified" });
    } else {
        return res.status(400).json({ message: "Invalid OTP" });
    }
});

app.post("/update-user-password", async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res
            .status(400)
            .json({ message: "Email and new password are required." });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // 🔐 Hash the new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully." });
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// =========================
// Route: Fetch destination details by title (case-insensitive)
// =========================
app.get("/destination/:id", async (req, res) => {
    try {
        const destination = await Destination.findOne({
            title: { $regex: `^${req.params.id}$`, $options: "i" },
        });
        if (!destination) {
            return res.status(404).json({ error: "Destination not found" });
        }
        res.status(200).json(destination);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch destination details" });
    }
});

// =========================
// Route: Fetch destination details by MongoDB _id
// =========================
app.get("/destination/by-id/:id", async (req, res) => {
    try {
        const destination = await Destination.findById(req.params.id);
        if (!destination) {
            return res.status(404).json({ error: "Destination not found" });
        }
        res.status(200).json(destination);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch destination details" });
    }
});

// =========================
// Route: Add a place to user's favoritePlaces (for both User and GoogleUser)
// - Adds a destination title to user's favorites
// =========================
app.post("/user/favorite", async (req, res) => {
    const { email, title } = req.body;
    if (!email || !title)
        return res.status(400).json({ error: "Email and title are required" });
    let user =
        (await User.findOne({ email })) ||
        (await GoogleUser.findOne({ email }));
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.favoritePlaces.includes(title)) {
        user.favoritePlaces.push(title);
        await user.save();
    }
    res.json({ favoritePlaces: user.favoritePlaces });
});

// =========================
// Route: Get a user's favorite places (for both User and GoogleUser)
// - Returns list of favorite destination titles
// =========================
app.get("/user/favorites", async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }
    let user =
        (await User.findOne({ email })) ||
        (await GoogleUser.findOne({ email }));
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ favoritePlaces: user.favoritePlaces });
});

// =========================
// Route: Remove a place from user's favoritePlaces (for both User and GoogleUser)
// - Removes a destination title from user's favorites
// =========================
app.delete("/user/favorite", async (req, res) => {
    const { email, title } = req.body;
    if (!email || !title)
        return res.status(400).json({ error: "Email and title are required" });
    let user =
        (await User.findOne({ email })) ||
        (await GoogleUser.findOne({ email }));
    if (!user) return res.status(404).json({ error: "User not found" });
    user.favoritePlaces = user.favoritePlaces.filter((t) => t !== title);
    await user.save();
    res.json({ favoritePlaces: user.favoritePlaces });
});

// =========================
// Route: Fetch multiple destinations by an array of titles (case-insensitive)
// - Used to get details for multiple destinations at once
// =========================
app.post("/destinations/by-titles", async (req, res) => {
    const { titles } = req.body;
    if (!Array.isArray(titles) || titles.length === 0) {
        return res.status(400).json({ error: "Titles array required" });
    }
    try {
        // Case-insensitive match for each title
        const regexTitles = titles.map((t) => new RegExp(`^${t}$`, "i"));
        const destinations = await Destination.find({
            title: { $in: regexTitles },
        });
        res.json(destinations);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch destinations" });
    }
});

// =========================
// Route: Book a destination for a user (User or GoogleUser)
// - Adds a booking to user's bookedPlaces
// - Prevents duplicate bookings for same destination and date
// =========================
app.post("/user/book", async (req, res) => {
    console.log("Booking request body:", req.body); // Debug log
    const { email, destinationId, title, coordinates, date, paymentId } =
        req.body;
    if (!email || !destinationId || !title || !coordinates || !date) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    let user =
        (await User.findOne({ email })) ||
        (await GoogleUser.findOne({ email }));
    if (!user) return res.status(404).json({ error: "User not found" });
    // Prevent duplicate booking for same destination and date
    const alreadyBooked = user.bookedPlaces.some(
        (b) => b.destinationId.toString() === destinationId && b.date === date
    );
    if (!alreadyBooked) {
        user.bookedPlaces.push({
            destinationId,
            title,
            coordinates,
            date,
            paymentId,
        });
        await user.save();
    }
    res.json({ bookedPlaces: user.bookedPlaces });
});

// =========================
// Route: Get all booked places for a user, enriched with destination details
// - Returns user's bookings with additional destination info
// =========================
app.get("/user/booked", async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });
    let user =
        (await User.findOne({ email })) ||
        (await GoogleUser.findOne({ email }));
    if (!user) return res.status(404).json({ error: "User not found" });

    // Enrich each bookedPlace with destination details
    const bookedPlaces = await Promise.all(
        user.bookedPlaces.map(async (booking) => {
            const destination = await Destination.findById(
                booking.destinationId
            );
            if (!destination) return booking; // fallback to booking data if not found
            return {
                ...booking._doc, // all booking fields (date, paymentId, etc.)
                ...destination._doc, // all destination fields (image, price, rooms, bathrooms, etc.)
                bookingDate: booking.date, // keep original booking date
                paymentId: booking.paymentId,
            };
        })
    );

    res.json({ bookedPlaces });
});

// =========================
// Route: Get user profile by email (User or GoogleUser)
// - Returns user profile data
// =========================
app.get("/user/profile", async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });
    let user =
        (await User.findOne({ email })) ||
        (await GoogleUser.findOne({ email }));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
});

// =========================
// Route: Update user profile fields (User or GoogleUser)
// - Updates profile fields like name, location, mobile, image
// =========================
app.post("/user/profile", async (req, res) => {
    const { email, firstName, lastName, location, mobileNumber, profileImage } =
        req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });
    let user =
        (await User.findOne({ email })) ||
        (await GoogleUser.findOne({ email }));
    if (!user) return res.status(404).json({ error: "User not found" });

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (location !== undefined) user.location = location;
    if (mobileNumber !== undefined) user.mobileNumber = mobileNumber;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();
    res.json({ user });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
});
