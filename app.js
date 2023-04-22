
const CLIENT_ID =
  "904025292181-o39na2eg3pvgl728930kffjnm8phd741.apps.googleusercontent.com";
const API_KEY = "AIzaSyBliuOX-kQgC1Yf9wVOOtgKwaWjr0yVF08";

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC =
  "https://sheets.googleapis.com/$discovery/rest?version=v4";

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";



let spreadsheetId = "1n1iT5Aor9N7Ftf39831nYI5jeZqG3Za4sYwMX-VXdWM";
let readRange = "Parametric Relations!B5:D15";


// ---------------------------------



/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  gapi.load("client", intializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function intializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC]
  });
  gapiInited = true;
  maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: ""
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById("authorize_button").style.visibility = "visible";
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw resp;
    }
    document.getElementById("authorize_button").style.visibility = "hidden";
    document.getElementById("signout_button").style.visibility = "visible";
    document.getElementById("refreshviz_button").style.visibility = "visible";
  };

  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({ prompt: "" });
  }
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken("");
    document.getElementById("content").innerText = "";
    document.getElementById("authorize_button").style.visibility = "visible";
    document.getElementById("signout_button").style.visibility = "hidden";
    document.getElementById("refreshviz_button").style.visibility = "hidden";
  }
}

/**
 * Spreadsheet to open.
 * https://docs.google.com/spreadsheets/d/1n1iT5Aor9N7Ftf39831nYI5jeZqG3Za4sYwMX-VXdWM/edit
 */
async function refreshViz() {
  let response;
  try {
    // Fetch first 10 files
    response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: readRange
    });
  } catch (err) {
    document.getElementById("content").innerText = err.message;
    return;
  }
  const range = response.result;
  if (!range || !range.values || range.values.length == 0) {
    document.getElementById("content").innerText = "No values found.";
    return;
  }
  // Flatten to string to display
  const output = range.values.reduce(
    (str, row) => `${str}${row.join(",")}\n`,
    `${readRange}\n`
  );
  document.getElementById("content").innerText = output;
}

let tokenClient;
let gapiInited = false;
let gisInited = false;

async function main() {
  console.log("do googlesheets");
  gapiLoaded();
  gisLoaded();

  document.getElementById("signout_button").style.visibility = "hidden";
  document.getElementById("refreshviz_button").style.visibility = "hidden";
  document.getElementById("span_spreadsheetId").innerText = `SpreadsheetId: ${spreadsheetId}`;
  document.getElementById("span_readRange").innerText = `ReadRange: ${readRange}`;
}

document.addEventListener("DOMContentLoaded", main);
