const API_KEY = Deno.env.get("API_KEY");
const BASE_URL = "https://api.bland.ai";
const TRANSCRIPT_POLLING_INTERVAL = 500;

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
            description:
              "Phone number to call, must be a valid numeric phone number",
          },
          task: {
            type: "string",
            description:
              "Task description for the call. Include all the details for the task: Who is calling, purpose of the call, who is this regarding etc. and any other details that might be relevant.",
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
  ];
}

export async function makePhoneCall(context, params) {
  context.updateStatus(`Making a call to: ${params["phone_number"]}...`);
  const headers = {
    Authorization: API_KEY,
  };

  params["voice_id"] = 1;
  params["reduce_latency"] = true;
  params["amd"] = true;
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
        const transcript = await getPhoneCallTranscript(context, { callId });
        return { result: `Here is the call transcript:\n\n${transcript}` };
      } else {
        return { result: "Failed to make a call" };
      }
    }
  } catch (error) {
    return { error: "Error making call", status: "done" };
  }
}

async function getPhoneCallTranscript(context, { callId }) {
  const headers = {
    Authorization: API_KEY,
  };

  try {
    while (true) {
      await new Promise((resolve) =>
        setTimeout(resolve, TRANSCRIPT_POLLING_INTERVAL)
      );

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
        if (data.transcripts.length > 0) {
          context.updateStatus(formatTranscript(data.transcripts));
        } else {
          context.updateStatus(
            "Waiting for call to be answered, please wait..."
          );
        }
        if (data.completed == true) {
          context.updateStatus(
            formatTranscript(data.transcripts) + "  \nPhone call completed."
          );
          return formatTranscript(data.transcripts);
        }
      }
    }
  } catch (error) {
    return "Error fetching transcript";
  }
}

function formatTranscript(transcripts) {
  let formattedTranscript = "Call transcript:  \n\n";
  transcripts.forEach((transcript) => {
    formattedTranscript += `**${transcript.user}**: ${transcript.text}  \n`;
  });
  return formattedTranscript;
}
