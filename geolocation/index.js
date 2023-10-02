export function defineFunctions() {
  return [
    {
      name: "getUserLocation",
      description: "Get chat user current geo location",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  ];
}

export async function getUserLocation(context) {
  context.updateStatus("Getting user location...");

  try {
    const userLocation = await context.getUserLocation();
    context.updateStatus("User location received");
    return { result: userLocation, status: "continue" };
  } catch (error) {
    context.updateStatus("Failed to get user location");
  }
}
