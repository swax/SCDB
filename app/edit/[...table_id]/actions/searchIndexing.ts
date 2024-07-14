import ProcessEnv from "@/shared/ProcessEnv";
import { ServiceResponse } from "@/shared/serviceResponse";
import { google } from "googleapis";
import "server-only";

const bingResponseCodes: Record<number, string> = {
  200: "Ok",
  400: "Bad request",
  403: "Forbidden",
  422: "Unprocessable Entity",
  429: "Too Many Requests",
};

/** Send update to Bing of page change. Documenation here: https://www.indexnow.org/en_gb/documentation */
export async function sendBingUpdate<T>(
  url: string,
  clientResponse: ServiceResponse<T>,
) {
  clientResponse.warnings ||= [];

  try {
    const key = "67422e8eca6b48ed9156f42a179dcec2"; // Doesn't need to be kept secret, just match what's in the public folder

    const indexResponse = await fetch(
      `https://api.indexnow.org/indexnow?url=${encodeURIComponent(url)}&key=${key}`,
    );

    // If Bing response is not ok, add a warning to the client response
    if (!indexResponse.ok) {
      const responseMessage =
        bingResponseCodes[indexResponse.status] || "Unknown";

      clientResponse.warnings.push(
        `Bing error response: ${indexResponse.status} - ${responseMessage}`,
      );
    }
  } catch (e) {
    clientResponse.warnings.push(`Bing update exception: ${e}`);
  }
}

export async function sendGoogleUpdate<T>(
  url: string,
  clientResponse: ServiceResponse<T>,
) {
  clientResponse.warnings ||= [];

  try {
    const jwtClient = new google.auth.JWT(
      ProcessEnv.GOOGLE_INDEX_SERVICE_EMAIL,
      undefined,
      ProcessEnv.GOOGLE_INDEX_SERVICE_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/indexing"],
      undefined,
    );

    const credentials = await jwtClient.authorize();

    if (!credentials.access_token) {
      clientResponse.warnings.push(
        `Failed to authorize with Google: No tokens`,
      );
      return;
    }

    const options = {
      url: "https://indexing.googleapis.com/v3/urlNotifications:publish",
      method: "POST",
      // Your options, which must include the Content-Type and auth headers
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${credentials.access_token}`,
      },
      auth: { bearer: credentials.access_token },
      // Define contents here. The structure of the content is described in the next step.
      json: {
        url,
        type: "URL_UPDATED",
      },
    };

    const googleResponse = await fetch(options.url, {
      method: options.method,
      headers: options.headers,
      body: JSON.stringify(options.json),
    });

    if (!googleResponse.ok) {
      clientResponse.warnings.push(
        `Google error response: ${googleResponse.status} - ${googleResponse.statusText}`,
      );
    }
  } catch (e) {
    clientResponse.warnings.push(`Google update exception: ${e}`);
  }
}
