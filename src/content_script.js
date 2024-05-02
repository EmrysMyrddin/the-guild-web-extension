console.log("Hello from content_script.js!");
console.log(location.pathname);

window.navigation.addEventListener("navigate", async () => {
  const issueNumber = location.pathname.split("/issues/")[1];
  if (issueNumber) {
    if (document.querySelector(".the-guild__open-in-notion")) {
      return;
    }

    const { notionUrl, error } = await chrome.runtime.sendMessage({
      type: "searchIssueTask",
      issueURL: location.href,
    });

    const header = document.querySelector(
      "#partial-discussion-header .gh-header-meta"
    );

    const logo = document.createElement("img");
    logo.style.height = "100%";
    logo.src =
      "https://brandlogos.net/wp-content/uploads/2022/07/notion-logo_brandlogos.net_uiish.png";

    if (error) {
      const errorElement = document.createElement("div");
      errorElement.textContent = error;
      errorElement.className = "mb-2 ml-2 text-bold d-flex flex-items-center";
      errorElement.style.height = "2em";
      errorElement.style.color = "var(--fgColor-danger)";
      errorElement.insertBefore(logo, errorElement.firstChild);
      header.appendChild(errorElement);
    } else {
      const notionButton = document.createElement("a");
      notionButton.textContent = "Open in Notion";
      notionButton.insertBefore(logo, notionButton.firstChild);
      notionButton.className =
        "the-guild__open-in-notion Button--primary Button--small Button mb-2 ml-2";
      notionButton.target = "_blank";
      notionButton.href = notionUrl;
      header.appendChild(notionButton);
    }
  }
});
