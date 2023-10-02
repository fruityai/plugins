export function defineFunctions() {
  return [
    {
      name: "sayHello",
      description: "function that says hello to a person",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "name of the person to say hello to",
          },
        },
        required: ["name"],
      },
    },
  ];
}

export function sayHello(context, { name }) {
  context.updateStatus("Saying hello to " + name);
  return `Hello ${name}!`;
}
