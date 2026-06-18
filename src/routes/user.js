const express = require('express');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequestModel = require('../models/connectionRequest');
const User = require('../models/user');

const userRouter = express.Router();
const USER_FIELDS = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "photoUrl",
    "photos",
    "about",
    "prompts",
    "skills",
    "isVerified",
    "verificationStatus",
    "visibilityMode",
    "showVerificationBadge",
];

//Get all the pending connection requests for the logged in user
userRouter.get('/user/requests/received',userAuth, async (req, res) => {
    try{
        const loggedInUserData = req.user;
        const pendingRequests = await ConnectionRequestModel.find({ toUserId: loggedInUserData._id, status:'interested'}).populate('fromUserId', USER_FIELDS);
        res.status(200).json({ message: "Pending connection requests received", data: pendingRequests });
    }catch(err){
        res.status(400).send("Error: " + err.message);
    }
})

//Get all the sent connections for the logged in user
userRouter.get('/user/connections', userAuth, async (req,res) => {

    try{
        const loggedinUser = req.user;
        const connectionList = await ConnectionRequestModel.find({status: 'accepted',$or:[{fromUserId: loggedinUser._id},{toUserId: loggedinUser._id}]}).populate('fromUserId', USER_FIELDS).populate('toUserId', USER_FIELDS);

        const data = connectionList.map(row => {
            if(row.fromUserId._id.equals(loggedinUser._id)){
                return row.toUserId;
            }
            return row.fromUserId;
        })
        res.status(200).json({ message: "List of connections", data: data });
    }
    catch(err){
        res.status(400).send("Error: "+ err.message)
    }
})

//Get feed of users excluding the ones who have sent or received connection requests to/from the logged in user
userRouter.get('/feed', userAuth, async (req,res) => {
    try{
        const loggedinUser = req.user;

        const page = req.query.page ? parseInt(req.query.page) : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;

        limit = Math.min(limit, 50); // Set a maximum limit of 50 to prevent abuse

        const connectionList = await ConnectionRequestModel.find({
            $or:[{fromUserId: loggedinUser._id},{toUserId: loggedinUser._id}],
        }).select('fromUserId toUserId');

        const hideUsersFromFeed = new Set();

        connectionList.forEach(row => {
            hideUsersFromFeed.add(row.fromUserId.toString());
            hideUsersFromFeed.add(row.toUserId.toString());
        })

        const feedData = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUsersFromFeed) } },
                { _id: { $ne: loggedinUser._id } },
                {
                    $or: [
                        { visibilityMode: "public" },
                        { visibilityMode: { $exists: false } },
                    ],
                },
            ],
        }).select(USER_FIELDS).skip(skip).limit(limit);

        res.status(200).json({ message: "List of connections", data: feedData });
    }
    catch(err){
        res.status(400).send("Error: "+ err.message)
    }
})


module.exports = userRouter;
