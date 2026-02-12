const validator = require('validator');

const validateSignUpData = (req) => {
   const { firstName, lastName, email, password, gender, skills } = req.body;
   
   if(!firstName || !lastName ) {
         throw new Error("Name is missing");
   }
   if(!validator.isEmail(email)) {
         throw new Error("Invalid Email Address: " + email);
   }
}

const validateProfileEditData = (req) => {
      const allowedEditFields = ['firstName', 'lastName', 'photoUrl', 'about', 'skills', 'age', 'gender', 'email'];
      const isAllowEdit = Object.keys(req.body).every((field)=> allowedEditFields.includes(field));

      return isAllowEdit;
}

module.exports = {
    validateSignUpData,
    validateProfileEditData,
};