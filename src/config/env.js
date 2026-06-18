const fs = require("fs");
const path = require("path");

let isLoaded = false;

const loadEnvFile = () => {
    if (isLoaded) {
        return;
    }

    isLoaded = true;
    const envPath = path.resolve(__dirname, "../../.env");

    if (!fs.existsSync(envPath)) {
        return;
    }

    const fileContent = fs.readFileSync(envPath, "utf8");
    fileContent.split(/\r?\n/).forEach((line) => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith("#")) {
            return;
        }

        const separatorIndex = trimmedLine.indexOf("=");
        if (separatorIndex === -1) {
            return;
        }

        const key = trimmedLine.slice(0, separatorIndex).trim();
        const value = trimmedLine.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

        if (key && process.env[key] === undefined) {
            process.env[key] = value;
        }
    });
};

loadEnvFile();

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
    CLIENT_ORIGINS,
    NODE_ENV: process.env.NODE_ENV || "development",
    isProduction,
};
