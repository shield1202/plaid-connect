import express from "express";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

const app = express();
const PORT = process.env.PORT || 10000;

/**
 * =========================
 * ENVIRONMENT CHECK
 * =========================
 */
const PLAID_ENV = process.env.PLAID_ENV || "sandbox"; // sandbox or production
const PRODUCT_LIST = ["assets"]; // bank statements only

const plaidEnvMap = {
  sandbox: PlaidEnvironments.sandbox,
  production: PlaidEnvironments.production,
};

if (!plaidEnvMap[PLAID_ENV]) {
  throw new Error(`Invalid PLAID_ENV: ${PLAID_ENV}`);
}

/**
 * =========================
 * PLAID CONFIG
 * =========================
 */
const config = new Configuration({
  basePath: plaidEnvMap[PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});

const plaid = new PlaidApi(config);

/**
 * =========================
 * HEALTH CHECK
 * =========================
 */
app.get("/", (req, res) => {
  res.send("Plaid Connect server running");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    plaid_env: PLAID_ENV,
    products: PRODUCT_LIST,
    has_PLAID_CLIENT_ID: !!process.env.PLAID_CLIENT_ID,
    has_PLAID_SECRET: !!process.env.PLAID_SECRET,
  });
});

/**
 * =========================
 * CONNECT → PLAID HOSTED LINK
 * =========================
 */
app.get("/connect", async (req, res) => {
  try {
    const response = await plaid.linkTokenCreate({
      client_name: "Shield Funding",
      language: "en",
      country_codes: ["US"],
      products: PRODUCT_LIST,
      user: {
        client_user_id: `sf_${Date.now()}`,
      },
      hosted_link: {
        delivery_method: "redirect",
      },
    });

    res.redirect(response.data.hosted_link_url);
  } catch (err) {
    console.error("❌ PLAID ERROR");

    if (err.response) {
      console.error("❌ STATUS:", err.response.status);
      console.error("❌ DATA:", err.response.data);
      res.status(500).json(err.response.data);
    } else {
      console.error(err);
      res.status(500).send("Plaid internal error");
    }
  }
});

/**
 * =========================
 * START SERVER
 * =========================
 */
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Env: ${PLAID_ENV}`);
  console.log(`✅ Products: ${PRODUCT_LIST.join(", ")}`);
});
