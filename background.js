function onTabCreation(tab){
	console.log('tab creation event fired')
}

function onTabUpdate(tab){
	console.log('tab update event fired')
}

function onTabRemoval(tab){
	console.log('tab removal event fired')
}

function onTabFocusChange(tab){
	console.log('tab focus change event fired')
}

function getURL(tab){
	var current_url = tab.url
	var url_origin = new URL(current_url).origin
	return url_origin
}
browser.tabs.onCreated.addListener(onTabCreation)
browser.tabs.onUpdated.addListener(onTabUpdate)
browser.tabs.onRemoved.addListener(onTabRemoval)
browser.tabs.onHighlighted.addListener(onTabFocusChange)
