const mongoose = require('mongoose');
const { DB_URI } = require("./env");

const connectDb = async() => {
    await mongoose.connect(DB_URI)
}

module.exports = connectDb;
