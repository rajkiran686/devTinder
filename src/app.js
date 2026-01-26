const express = require("express");
const connectDb = require("./config/database")
const User = require("./models/user")

const app = express()


app.post('/signUp', async(req, res) => {
    console.log("Sign Up API called");
    const userObj = {
        firstName: "Rajkiran",
        lastName: "Guttur",
        email: "rajkiran@example.com",
        password: "password123",
        age: 25,
        // gender: "male",
    };
    const user = new User(userObj);
    try{
        await user.save();
        //Creating the new instance of the user Model
        res.status(201).json({message: "User created successfully"});
    }
    catch(err){
        res.status(500).json({message: "Internal Server Error"})
    }
   
})

connectDb()
.then(()=>{
    console.log("Database connected successfully");
    app.listen(3000, () => console.log("listerning on 3000"));
})
.catch((err)=>{
    console.log("Database connection failed", err);
})

