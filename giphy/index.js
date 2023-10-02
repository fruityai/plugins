const API_KEY = Deno.env.get("API_KEY");
const BASE_URL = "http://api.giphy.com/v1/gifs/";

export function defineFunctions() {
  return [
    {
      name: "searchGIF",
      description: "Search for GIF",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Short search query, max 50 characters",
          },
        },
        required: ["query"],
      },
    },
  ];
}

export async function searchGIF(_context, { query }) {
  const randomIndex = Math.floor(Math.random() * 5) + 1;
  const words = query.split(" ");
  const encodedQuery = words.slice(0, 4).join("+");

  const url = `${BASE_URL}search?rating=r&api_key=${API_KEY}&limit=5&offset=${randomIndex}&q=${encodedQuery}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.data.length > 0) {
      return {
        result: `Show this image as markdown: ![Gif](${data.data[0].images.fixed_width.url})`,
        status: "continue",
      };
    } else {
      return { result: "No gifs found", status: "continue" };
    }
  } catch (error) {
    return { error: "Error fetching gifs", status: "done" };
  }
}
