chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "searchIssueTask") {
    searchTask(message.issueURL)
      .then(sendResponse)
      .catch(() => sendResponse(null));
    return true;
  }
});

/** Search for the associated task in Notion
 *
 * @param {string} issueURL
 */
async function searchTask(issueURL) {
  const { secretKey } = await chrome.storage.local.get("secretKey");

  if (!secretKey) {
    return {
      error: "No secret key found. Please set it in the extension options.",
    };
  }

  const response = await fetch(
    "https://notion-tasks-dashboard-proxy.theguild.workers.dev/api/notion/v1/databases/9cd3148ef6354e19ada9f910b5a9ea57/query",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${secretKey}`,
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        filter: {
          property: "External Link",
          url: {
            equals: issueURL,
          },
        },
      }),
    }
  );

  if (!response.ok) {
    console.error(
      "Failed to fetch issue task from Notion API: ",
      await response.text()
    );
  }

  const result = await response.json();
  return { notionUrl: result?.results?.[0]?.url };
}
