app.get("/connect", async (req, res) => {
  try {
    const response = await plaid.linkTokenCreate({
      client_name: "Shield Funding",
      language: "en",
      country_codes: ["US"],
      products: ["assets"],
      user: { client_user_id: `sf_${Date.now()}` },
      hosted_link: {},
    });

    return res.redirect(response.data.hosted_link_url);
  } catch (err) {
    console.error(err?.response?.data || err);
    return res.status(500).send("Plaid link error");
  }
});
