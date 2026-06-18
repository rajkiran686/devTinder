const validator = require('validator');

const MAX_SKILLS = 5;
const MAX_PHOTOS = 6;
const MAX_PROMPTS = 3;

const validatePhotoList = (photos = []) => {
    if (!Array.isArray(photos)) {
        throw new Error("Photos must be an array");
    }

    if (photos.length > MAX_PHOTOS) {
        throw new Error(`Photos cannot be more than ${MAX_PHOTOS}`);
    }

    const allPhotosAreValid = photos.every((photo) => typeof photo === "string" && validator.isURL(photo));
    if (!allPhotosAreValid) {
        throw new Error("Each photo must be a valid URL");
    }
};

const validatePrompts = (prompts = []) => {
    if (!Array.isArray(prompts)) {
        throw new Error("Prompts must be an array");
    }

    if (prompts.length > MAX_PROMPTS) {
        throw new Error(`Prompts cannot be more than ${MAX_PROMPTS}`);
    }

    prompts.forEach((prompt, index) => {
        if (!prompt || typeof prompt !== "object") {
            throw new Error(`Prompt ${index + 1} must be an object`);
        }

        if (!prompt.question || typeof prompt.question !== "string") {
            throw new Error(`Prompt ${index + 1} question is required`);
        }

        if (!prompt.answer || typeof prompt.answer !== "string") {
            throw new Error(`Prompt ${index + 1} answer is required`);
        }
    });
};

const validateSignUpData = req => {
    const {
        firstName,
        lastName,
        email,
        password,
        photoUrl,
        photos,
        prompts,
        skills,
        visibilityMode,
        verificationStatus,
    } = req.body;

    if (!firstName || firstName.length < 3) {
        throw new Error("First name must be at least 3 characters");
    }

    if (!lastName || lastName.length < 3) {
        throw new Error("Last name must be at least 3 characters");
    }

    if (!validator.isEmail(email)) {
        throw new Error("Invalid email address");
    }

    if (!validator.isStrongPassword(password)) {
        throw new Error("Password must contain uppercase, lowercase, number, and symbol");
    }

    if (photoUrl && !validator.isURL(photoUrl)) {
        throw new Error("Invalid photo URL");
    }

    if (photos !== undefined) {
        validatePhotoList(photos);
    }

    if (prompts !== undefined) {
        validatePrompts(prompts);
    }

    if (skills !== undefined) {
        if (!Array.isArray(skills)) {
            throw new Error("Skills must be an array");
        }

        if (skills.length > MAX_SKILLS) {
            throw new Error(`Skills cannot be more than ${MAX_SKILLS}`);
        }
    }

    if (visibilityMode !== undefined && !["public", "incognito"].includes(visibilityMode)) {
        throw new Error("Visibility mode must be public or incognito");
    }

    if (verificationStatus !== undefined && !["unverified", "pending", "verified"].includes(verificationStatus)) {
        throw new Error("Invalid verification status");
    }
};

const validateProfileEditData = (req) => {
      const allowedEditFields = [
        'firstName',
        'lastName',
        'photoUrl',
        'photos',
        'about',
        'prompts',
        'skills',
        'age',
        'gender',
        'visibilityMode',
        'showVerificationBadge',
      ];
      const isAllowEdit = Object.keys(req.body).every((field)=> allowedEditFields.includes(field));

      if (!isAllowEdit) {
        return false;
      }

      if (req.body.photoUrl && !validator.isURL(req.body.photoUrl)) {
        throw new Error("Invalid photo URL");
      }

      if (req.body.photos !== undefined) {
        validatePhotoList(req.body.photos);
      }

      if (req.body.prompts !== undefined) {
        validatePrompts(req.body.prompts);
      }

      if (req.body.skills !== undefined) {
        if (!Array.isArray(req.body.skills)) {
            throw new Error("Skills must be an array");
        }

        if (req.body.skills.length > MAX_SKILLS) {
            throw new Error(`Skills cannot be more than ${MAX_SKILLS}`);
        }
      }

      if (req.body.visibilityMode !== undefined && !["public", "incognito"].includes(req.body.visibilityMode)) {
        throw new Error("Visibility mode must be public or incognito");
      }

      if (
        req.body.showVerificationBadge !== undefined &&
        typeof req.body.showVerificationBadge !== "boolean"
      ) {
        throw new Error("showVerificationBadge must be a boolean");
      }

      return true;
}

module.exports = {
    validateSignUpData,
    validateProfileEditData,
};
