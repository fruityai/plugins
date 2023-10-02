const API_KEY = Deno.env.get("API_KEY");
const BASE_URL = "https://api.bland.ai";

export function defineFunctions() {
  return [
    {
      name: "makePhoneCall",
      description: "Make a phone call",
      parameters: {
        type: "object",
        properties: {
          phone_number: {
            type: "string",
            description: "Phone number to call",
          },
          task: {
            type: "string",
            description: "Task description for the call",
          },
          request_data: {
            type: "object",
            description:
              "Specific entities of data needed for the call. Like account numbers, dates, etc. Must be a valid JSON object.",
            additionalProperties: true,
          },
        },
        required: ["phone_number", "task"],
      },
    },
    {
      name: "getPhoneCallTranscript",
      description: "Get the transcript of a call",
      parameters: {
        type: "object",
        properties: {
          callId: {
            type: "string",
            description: "ID of the call",
          },
        },
        required: ["callId"],
      },
    },
  ];
}

export async function makePhoneCall(context, params) {
  context.updateStatus(`Making a call to: ${params["phone_number"]}...`);
  const headers = {
    Authorization: API_KEY,
  };

  params["voice_id"] = 2;
  params["reduce_latency"] = true;
  if (params["request_data"]) {
    try {
      const parsedJson = JSON.parse(params["request_data"]);
      params["request_data"] = parsedJson;
    } catch (error) {}
  }

  try {
    const response = await fetch(`${BASE_URL}/call`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status == "success") {
        context.updateStatus(`Call started successfully.`);
        const callId = data.call_id;

        return {
          result: `Call started successfully. If user asks for transcript use this call ID to get transcript: '${callId}'`,
          status: "continue",
        };
      } else {
        return { result: "Failed to make call", status: "continue" };
      }
    }
  } catch (error) {
    return { error: "Error making call", status: "done" };
  }
}

export async function getPhoneCallTranscript(context, { callId }) {
  context.updateStatus(`Getting a transcript for the call...`);
  const headers = {
    Authorization: API_KEY,
  };

  try {
    const response = await fetch(`${BASE_URL}/logs`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ call_id: callId }),
    });

    if (response.ok) {
      const data = await response.json();
      return { result: data.transcripts, status: "continue" };
    } else {
      throw new Error(error.message || "Error fetching transcript");
    }
  } catch (error) {
    return { error: error.message || "Error fetching transcript" };
  }
}
