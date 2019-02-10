/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  document.addEventListener("click", (e) => {
  	requestDate(e);

    /**
     * Given the name of a beast, get the URL to the corresponding image.
     */
    function buttonTextToDateRange(buttonText) {
      switch (buttonText) {
        case "Daily":
          return '1day';
        case "Weekly":
          return '1week';
        case "Monthly":
          return '1month';
        case "3 Months":
          return '1year';
        case "6 Months":
          return '6month';
        case "1 Year":
          return '1year';
      }
    }

    /**
     * Insert the page-hiding CSS into the active tab,
     * then get the beast URL and
     * send a "beastify" message to the content script in the active tab.
     */
    function requestDate(e) {
    	console.log("Creating dead object");
        let date_range = buttonTextToDateRange(e.target.textContent);
        var sending = browser.runtime.sendMessage({type : date_range});
        sending.then(handleResponse, handleError);
    }

    /**
     * Just log the error to the console.
     */
    function handleError(error) {
      console.error(`Could not handle: ${error}`);
    }

    function handleResponse(message)
    {
    	console.log(`Message from the background script: ${message.response}`);
    }
  });
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error)
{
  document.querySelector("#popup-content").classList.add("hidden");
  document.querySelector("#error-content").classList.remove("hidden");
  console.error(`Failed to execute content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 **/
listenForClicks();