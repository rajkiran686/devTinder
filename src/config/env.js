const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const getEnvVar = (name) => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
};

const isProduction = process.env.NODE_ENV === "production";
const rawClientOrigins = process.env.CLIENT_ORIGIN || "";
const CLIENT_ORIGINS = rawClientOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

module.exports = {
    APP_PORT: Number(process.env.PORT || 3000),
    COOKIE_NAME: "Token",
    DB_URI: getEnvVar("MONGO_URI"),
    JWT_SECRET: getEnvVar("JWT_SECRET"),
    AWS_REGION: process.env.AWS_REGION || "ap-south-1",
    AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY || "",
    AWS_SECRET_KEY: process.env.AWS_SECRET_KEY || "",
    SES_FROM_EMAIL: process.env.SES_FROM_EMAIL || "",
    NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL || "",
    CLIENT_ORIGINS,
    NODE_ENV: process.env.NODE_ENV || "development",
    isProduction,
};
