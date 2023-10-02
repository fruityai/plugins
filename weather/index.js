const API_KEY = Deno.env.get("API_KEY");
const BASE_URL = "http://api.openweathermap.org/data/2.5/";
const DEFAULT_UNITS = "imperial";

function defineFunctions() {
  return [
    {
      name: "getCurrentWeatherByLatLon",
      description: "Get current weather by latitude and longitude",
      parameters: {
        type: "object",
        properties: {
          units: {
            type: "string",
            description:
              "Units for temperature. 'metric' for Celsius, 'imperial' for Fahrenheit. Only provide this parameter when user asked to change units.",
          },
        },
        required: [],
      },
    },
    {
      name: "getFiveDayForecastByLatLon",
      description: "Get five day weather forecast by latitude and longitude",
      parameters: {
        type: "object",
        properties: {
          units: {
            type: "string",
            description:
              "Units for temperature. 'metric' for Celsius, 'imperial' for Fahrenheit. Only provide this parameter when user asked to change units.",
          },
        },
        required: [],
      },
    },
  ];
}

async function getCurrentWeatherByLatLon(context, { units } = {}) {
  context.updateStatus("Checking current weather...");
  if (!units) {
    units = (await context.get("units")) || DEFAULT_UNITS;
  } else {
    context.set("units", units);
  }

  try {
    const { latitude, longitude } = await context.getUserLocation();
    const url = `${BASE_URL}weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${units}`;
    const response = await fetch(url);
    const data = await response.json();
    const essentialData = {
      city: data.name,
      description: data.weather[0].description,
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      temp_min: data.main.temp_min,
      temp_max: data.main.temp_max,
    };
    return { result: essentialData, status: "continue" };
  } catch (error) {
    context.updateStatus({ error: "Error fetching current weather" });
  }
}

async function getFiveDayForecastByLatLon(context, { units } = {}) {
  context.updateStatus("Checking weather forecast...");
  if (!units) {
    units = (await context.get("units")) || DEFAULT_UNITS;
  } else {
    context.set("units", units);
  }

  try {
    const { latitude, longitude } = await context.getUserLocation();
    const url = `${BASE_URL}forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${units}`;
    const response = await fetch(url);
    const data = await response.json();
    let essentialData = {
      city: data.city.name,
      list: data.list.map((forecast) => {
        return {
          datetime: forecast.dt_txt,
          temperature: forecast.main.temp,
          feels_like: forecast.main.feels_like,
          min_temp: forecast.main.temp_min,
          max_temp: forecast.main.temp_max,
          weather_main: forecast.weather[0].main,
          weather_description: forecast.weather[0].description,
          wind_speed: forecast.wind.speed,
        };
      }),
    };

    return { result: essentialData, status: "continue" };
  } catch (error) {
    context.updateStatus({ error: "Error fetching 5-day forecast" });
  }
}

export {
  defineFunctions,
  getCurrentWeatherByLatLon,
  getFiveDayForecastByLatLon,
};
