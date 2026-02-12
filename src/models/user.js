const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const validator = require('validator');
const userSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true, minLength: 3, maxLength: 50 },
        lastName: { type: String, required: true, minLength: 3, maxLength: 50 },
        email: { type: String, required: true, unique: true, lowercase: true,
            validate(value){
                if (!validator.isEmail(value)) {
                    throw new Error("Invalid Email Address" + value);
                }
            }
         },
        password: { type: String, required: true,
            validate(value){
                if(!validator.isStrongPassword(value)){
                    throw new Error("Password is not strong enough.");
                }
            }
         },
        age: { type: Number, default: 20 },
        gender: {
            type: String,
            required: true,
            validate(value) {
                if (!["male", "female", "other"].includes(value.toLowerCase())) {
                    throw new Error("Gender must be male, female or other");
                }
            },
        },
        photoUrl: { type: String, default: "", validate(value) { 
            if(value && !validator.isURL(value)){
                throw new Error("Invalid URL for photo");   
        } 
    }},   
        about: { type: String, maxLength: 500, default: "" },
        skills: {
            type: [String],
            default: [],
            validate(value) {
                if (value.length > 5) {
                    throw new Error("Skills cannot be more than 5");
                }
            },
        },
    },
    { timestamps: true },
);

userSchema.methods.getJwtToken = async function(){
    const user = this;
    const token = await jwt.sign({ _id: user._id }, "Rajkiran@123",{ expiresIn: '10min' })
    return token;
}

userSchema.methods.comparePassword = async function(enteredPassword){
    const user = this;
    const passwordhash =  user.password;
    const isPasswordValid = await bcrypt.compare(enteredPassword, passwordhash);
    return isPasswordValid;
}


const User = mongoose.model('User', userSchema);

module.exports = User;