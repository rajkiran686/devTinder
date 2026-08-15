const express = require('express');
const { userAuth } = require('../middlewares/auth');
const paymentRouter = express.Router();
const razorpayInstance = require('../utils/razorpay');
const Payment = require('../models/payment');
const { membershipAmounts } = require('../utils/constants');

paymentRouter.post('/payment/create', userAuth, async(req, res) => {

    const { membershipType } = req.body;
    const { firstName, lastName } = req.user;

    try{
        const order = await razorpayInstance.orders.create({
        "amount": membershipAmounts[membershipType] * 100, // Convert to paise
        "currency": "INR",
        "receipt": "receipt#1",
        //It's like metadata, you can pass any data you want to associate with the order
        "notes": { 
            "firstName": firstName,
            "lastName": lastName,
            "membershipType": membershipType
        }
        });
        //Save it in my database for future reference, so that I can verify the payment later
        const payment = new Payment({
            orderId: order.id,
            userId: req.user._id,
            amount: order.amount,
            currency: order.currency,
            status: "created",
            notes: order.notes
        });

        const savedPayment = await payment.save();
        const savedPaymentData = savedPayment.toObject();

        console.log("Order created successfully", savedPaymentData);

        res.status(200).json({
            message: "Order created successfully",
            keyId: process.env.RAZORPAY_KEY_ID,
            data: savedPaymentData
        });
    }
        
    catch(err){
        res.status(400).send("Error: "+ err.message)
    }

});

paymentRouter.post('/payment/webhook', async(req, res) => {
    //validate the webhook signature to ensure that the request is coming from Razorpay
    const {validateWebhookSignature} = require('../utils/razorpay');
    const isValid = validateWebhookSignature(JSON.stringify(req.body), req.get('x-razorpay-signature'), process.env.RAZORPAY_WEBHOOK_SECRET);

    if (!isValid) {
        return res.status(400).json({ message: "Invalid webhook signature" });
    }

    //update the payment status in the database based on the event type
    const payment = findOne({ orderId: req.body.payload.payment.entity.order_id });
    if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
    }
    payment.status = req.body.event === 'payment.captured' ? 'captured' : 'failed';
    await payment.save();

    const user = await User.findById(payment.userId);
    if (payment.status === 'captured') {
        user.isPremium = true;
        user.membershipType = payment.notes.membershipType;
        await user.save();
    }

    

    res.status(200).json({ message: "Webhook received successfully" });
})

module.exports = paymentRouter;
