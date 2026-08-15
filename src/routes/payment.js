const express = require('express');
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
const { userAuth } = require('../middlewares/auth');
const paymentRouter = express.Router();
const razorpayInstance = require('../utils/razorpay');
const Payment = require('../models/payment');
const User = require('../models/user');
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
    try {
        const signature = req.headers['x-razorpay-signature'];
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const rawBody = req.body instanceof Buffer ? req.body.toString('utf8') : JSON.stringify(req.body);
        const webhookPayload = req.body instanceof Buffer ? JSON.parse(rawBody) : req.body;

        if (!signature || !webhookSecret) {
            return res.status(400).json({ message: "Missing webhook signature or secret" });
        }

        const isValid = validateWebhookSignature(rawBody, signature, webhookSecret);

        if (!isValid) {
            return res.status(400).json({ message: "Invalid webhook signature" });
        }

        const paymentEntity = webhookPayload?.payload?.payment?.entity;
        if (!paymentEntity?.order_id) {
            return res.status(400).json({ message: "Missing payment order details in webhook payload" });
        }

        const payment = await Payment.findOne({ orderId: paymentEntity.order_id });
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        payment.paymentId = paymentEntity.id;
        payment.status = webhookPayload.event === 'payment.captured' ? 'captured' : 'failed';
        await payment.save();

        if (payment.status === 'captured') {
            const user = await User.findById(payment.userId);
            if (!user) {
                return res.status(404).json({ message: "User not found for payment" });
            }

            user.isPremium = true;
            user.membershipType = payment.notes.membershipType;
            await user.save();
        }

        res.status(200).json({ message: "Webhook received successfully" });
    } catch (err) {
        console.error("Webhook processing failed", err);
        res.status(500).json({ message: "Webhook processing failed" });
    }
});

module.exports = paymentRouter;
