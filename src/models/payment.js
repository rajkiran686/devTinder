const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    paymentId: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        required: true,
        enum: ['created', 'captured', 'failed'],
        default: 'created'
    },
    notes: {
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        membershipType: {
            type: String,
            enum: ['silver', 'gold', 'platinum'],
        }   
    }
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;