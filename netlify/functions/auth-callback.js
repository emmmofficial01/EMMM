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
      const message = ${JSON.stringify("authorization:github:success:")} +
        ${JSON.stringify(message)};

      if (window.opener) {
        window.opener.postMessage(
          message,
          window.location.origin
        );
        window.close();
      } else {
        document.body.textContent =
          "Please return to the EMMM admin login page.";
      }
    })();
  </script>
</body>
</html>`;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Set-Cookie":
          "oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
      },
      body: html
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: "Unable to complete GitHub authentication."
    };
  }
};
