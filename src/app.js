const express = require("express");
const connectDb = require("./config/database")
const cookieParser = require("cookie-parser");
const app = express()
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");

app.use(express.json()) // middleware to parse JSON request bodies
app.use(cookieParser()); // middleware to parse cookies
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);

connectDb()
.then(()=>{
    console.log("Database connected successfully");
    app.listen(3000, () => console.log("listerning on 3000"));
})
.catch((err)=>{
    console.log("Database connection failed", err);
})

