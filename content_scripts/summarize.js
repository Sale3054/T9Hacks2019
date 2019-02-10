function handleResponse(message) {
  console.log(`Message from the background script:  ${message.response}`);
}

function handleError(error) {
  console.log(`Error: ${error}`);
}

function notifyBackgroundPage(e) {
  var sending = browser.runtime.sendMessage({
  	type : "24HrArray"
  });
  sending.then(handleResponse, handleError);  
}

window.addEventListener("click", notifyBackgroundPage);