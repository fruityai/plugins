import { RecursiveCharacterTextSplitter } from "https://esm.sh/langchain/text_splitter";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { Readability } from "npm:@mozilla/readability";

export function defineFunctions() {
  return [
    {
      name: "fetchAndSearchUrl",
      description: "Fetch URL and search for relevant content",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "URL to fetch",
          },
          query: {
            type: "string",
            description: "Search query to search in the fetched URL content",
          },
        },
        required: ["url", "query"],
      },
    },
  ];
}

export async function fetchAndSearchUrl(context, { url, query }) {
  try {
    context.updateStatus(`Fetching URL: ${url}`);
    const urlContent = await fetchUrlContent(url);
    const splitter = new RecursiveCharacterTextSplitter();
    const langchainDocs = await splitter.createDocuments([urlContent]);
    await context.addDocuments(langchainDocs);
    const relevantDocuments = await context.getRelevantDocuments({
      query,
      limit: 3,
    });

    return {
      result: JSON.stringify(relevantDocuments),
      status: "continue",
    };
  } catch (error) {
    return { error: error.message || error };
  }
}

async function fetchUrlContent(url) {
  const response = await fetch(url);
  const html = await response.text();
  const document = new DOMParser(html).parseFromString(html, "text/html");
  const reader = new Readability(document);

  return reader.parse()?.textContent;
}
