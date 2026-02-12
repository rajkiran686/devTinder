const express = require('express');
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
 const validator = require('validator');

  const bcrypt = require("bcrypt");

const { validateProfileEditData } = require("../utils/validation");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send("Profile Page of " + user.firstName);
    } catch (err) {
        return res.status(401).send("Unauthorized: Invalid token");
    }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try{
        //data sanitization and validation can be added here
        if(!validateProfileEditData(req)){
            throw new Error("Invalid fields in profile edit");
        }

        //i don't want to allow to edit the email and password from this route
        if(req.body.email || req.body.password){
            throw new Error("Email and Password cannot be edited from this route");
        }

        if(req.body.skills && req.body.skills.length > 5){
            throw new Error("Skills cannot be more than 5");
        }

        if(req.body.photoUrl && req.body.photoUrl.length > 0){
           
            if(!validator.isURL(req.body.photoUrl)){
                throw new Error("Invalid URL for photo");
            }
        }

        const loggedInUser = req.user;

        Object.keys(req.body).forEach((field) => {
            loggedInUser[field] = req.body[field];
        })

        await loggedInUser.save();

        res.status(200).json({ message: ` ${loggedInUser.firstName} Profile updated successfully`, data: loggedInUser });

    }catch(err){
        return res.status(401).send("Unauthorized: " + err.message);
    }
})

profileRouter.patch("/profile/changePassword", userAuth, async (req, res) => {
    try{
        const { oldPassword, newPassword } = req.body;
        if(!oldPassword || !newPassword){
            throw new Error("Old Password and New Password are required");
        }

        const loggedInUser = req.user;

        const isOldPasswordValid = await loggedInUser.comparePassword(oldPassword);
        if(!isOldPasswordValid){
            throw new Error("Old Password is incorrect");
        }

        if(!validator.isStrongPassword(newPassword)){
            throw new Error("New Password is not strong enough.");
        }

       
        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        loggedInUser.password = newHashedPassword;

        await loggedInUser.save();

        res.status(200).json({ message: ` ${loggedInUser.firstName} Password changed successfully` });

    }catch(err){
        return res.status(401).send("Unauthorized: " + err.message);
    }
})
 

module.exports = profileRouter;