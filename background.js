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

browser.tabs.onCreated.addListener(onTabCreation)
browser.tabs.onUpdated.addListener(onTabUpdate)
browser.tabs.onRemoved.addListener(onTabRemoval)
browser.tabs.onHighlighted.addListener(onTabFocusChange)
