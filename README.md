# Creating Plugins for Fruity.ai

Each plugin you create for Fruity.ai is essentially a set of functions that run in [Deno](https://deno.land/), a secure runtime for JavaScript and TypeScript. This means you can use modern JavaScript features and import modules directly from URLs.
These functions are defined in a single module file, which you will upload to the Fruity.ai app. This modular approach allows you to extend the capabilities of the platform to meet your specific needs. The following sections will guide you through the process of defining these functions and using the context object.

## Defining Functions

In your plugin file (e.g., index.js), you will define your functions within the `registerFunctions` method. This method should return an array of objects, each representing a function. Each object should have the following properties:

- `name`: The name of the function.
- `description`: A brief description of what the function does.
- `parameters`: An object describing the parameters the function accepts. This includes:
  - `type`: The type of the parameters (usually "object").
  - `properties`: An object describing each parameter, including its type and a brief description.
  - `required`: An array of the names of required parameters.

After defining the function properties in the `registerFunctions` method, you will need to implement the function itself. Here is an example of how to format a function definition:

```javascript
// functions defenitions
export function registerFunctions() {
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

// Implement your function. Name of function must match the name in function defenition above
export async function myFunction(context, { param1, param2 }) {
  try {
    // Implement your logic here

    return { result: result, status: "continue" };
  } catch (error) {
    return { error: error.message, status: "done" };
  }
}
```

## Adding Plugin to the Platform

To add plugin to the Fruity.ai platform, simply upload the module file (e.g., `index.js`) containing your defined functions to the app. This can be done under the Developer page.
To add environment variables such as secret keys, you can use the Fruity.ai plugin Secret Keys fields when creating a plugin.

Once you've added the environment variable, you can access it in your Deno code using `Deno.env`. Here's an example:

```javascript
const API_KEY = Deno.env.get("API_KEY");
```

## Using Context

The context object is passed to your function and provides methods for interacting with the Fruity.ai platform. For example, you can use `context.updateStatus` to send a status update.

Creating plugins for Fruity.ai is easy and flexible. By defining functions, using the context, and running your code in Deno, you can extend the platform's capabilities to meet your needs.
