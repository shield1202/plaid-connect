import express from "express";
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

const app = express();

const config = new Configuration({
  basePath: PlaidEnvironments.production,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});

const plaid = new PlaidApi(config);

app.get("/connect", async (req, res) => {
  try {
    const response = await plaid.linkTokenCreate({
      client_name: "Shield Funding",
      language: "en",
      country_codes: ["US"],
      products: ["auth"],
      user: { client_user_id: `sf_${Date.now()}` },
      hosted_link: {},
    });

    res.redirect(response.data.hosted_link_url);
  } catch (err) {
    console.error(err);
    res.status(500).send("Plaid link error");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running"));
