function handleResponse(message) {
  console.log(`Message from the background script:  ${message.response}`);
}

function handleError(error) {
  console.log(`Error: ${error}`);
}


function requestDay(e, time)
{
	var sending = browser.runtime.sendMessage({ type : 'day'});
	sending.then(handleResponse, handleError);
}
window.addEventListener("click", notifyBackgroundPage);