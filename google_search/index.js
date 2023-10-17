import { RecursiveCharacterTextSplitter } from "https://esm.sh/langchain/text_splitter";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { Readability } from "npm:@mozilla/readability";

const API_KEY = Deno.env.get("API_KEY");
const CX_ID = Deno.env.get("CX_ID");
const GOOGLE_SEARCH_RESULT_LIMIT = 3;
const RELEVANT_SNIPPETS_LIMIT = 5;
const PAGE_LOAD_TIMEOUT = 2000;

export function defineFunctions() {
  return [
    {
      name: "googleSearch",
      description: "Performs a Google search",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query",
          },
        },
        required: ["query"],
      },
    },
  ];
}

export async function googleSearch(context, { query }) {
  try {
    context.updateStatus(`Searching Google for "${query}"...`);
    const searchResults = await fetchGoogleSearchResults(query);
    if (!searchResults) {
      return { error: "No results found" };
    }

    context.updateStatus(
      `Checking websites:  \n${searchResults
        .map((item) => item.link)
        .join("  \n")}`
    );
    await processSearchResults(context, searchResults);
    const relevantDocuments = await context.getRelevantDocuments({
      query,
      limit: RELEVANT_SNIPPETS_LIMIT,
    });

    return {
      result: JSON.stringify(relevantDocuments),
      status: "continue",
    };
  } catch (error) {
    return { error: error.message };
  }
}

async function fetchGoogleSearchResults(query) {
  const res = await fetch(
    `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX_ID}&q=${query}&num=${GOOGLE_SEARCH_RESULT_LIMIT}`
  );
  const data = await res.json();
  return data.items;
}

async function processSearchResults(context, searchResults) {
  const promises = searchResults.map(async (item) => {
    const urlContent = await withTimeout(
      fetchUrlContent(item.link),
      PAGE_LOAD_TIMEOUT
    ).catch(() => null);
    if (urlContent) {
      const splitter = new RecursiveCharacterTextSplitter();
      const langchainDocs = await splitter.createDocuments([urlContent]);
      await context.addDocuments(langchainDocs);
    }
  });
  await Promise.allSettled(promises);
}

async function fetchUrlContent(url) {
  const response = await fetch(url);
  const html = await response.text();
  const document = new DOMParser(html).parseFromString(html, "text/html");
  const reader = new Readability(document);

  return reader.parse()?.textContent;
}

function withTimeout(promise, ms) {
  let id;
  let timeout = new Promise((resolve, reject) => {
    id = setTimeout(() => {
      clearTimeout(id);
      reject(`Timed out in ${ms}ms.`);
    }, ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(id));
}
