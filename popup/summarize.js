/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  document.addEventListener("click", (e) => {
  	requestDate(e);

    /** take the text from the buttons, and return the appropriate message
    * format based on that input
    **/
    function buttonTextToDateRange(buttonText) {
      switch (buttonText) {
        case "Daily":
          return '1day';
        case "Weekly":
          return '1week';
        case "Monthly":
          return '1month';
        case "3 Months":
          return '3month';
        case "6 Months":
          return '6month';
        case "1 Year":
          return '1year';
      }
    }
    /**
    * request a promise from background.js 
    * to retrieve the date range for the relevant time span referred
    * to by buttonTextToDateRange
    **/
    function requestDate(e) {
        let date_range = buttonTextToDateRange(e.target.textContent);
        var sending = browser.runtime.sendMessage({type : date_range});
        sending.then(handleResponse, handleError);
    }

    /**
     * Handle Promise Rejection
     */
    function handleError(error) {
      console.error(`Could not handle: ${error}`);
    }

    /** 
    * Handle Promise Response
    **/
    function handleResponse(message)
    {
      console.log(message)
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


function changeClass(id)
{
  document.getElementById(id).selected = true;
  console.log("Doing something...");
}


/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 **/
listenForClicks();
