# Installation

## Google Chrome

### From Chrome Web Store

Install the extension [here](https://chromewebstore.google.com/detail/the-guild-helper/dbnefnepgjnoidmnfinndeamkbbiliok)

### Manual installation

- Clone the repository
- Go to `about:extensions`
- Enable developer mode in the upper right corner
- Click on "Load unpacked extension"
- Choose the directory where you cloned the repo

## Firefox

### From the Firefox Add-on Store

The firefox version is not published on the Firefox store yet.

### Manual installation

- Clone the repository
- Go to `about:debugging#/runtime/this-firefox`
- Click on "Load Temporary Add-on"
- Choose the `manifest.json` file in the directory where you cloned the repository

# Configuration

## Google Chrome

- Right click on extension's icon
- Click `Options`
- Fill in the secret (ask Denis or Valentin).

## Firefox

- Right click on extension's icon
- Click `Manage Extension`
- Go to `Preferences` tab
- Fill in the secret (ask Denis or Valentin).
- In the `Permission` tab, make sure every thing is enabled (data access for `https://github.com` and `https://notion-tasks-dashboard-proxy.theguild.workers.dev` should be present).
