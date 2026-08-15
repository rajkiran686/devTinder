const {sesClient} = require("./sesClient.js");
const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { SES_FROM_EMAIL } = require("../config/env");

const sendEmail = async (toAddress, subject, body) => {
  if (!SES_FROM_EMAIL) {
    throw new Error("Missing required environment variable: SES_FROM_EMAIL");
  }

  const sendEmailCommand = new SendEmailCommand({
    Destination: {
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: body,
        },
        Text: {
          Charset: "UTF-8",
          Data: body,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: SES_FROM_EMAIL,
  });

  try {
    return await sesClient.send(sendEmailCommand);
  } catch (caught) {
    if (caught instanceof Error && caught.name === "MessageRejected") {
      return caught;
    }
    throw caught;
  }
};

module.exports = { sendEmail };
