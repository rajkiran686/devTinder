const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const validator = require('validator');
const { JWT_SECRET } = require("../config/env");

const MAX_SKILLS = 5;
const MAX_PHOTOS = 6;
const MAX_PROMPTS = 3;

const promptSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },
        answer: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300,
        },
    },
    { _id: false },
);

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
        photos: {
            type: [String],
            default: [],
            validate(value) {
                if (value.length > MAX_PHOTOS) {
                    throw new Error(`Photos cannot be more than ${MAX_PHOTOS}`);
                }

                const hasInvalidPhoto = value.some((photo) => !validator.isURL(photo));
                if (hasInvalidPhoto) {
                    throw new Error("Every photo must be a valid URL");
                }
            },
        },
        about: { type: String, maxLength: 500, default: "" },
        prompts: {
            type: [promptSchema],
            default: [],
            validate(value) {
                if (value.length > MAX_PROMPTS) {
                    throw new Error(`Prompts cannot be more than ${MAX_PROMPTS}`);
                }
            },
        },
        skills: {
            type: [String],
            default: [],
            validate(value) {
                if (value.length > MAX_SKILLS) {
                    throw new Error(`Skills cannot be more than ${MAX_SKILLS}`);
                }
            },
        },
        isVerified: { type: Boolean, default: false },
        verificationStatus: {
            type: String,
            enum: ["unverified", "pending", "verified"],
            default: "unverified",
        },
        visibilityMode: {
            type: String,
            enum: ["public", "incognito"],
            default: "public",
        },
        showVerificationBadge: { type: Boolean, default: true },
    },
    { timestamps: true },
);

userSchema.pre("save", function syncPrimaryPhoto() {
    if (this.photos.length > 0) {
        this.photoUrl = this.photos[0];
    } else if (this.photoUrl) {
        this.photos = [this.photoUrl];
    }

    if (this.isVerified && this.verificationStatus !== "verified") {
        this.verificationStatus = "verified";
    }

    if (!this.isVerified && this.verificationStatus === "verified") {
        this.verificationStatus = "unverified";
    }
});

userSchema.methods.toSafeObject = function() {
    const normalizedPhotos = this.photos?.length ? this.photos : (this.photoUrl ? [this.photoUrl] : []);
    const normalizedVisibilityMode = this.visibilityMode || "public";
    const normalizedIsVerified = Boolean(this.isVerified);
    const normalizedVerificationStatus = this.verificationStatus || (normalizedIsVerified ? "verified" : "unverified");
    const normalizedPrompts = this.prompts || [];
    const normalizedSkills = this.skills || [];
    const normalizedShowVerificationBadge = this.showVerificationBadge !== false;

    const {
        _id,
        firstName,
        lastName,
        email,
        age,
        gender,
        photoUrl,
        about,
        createdAt,
        updatedAt,
    } = this;
    return {
        _id,
        firstName,
        lastName,
        email,
        age,
        gender,
        photoUrl,
        photos: normalizedPhotos,
        about,
        prompts: normalizedPrompts,
        skills: normalizedSkills,
        isVerified: normalizedIsVerified,
        verificationStatus: normalizedVerificationStatus,
        visibilityMode: normalizedVisibilityMode,
        showVerificationBadge: normalizedShowVerificationBadge,
        createdAt,
        updatedAt,
    };
};

userSchema.methods.getJwtToken = async function(){
    const user = this;
    const token = await jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: "1h" })
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
