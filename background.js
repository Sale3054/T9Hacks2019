var active_url = undefined
var active_timestamp = Date.now()

var time_intervals = {} // TODO add persistence between browser sessions
var total_times = {}

function startNewTimeInterval(url)
{
	if (url !== "null")
	{
		console.log('Starting a new time interval for ' + url)
		active_url = url
		active_timestamp = Date.now()	
	}
}

function stopCurrentTimeInterval()
{
	if (active_url !== undefined)
	{
		console.log('Stopping the time interval for ' + active_url)
		var end_timestamp = Date.now()
		if (time_intervals[active_url] === undefined)
		{
			time_intervals[active_url] = []
		}
		time_intervals[active_url].push([active_timestamp, end_timestamp])
		if (total_times[active_url] === undefined)
		{
			total_times[active_url] = end_timestamp - active_timestamp
		}
		else
		{
			total_times[active_url] += end_timestamp - active_timestamp		
		}
		active_url = undefined
	}
}

function onTabCreation(tab)
{
	// don't need to handle tab creation because
	// if the tab is created in the foreground, this will imply a focus change event
	// if the tab is created in the background, then the time spent does not need to be tracked
	// console.log('tab creation event fired')
}

function onTabUpdate(tabID, changeInfo, tab)
{
	console.log('Tab update event fired')
	var tab_url = getURL(tab)
	if (tab.status === "complete" && tab_url !== active_url && tab.active)
	{
		stopCurrentTimeInterval()
		startNewTimeInterval(tab_url)
	}
}

function onTabRemoval(tabID, removeInfo)
{
	stopCurrentTimeInterval()
	active_url = undefined
}

function onTabHighlight(highlightInfo)
{
	// don't need to handle tab focus change because tab focus change implies tab update
}

function getURL(tab)
{
	var current_url = tab.url
	try
	{
		return (new URL(current_url)).origin.replace(new RegExp('https?://'), '')
	}
	catch(err)
	{
		return undefined
	}
}

browser.tabs.onCreated.addListener(onTabCreation)
browser.tabs.onUpdated.addListener(onTabUpdate)
browser.tabs.onRemoved.addListener(onTabRemoval)
browser.tabs.onHighlighted.addListener(onTabHighlight)
