const {SESClient} = require("@aws-sdk/client-ses");
const { AWS_ACCESS_KEY, AWS_REGION, AWS_SECRET_KEY } = require("../config/env");

const clientConfig = {
    region: AWS_REGION,
};

if (AWS_ACCESS_KEY && AWS_SECRET_KEY) {
    clientConfig.credentials = {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY,
    };
}

const sesClient = new SESClient(clientConfig);

module.exports = { sesClient };
