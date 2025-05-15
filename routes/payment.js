const express = require("express");
const router = express.Router();
const { createPayment, handleCallback } = require("../utils/signature");

router.post("/create-payment", createPayment);
router.post("/callback", handleCallback);

module.exports = router;
