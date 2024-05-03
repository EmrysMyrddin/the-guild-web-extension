window.navigation.addEventListener("navigate", async () => {
  if (
    location.pathname.includes("/issues/") ||
    location.pathname.includes("/pull/")
  ) {
    if (document.querySelector(".the-guild__open-in-notion")) {
      return;
    }

    const { notionURL, error, tracked } = await chrome.runtime.sendMessage({
      type: "searchTaskFromGithubURL",
      url: location.href,
    });

    if (!tracked) {
      // We are not in a tracked repository, so we don't want to alter the page
      console.debug("Not a tracked repository, skipping");
      return;
    }

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
      notionButton.href = notionURL;

      header.appendChild(notionButton);

      const stickyHeader = document.querySelector(
        ".sticky-content > div > div"
      );
      stickyHeader.appendChild(notionButton.cloneNode(true));
    }
  }
});
