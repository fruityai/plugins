# Creating Plugins for Fruity.AI

Fruity.AI plugins are easy to create and deploy and allow to create more interactive chat apps.
These plugins can request to show modals, provide real time feedback and more!

Each plugin you create for Fruity.ai is essentially a set of functions defined in JS file.
These functions are defined in a single module file, which you will upload to the Fruity.ai app. No hosting required!
Plugins run in [Deno](https://deno.land/), a secure runtime for JavaScript and TypeScript. This means you can use modern JavaScript features and import modules directly from URLs.
Plugins can be created in JavaScript or TypeScript.

Here are few examples of plugins:

[Checklist Plugin](checklist/index.js)

[Fetch URL](fetch_url/index.js)

[Giphy](giphy/index.js)

[Weather](weather/index.js)

See more above.

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

- `updateStatus(status)`: This method is used to show a status message or progress in the chat in markdown format. It overrides any existing message.

```javascript
await context.updateStatus("Loading data from API...");
```

- `openModal({ title, content, button })`: This method is used to open a modal dialog in the chat. The `title` parameter is a string representing the title of the modal. The `content` parameter is a string representing the content of the modal. The `button` parameter (optional) is an object with `label` and `link` properties representing the label and link of the button in the modal.

```javascript
context.openModal({
  title: "Account Login",
  content: "Please login to your email account to continue.",
  button: { label: "Login", link: "https://google.com" },
});
```

- `set(key, value)`: This method is used to save a user setting value for a specific chat assistant and the current user. The key is a string that represents the name of the value you want to save. The value can be in JSON format.
  The setting is saved per Assistant/Plugin for current User. So when the user is chatting back to the same assistant in a new chat, the value can be retrieved from previous chat conversations.

```javascript
await context.set("userLocation", { lat: 1.0, lon: 1.0 });
```

- `get(key)`: This method is used to retrieve a value by key. The key is a string that represents the name of the value you want to retrieve.

```javascript
const { lat, lon } = await context.get("userLocation");
```

- `addSystemMessage(message)`: This method is used to add a system message to the chat. The message is an instance of the SystemMessage class.

```javascript
await context.addSystemMessage("Always use metric system");
```

- `addDocuments(docs)`: This method is used to add documents to the chat conversation. The documents are instances of Documents in Langchain library. OpenAI vector embeddings are automatically created for these documents for later use in searching. The `docs` parameter is an array of documents.

- `getRelevantDocuments({ query, limit })`: This method is used to retrieve relevant documents based on a query. The `query` parameter is a string representing the search query. The `limit` parameter is an integer specifying the maximum number of documents to return. The method returns an array of documents.

- `getUserLocation()`: This method is used to get the location of the user as latitude and longitude from the browser.

## Initialize function

- `initialize()`: This special function, if defined in plugin, will be executed first when a new chat is started.
  It's a great place to add some special instructions or system messages. Here's an example:

```javascript
export async function initialize(context) {
  await context.addSystemMessage("Use this database schema: {...}");
}
```

If you don't see the functionality you need in `Context`, please email us at hey@fruity.ai.

We would love to hear from you!
