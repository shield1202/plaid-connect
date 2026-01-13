import express from "express";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

const app = express();

/**
 * Plaid configuration
 * IMPORTANT:
 * - If your keys are SANDBOX keys → use PlaidEnvironments.sandbox
 * - If your keys are PRODUCTION keys → use PlaidEnvironments.production
 */
const config = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});

const plaid = new PlaidApi(config);

/**
 * Health check (optional but helpful)
 */
app.get("/", (req, res) => {
  res.send("Plaid Connect server running");
});

/**
 * Permanent Hosted Link endpoint
 * Visiting /connect will redirect to Plaid Hosted Link
 */
app.get("/connect", async (req, res) => {
  try {
    const response = await plaid.linkTokenCreate({
      client_name: "Shield Funding",
      language: "en",
      country_codes: ["US"],
      products: ["assets"],
      user: {
        client_user_id: `sf_${Date.now()}`,
      },
      hosted_link: {},
    });

    res.redirect(response.data.hosted_link_url);
  } catch (err) {
    console.error(err?.response?.data || err);
    res.status(500).send("Plaid link error");
  }
});

/**
 * Start server
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
