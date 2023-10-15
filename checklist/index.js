export function defineFunctions() {
  return [
    {
      name: "addChecklistItems",
      description: "Adds multiple items to the checklist",
      parameters: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "string",
            },
            description: "The items to add to the checklist",
          },
        },
        required: ["items"],
      },
    },
    {
      name: "markItemsComplete",
      description: "Marks multiple items as complete by id",
      parameters: {
        type: "object",
        properties: {
          itemIds: {
            type: "array",
            items: {
              type: "integer",
            },
            description: "list of item ids",
          },
        },
        required: ["itemIds"],
      },
    },
    {
      name: "getChecklist",
      description: "Gets the entire checklist",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "deleteChecklistItems",
      description: "Deletes multiple items from the checklist by id",
      parameters: {
        type: "object",
        properties: {
          itemIds: {
            type: "array",
            items: {
              type: "integer",
            },
            description: "list of item ids",
          },
        },
        required: ["itemIds"],
      },
    },
  ];
}

export async function initialize(context) {
  const { result } = await getChecklist(context);

  if (result) {
    await context.addSystemMessage(
      `\nHere are all items in the checklist:\n${JSON.stringify(result)}`
    );
  }
}

export async function addChecklistItems(context, { items }) {
  try {
    let checklist = await context.get("checklist");
    if (!checklist) {
      checklist = [];
    }
    items.forEach((item) => {
      checklist.push({ id: checklist.length, item, status: "incomplete" });
    });
    await context.set("checklist", checklist);
    await getChecklist(context);
    const result = `Items added to checklist`;

    return { result: result };
  } catch (error) {
    return { error: error.message };
  }
}

export async function markItemsComplete(context, { itemIds }) {
  try {
    let checklist = await context.get("checklist");
    if (checklist) {
      itemIds.forEach((id) => {
        for (let i = 0; i < checklist.length; i++) {
          if (checklist[i].id === id) {
            checklist[i].status = "complete";
            break;
          }
        }
      });
      await context.set("checklist", checklist);
      await getChecklist(context);
    }
    const result = `Items marked as complete`;

    return { result: result };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getChecklist(context) {
  try {
    let checklist = await context.get("checklist");

    if (!checklist) {
      checklist = [];
      return "Checklist is not found";
    }

    let checklistMarkdown = checklist
      .map((item) =>
        item.status === "complete"
          ? `- [x] ${item.item}\n`
          : `- [ ] ${item.item}\n`
      )
      .join("");
    await context.updateStatus(checklistMarkdown || "Checklist is empty");

    return { result: checklist };
  } catch (error) {
    return { error: error.message };
  }
}

export async function deleteChecklistItems(context, { itemIds }) {
  try {
    let checklist = await context.get("checklist");
    if (checklist) {
      checklist = checklist.filter((item) => !itemIds.includes(item.id));
      await context.set("checklist", checklist);
      await getChecklist(context);
    }
    const result = `Items deleted from checklist`;

    return { result: result };
  } catch (error) {
    return { error: error.message };
  }
}
