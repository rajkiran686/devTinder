const mongoose = require('mongoose');

const connectDb = async() => {
    await mongoose.connect('mongodb+srv://gutturthirajkiran143:Rajkiran%40143@cluster.n17eyrp.mongodb.net/devTinder')
}

module.exports = connectDb;