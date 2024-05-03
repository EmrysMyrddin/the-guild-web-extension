chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "searchTaskFromGithubURL") {
    searchTaskFromGithubURL(message.url)
      .then(sendResponse)
      .catch((err) => {
        console.error(err);
        sendResponse({ error: err.message });
      });
    return true;
  }
});

/**
 * Search for the associated task in Notion
 * @param {string} url The Github URL that should be present in "External Link" Notion task property
 *
 * @returns {Promise<string>} The associated Notion task URL
 */
async function searchTaskFromGithubURL(url) {
  const { secretKey } = await chrome.storage.local.get();

  if (!secretKey) {
    console.error(
      "No secret key found. Please set it in the extension options."
    );
    return {
      error: "No secret key found. Please set it in the extension options.",
      tracked: true,
    };
  }

  const trackedLibraries = await listTrackedLibraries();
  if (!trackedLibraries.some((repoURL) => url.startsWith(repoURL))) {
    console.log("Not a tracked repository: ", url, trackedLibraries);
    return { tracked: false };
  }

  const notionURL = await getTaskUrl(url);
  if (!notionURL) {
    console.log("No task found in Notion for this issue: ", url);
    return { error: "No task found in Notion for this issue." };
  }

  return { notionURL, tracked: true };
}

/**
 * Search for the associated task in Notion
 * @param {string} url The Github URL that should be present in "External Link" Notion task property
 *
 * @returns {Promise<string>} The associated Notion task URL
 */
async function getTaskUrl(url) {
  const { [url]: cachedTaskURL } = await chrome.storage.session.get(url);
  if (cachedTaskURL) {
    return cachedTaskURL;
  }

  const result = await query("9cd3148ef6354e19ada9f910b5a9ea57", {
    filter: {
      property: "External Link",
      url: {
        equals: url,
      },
    },
  });

  const notionURL = result?.results?.[0]?.url;
  if (notionURL) {
    chrome.storage.session.set({ [url]: notionURL });
  }
  console.debug("Notion task URL fetched: ", notionURL);
  return notionURL;
}

/**
 * List the tracked libraries repositories
 *
 * @returns {Promise<string[]>} The list of tracked libraries Github urls
 */
async function listTrackedLibraries() {
  const { trackedLibrariesURLs } = await chrome.storage.session.get(
    "trackedLibrariesURLs"
  );
  if (trackedLibrariesURLs) {
    return trackedLibrariesURLs;
  }

  const result = await query("d90c28b1672b4cd3947cafe4b9fa338e", {
    filter: {
      property: "Sync GitHub?",
      checkbox: {
        equals: true,
      },
    },
  });

  const urls = result?.results?.map(
    (result) => result.properties.Repository.url
  );

  if (urls) {
    chrome.storage.session.set({ trackedLibrariesURLs: urls });
  }

  console.debug("Tracked libraries URLs fetched: ", urls);

  return urls;
}

/**
 * Query a Notion database
 * @param {string} database The database ID
 * @param {object} body The body of the query, containing the filter, sort, pagination, etc.
 *
 * @returns {Promise<object>} The entire response from the Notion API
 */
async function query(database, body = {}) {
  console.debug("Querying Notion:", database, body);

  const { secretKey } = await chrome.storage.local.get();

  const response = await fetch(
    `https://notion-tasks-dashboard-proxy.theguild.workers.dev/api/notion/v1/databases/${database}/query`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${secretKey}`,
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    console.error(
      "Failed to fetch issue task from Notion API: ",
      await response.text()
    );
    throw new Error("Failed to fetch issue task from Notion API");
  }

  const result = await response.json();
  console.debug("Notion response:", result);
  return result;
}
