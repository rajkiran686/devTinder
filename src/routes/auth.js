const express = require('express')
const {validateSignUpData} = require("../utils/validation")
const User = require("../models/user")
const bcrypt = require("bcrypt")
const { CLIENT_ORIGINS, COOKIE_NAME, isProduction } = require("../config/env");

const authRouter = express.Router();
const COOKIE_MAX_AGE_MS = 60 * 60 * 1000;
const usesCrossOriginClient = isProduction && CLIENT_ORIGINS.length > 0;

const authCookieOptions = {
    httpOnly: true,
    sameSite: usesCrossOriginClient ? "none" : "lax",
    secure: isProduction,
    maxAge: COOKIE_MAX_AGE_MS,
};

authRouter.post("/signUp", async (req, res) => {
    try {
        //Validate the data
        validateSignUpData(req);

        //Encrypt the password
        const passwordHash = await bcrypt.hash(req.body.password, 10);

        //store the user in database
        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: passwordHash,
            age: req.body.age,
            gender: req.body.gender,
            photoUrl: req.body.photoUrl,
            photos: req.body.photos,
            about: req.body.about,
            prompts: req.body.prompts,
            skills: req.body.skills,
            visibilityMode: req.body.visibilityMode,
            showVerificationBadge: req.body.showVerificationBadge,
        });
        //Creating the new instance/user of the user Model
        await user.save();
        res.status(201).json({ message: "User created successfully", data: user.toSafeObject() });
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(400).send("Error: " + err.message);
    }
});

authRouter.post("/login", async (req, res) => {
    console.log("Login API called");
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) {
            //don't expose whether email or password is incorrect
            return res.status(400).send("Invalid Credentials");
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).send("Invalid Credentials");
        }
        const token = await user.getJwtToken();

        res.cookie(COOKIE_NAME, token, authCookieOptions);
        res.status(200).json({ message: "Login successful", data: user.toSafeObject() });
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});

authRouter.post("/logout", async (req, res) => {
    console.log("Logout API called");
    try {
        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            sameSite: usesCrossOriginClient ? "none" : "lax",
            secure: isProduction,
        });
        res.status(200).json({ message: "Logout successful" });
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});


module.exports = authRouter;
