const express = require('express');
const mongoose = require('mongoose');
const { userAuth } = require('../middlewares/auth');
const ConnectionRequestModel = require('../models/connectionRequest');
const User = require('../models/user');

const requestRouter = express.Router();

requestRouter.post('/request/send/:status/:toUserId', userAuth,async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        if(status !== 'interested' && status !== 'ignored'){
            throw new Error("Invalid status value. Status can only be 'interested' or 'ignored'");
        }

        if (!mongoose.Types.ObjectId.isValid(toUserId)) {
            throw new Error("The user you are trying to send a connection request to does not exist");
        }

        const toUserIdExists = await User.findById(toUserId);


        if(!toUserIdExists){
            throw new Error("The user you are trying to send a connection request to does not exist");
        }

        if(fromUserId.toString() === toUserId){
            throw new Error("You cannot send a connection request to yourself");
        }

        const existingRequest = await ConnectionRequestModel.findOne(
            { $or: [
                { fromUserId: fromUserId, toUserId: toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]}
        );

        if(existingRequest){
            throw new Error("Connection request already exists between these users");
        }

        const connectionRequest = new ConnectionRequestModel({
            fromUserId,
            toUserId,
            status
        });
        await connectionRequest.save();
        res.status(200).json({ message: req.user.firstName+" is "+status+" to "+toUserIdExists.firstName, data: connectionRequest });
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
});

module.exports = requestRouter;
