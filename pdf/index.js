export function defineFunctions() {
  return [
    {
      name: "searchAttachedFile",
      description: "Searches the content of an attached file",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query",
          },
        },
        required: ["query"],
      },
    },
  ];
}

export async function initialize(context) {
  context.enableFileAttachments();
}

export async function searchAttachedFile(context, { query }) {
  context.updateStatus(`Searching attached files for: ${query}...`);
  const result = await context.getRelevantDocuments({ query });

  return { result: result, status: "continue" };
}
