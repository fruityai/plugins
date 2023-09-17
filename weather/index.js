const API_KEY = Deno.env.get("API_KEY");
const BASE_URL = "http://api.openweathermap.org/data/2.5/";

export function registerFunctions() {
  return [
    {
      name: "getCurrentWeatherByLatLon",
      description: "Get current weather by latitude and longitude",
      parameters: {
        type: "object",
        properties: {
          lat: {
            type: "number",
            description: "Latitude",
          },
          lon: {
            type: "number",
            description: "Longitude",
          },
          units: {
            type: "string",
            description:
              "Units for temperature. 'metric' for Celsius, 'imperial' for Fahrenheit",
          },
        },
        required: ["lat", "lon", "units"],
      },
    },
    {
      name: "getFiveDayForecastByLatLon",
      description: "Get five day weather forecast by latitude and longitude",
      parameters: {
        type: "object",
        properties: {
          lat: {
            type: "number",
            description: "Latitude",
          },
          lon: {
            type: "number",
            description: "Longitude",
          },
          units: {
            type: "string",
            description:
              "Units for temperature. 'metric' for Celsius, 'imperial' for Fahrenheit",
          },
        },
        required: ["lat", "lon", "units"],
      },
    },
  ];
}

export async function getCurrentWeatherByLatLon(context, { lat, lon, units }) {
  context.updateStatus("Checking current weather...");
  const url = `${BASE_URL}weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return { result: data, status: "continue" };
  } catch (error) {
    console.log(error);
    context.updateStatus({ error: "Error fetching current weather" });
  }
}

export async function getFiveDayForecastByLatLon(context, { lat, lon, units }) {
  context.updateStatus("Checking weather forecast...");
  const url = `${BASE_URL}forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return { result: data, status: "continue" };
  } catch (error) {
    context.updateStatus({ error: "Error fetching 5-day forecast" });
  }
}
