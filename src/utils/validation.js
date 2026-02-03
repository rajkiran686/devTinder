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

module.exports = {
    validateSignUpData
}