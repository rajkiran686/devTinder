const express = require("express");
const connectDb = require("./config/database")
const cookieParser = require("cookie-parser");
const { APP_PORT, CLIENT_ORIGINS } = require("./config/env");
const app = express()
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

const allowlistedOrigins = new Set(CLIENT_ORIGINS);
const defaultCorsHeaders = "Content-Type, Authorization";
const defaultCorsMethods = "GET,POST,PATCH,PUT,DELETE,OPTIONS";

app.use((req, res, next) => {
    const requestOrigin = req.headers.origin;

    if (requestOrigin && allowlistedOrigins.has(requestOrigin)) {
        res.setHeader("Access-Control-Allow-Origin", requestOrigin);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Headers", req.headers["access-control-request-headers"] || defaultCorsHeaders);
        res.setHeader("Access-Control-Allow-Methods", defaultCorsMethods);
    }

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" })) // middleware to parse JSON request bodies
app.use(cookieParser()); // middleware to parse cookies
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use('/', userRouter)

connectDb()
.then(()=>{
    console.log("Database connected successfully");
    app.listen(APP_PORT, () => console.log(`Listening on ${APP_PORT}`));
})
.catch((err)=>{
    console.log("Database connection failed", err);
})
