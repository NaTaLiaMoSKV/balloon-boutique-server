const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const merchantAccount = process.env.MERCHANT_LOGIN;
const merchantSecretKey = process.env.MERCHANT_SECRET_KEY;
const merchantDomainName = process.env.MERCHANT_DOMAIN_NAME;
const serviceUrl = process.env.SERVICE_URL;

function generateSignature(paramsArray) {
  const dataToSign = paramsArray.join(";");
  return crypto
    .createHmac("md5", merchantSecretKey)
    .update(dataToSign)
    .digest("hex");
}

exports.createPayment = (req, res) => {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { items, amount, currency, customer } = req.body;

  const orderReference = `ORDER_${Date.now()}`;
  const orderDate = Math.floor(Date.now() / 1000);

  const productNames = items.map((item) => item.name);
  const productPrices = items.map((item) => Number(item.price));
  const productCounts = items.map((item) => Number(item.count));

  const signatureArray = [
    merchantAccount,
    merchantDomainName,
    orderReference,
    orderDate.toString(),
    amount,
    currency,
    productNames.join(";"),
    productCounts.join(";"),
    productPrices.join(";"),
  ];

  const signature = generateSignature(signatureArray);
  const data = {
    transactionType: "CREATE_INVOICE",
    merchantAuthType: "SimpleSignature",
    apiVersion: 1,
    serviceUrl,
    merchantAccount,
    merchantDomainName,
    orderReference,
    orderDate,
    amount: parseFloat(amount),
    currency,

    productName: productNames,
    productPrice: productPrices,
    productCount: productCounts,

    clientFirstName: customer.firstName,
    clientLastName: customer.lastName,
    clientEmail: customer.email,
    clientPhone: customer.phone,

    merchantSignature: signature,
    language: "UA",
  };

  res.status(200).json(data);
};

exports.handleCallback = (req, res) => {
  console.log("WayForPay callback received:", req.body);

  // TODO: check signature and status

  return res.status(200).send("OK");
};
