const crypto = require("crypto");

exports.handler = async function (event) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return {
      statusCode: 500,
      body: "GitHub OAuth is not configured."
    };
  }

  const params = event.queryStringParameters || {};
  const code = params.code;
  const state = params.state;

  const cookies = event.headers.cookie || "";
  const savedState = cookies
    .split(";")
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith("oauth_state="))
    ?.split("=")[1];

  if (!code || !state || !savedState) {
    return {
      statusCode: 400,
      body: "Missing OAuth authorization information."
    };
  }

  const received = Buffer.from(state);
  const expected = Buffer.from(savedState);

  if (
    received.length !== expected.length ||
    !crypto.timingSafeEqual(received, expected)
  ) {
    return {
      statusCode: 403,
      body: "Invalid OAuth state."
    };
  }

  try {
    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.access_token) {
      return {
        statusCode: 401,
        body: "GitHub authorization failed."
      };
    }

    const message = JSON.stringify({
      token: data.access_token,
      provider: "github"
    }).replace(/</g, "\\u003c");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>EMMM Admin Login</title>
</head>
<body>
  <p>Completing GitHub login...</p>
  <script>
    (function () {
  const message = ${JSON.stringify(message)};

  function receiveMessage(event) {
    if (event.origin !== window.location.origin) {
      return;
    }

    if (event.data === "authorizing:github") {
      window.opener.postMessage(
        "authorization:github:success:" + message,
        window.location.origin
      );

      window.removeEventListener("message", receiveMessage);

      setTimeout(function () {
        window.close();
      }, 500);
    }
  }

  if (window.opener) {
    window.addEventListener("message", receiveMessage);

    window.opener.postMessage(
      "authorizing:github",
      window.location.origin
    );
  } else {
    document.body.textContent =
      "Please return to the EMMM admin login page.";
  }
})();
