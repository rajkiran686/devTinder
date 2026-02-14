const validator = require('validator');

const validateSignUpData = req => {
    const { firstName, lastName, email, password, gender, skills } = req.body;

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

    if (!["male", "female", "other"].includes(gender)) {
        throw new Error("Gender must be male, female, or other");
    }

    if (skills && skills.length > 5) {
        throw new Error("Skills cannot be more than 5");
    }
};

const validateProfileEditData = (req) => {
      const allowedEditFields = ['firstName', 'lastName', 'photoUrl', 'about', 'skills', 'age', 'gender', 'email'];
      const isAllowEdit = Object.keys(req.body).every((field)=> allowedEditFields.includes(field));

      return isAllowEdit;
}

module.exports = {
    validateSignUpData,
    validateProfileEditData,
};