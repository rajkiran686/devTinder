const express = require('express')
const {validateSignUpData} = require("../utils/validation")
const User = require("../models/user")
const bcrypt = require("bcrypt")

const authRouter = express.Router();

authRouter.post("/signUp", async (req, res) => {
    console.log("Sign Up API called", req.body);

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
            gender: req.body.gender,
        });
        //Creating the new instance/user of the user Model
        await user.save();
        res.status(201).json({ message: "User created successfully" });
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

        res.cookie("Token", token, { expires: new Date(Date.now() + 600000) });
        res.status(200).json({ message: "Login successful" });
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});

authRouter.post("/logout", async (req, res) => {
    console.log("Logout API called");
    try {
        res.cookie("Token", null, { expires: new Date(Date.now()) });
        res.status(200).json({ message: "Logout successful" });
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});


module.exports = authRouter;