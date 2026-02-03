const jwt = require('jsonwebtoken');
const User = require('../models/user');
const userAuth = async (req, res, next) => {
    //check if the token is present in the cookies
    try{
        const { Token } = req.cookies;
        if (!Token) {
            return res.status(401).send("Unauthorized: No token provided");
        }
        const decoded = jwt.verify(Token, "Rajkiran@123");
        const { _id } = decoded;
        console.log("User ID from token: ", _id);
        const user = await User.findById(_id);
        console.log("Authenticated User: ", user);
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