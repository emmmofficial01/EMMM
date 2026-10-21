exports.handler = async function (event) {
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return {
      statusCode: 500,
      body: "GitHub Client ID is not configured."
    };
  }

  const callbackUrl =
    "https://exquisite-cobbler-e86b3e.netlify.app/.netlify/functions/auth-callback";

  const state = require("crypto").randomBytes(24).toString("hex");

  const authorizationUrl = new URL(
    "https://github.com/login/oauth/authorize"
  );

  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", callbackUrl);
  authorizationUrl.searchParams.set("scope", "repo");
  authorizationUrl.searchParams.set("state", state);

  return {
    statusCode: 302,
    headers: {
      Location: authorizationUrl.toString(),
      "Set-Cookie":
        `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`
    },
    body: ""
  };
};
