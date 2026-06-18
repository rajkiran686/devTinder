const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { COOKIE_NAME, JWT_SECRET } = require("../config/env");
const userAuth = async (req, res, next) => {
    //check if the token is present in the cookies
    try{
        const token = req.cookies?.[COOKIE_NAME];
        if (!token) {
            return res.status(401).send("Unauthorized: No token provided");
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        const { _id } = decoded;
        const user = await User.findById(_id);
        if (!user) {
            return res.status(401).send("Unauthorized: User not found");
        }
        req.user = user;
        next();
    }catch(err){
    return res.status(401).send("Unauthorized: " + err.message);
}
};  

module.exports = { userAuth };
