# Creating Plugins for Fruity.AI

Each plugin you create for Fruity.ai is essentially a set of functions.
These functions are defined in a single module file, which you will upload to the Fruity.ai app.
Plugins run in [Deno](https://deno.land/), a secure runtime for JavaScript and TypeScript. This means you can use modern JavaScript features and import modules directly from URLs.

## Defining Functions

In your plugin file (e.g., index.js), you will define your functions within the `defineFunctions` method. This method should return an array of objects, each representing a function. Each object should have the following properties:

- `name`: The name of the function.
- `description`: A brief description of what the function does.
- `parameters`: An object describing the parameters the function accepts. This includes:
  - `type`: The type of the parameters (usually "object").
  - `properties`: An object describing each parameter, including its type and a brief description.
  - `required`: An array of the names of required parameters.

After defining the function properties in the `defineFunctions` method, you will need to implement the function itself.
Here is an example of a simple plugin:

```javascript
// function definitions
export function defineFunctions() {
  return [
    {
      name: "myFunction",
      description: "Description of my function",
      parameters: {
        type: "object",
        properties: {
          param1: {
            type: "string",
            description: "Description of param1",
          },
          param2: {
            type: "number",
            description: "Description of param2",
          },
        },
        required: ["param1", "param2"],
      },
    },
  ];
}

// Implement your function. The name of the function must match the name in the function definition above.
export async function myFunction(context, { param1, param2 }) {
  try {
    const result = "Hello World";

    return { result: result, status: "continue" };
  } catch (error) {
    return { error: error.message, status: "done" };
  }
}
```

The status "continue" indicates that the result from the function should be first sent to ChatGPT for processing.
If the status is set to "done", then there is no need for ChatGPT to do anything with the result.

## Adding Plugin to the Platform

To add a plugin to the Fruity.ai platform, simply upload the module file (e.g., index.js) containing your defined functions to the app. This can be done under the Developer page.
To add environment variables such as secret keys, you can use the Fruity.ai plugin Secret Keys fields when creating a plugin.

Once you've added the environment variable, you can access it in your Deno code using `Deno.env`. Here's an example:

```javascript
const API_KEY = Deno.env.get("API_KEY");
```

## Using Context

The context object is passed to your function and provides methods for interacting with the Fruity.ai chat UI and building chat conversations.
Here are the methods available in the context object:

- updateStatus(status): This method is used to show a status message or progress in the chat in markdown format. It overrides any existing message.

```javascript
await context.updateStatus("Loading data from API...");
```

- set(key, value): This method is used to save a user setting value for a specific chat assistant and the current user. The key is a string that represents the name of the value you want to save. The value can be in JSON format.

```javascript
await context.set("userLocation", { lat: 1.0, lon: 1.0 });
```

- get(key): This method is used to retrieve a value by key. The key is a string that represents the name of the value you want to retrieve.

```javascript
const { lat, lon } = await context.get("userLocation");
```

- addSystemMessage(message): This method is used to add a system message to the chat. The message is an instance of the SystemMessage class.

```javascript
await context.addSystemMessage("Always use metric system");
```

- getUserLocation(): This method is used to get the location of the user as latitude and longitude from the browser.
