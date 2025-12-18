const express = require("express");

const app = express() //Creating the new express js instance.new web server

app.use("/home",(req,res)=>{
    res.send("reponding from here rajkiran")
})
app.use("/",(req,res)=>{
    res.send("reponding from here")
})


app.listen(3000,()=>console.log("listerning on 3000"))