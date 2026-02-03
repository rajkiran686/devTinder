const express = require("express");
const connectDb = require("./config/database")
const User = require("./models/user")
const bcrypt = require("bcrypt")
const {validateSignUpData} = require("./utils/validation")
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken")
const app = express()
const { userAuth } = require("./middlewares/auth");

app.use(express.json()) // middleware to parse JSON request bodies
app.use(cookieParser()); // middleware to parse cookies

app.post('/signUp', async(req, res) => {
    console.log("Sign Up API called",req.body);

    try{
        //Validate the data
        validateSignUpData(req);

        //Encrypt the password
        const passwordHash = await bcrypt.hash(req.body.password, 10);

        //store the user in database
        const user = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: passwordHash,
            gender: req.body.gender
        });
        //Creating the new instance/user of the user Model
        await user.save();
        res.status(201).json({message: "User created successfully"});
    }
    catch(err){
        console.error("Error creating user:", err); 
        res.status(400).send("Error: " + err.message);
    }
   
})


app.post('/login', async(req, res) => {
    console.log("Login API called");
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email: email});
        if(!user){
            //don't expose whether email or password is incorrect 
            return res.status(400).send("Invalid Credentials");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).send("Invalid Credentials");
        }
        const token =jwt.sign({ _id: user._id }, "Rajkiran@123",{ expiresIn: '1min' });

        res.cookie('Token', token, { expires: new Date(Date.now() + 60000) });
        res.status(200).json({message: "Login successful"});

    }catch(err){
        res.status(400).send("Error: " + err.message);
    }
})

app.get('/profile', userAuth, async (req,res)=>{

    try{
        const user = req.user;
        res.send("Profile Page of " + user.firstName);
    }catch(err){
        return res.status(401).send("Unauthorized: Invalid token");
    }
    res.send("Profile Page")
})


connectDb()
.then(()=>{
    console.log("Database connected successfully");
    app.listen(3000, () => console.log("listerning on 3000"));
})
.catch((err)=>{
    console.log("Database connection failed", err);
})

