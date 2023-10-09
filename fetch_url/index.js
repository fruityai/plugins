import { CheerioWebBaseLoader } from "https://esm.sh/langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "https://esm.sh/langchain/text_splitter";
import { HtmlToTextTransformer } from "https://esm.sh/langchain/document_transformers/html_to_text";

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

    const langchainDocs = await fetchAndTranformToDocuments(url);
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
    return { error: error.message || error, status: "done" };
  }
}

async function fetchAndTranformToDocuments(url) {
  const loader = new CheerioWebBaseLoader(url);
  const docs = await loader.load();
  const splitter = RecursiveCharacterTextSplitter.fromLanguage("html");
  const transformer = new HtmlToTextTransformer();
  const sequence = splitter.pipe(transformer);

  return await sequence.invoke(docs);
}
