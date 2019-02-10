var interval_url = undefined
var interval_timestamp = Date.now()
var current_timestamp = undefined
var current_day = undefined

var time_intervals = {}
var total_times = {}
var alltime_per_site = undefined
var alltime_per_day = undefined
var unique_days = undefined

var array_zeroes = []

for (let i = 0; i < 24; i++)
{
	array_zeroes.push(0)
}

var milliseconds_in_day = 1000 * 60 * 60 * 24
var milliseconds_in_week = milliseconds_in_day * 7
var milliseconds_in_month = milliseconds_in_day * 30
var milliseconds_in_year = milliseconds_in_day * 365

function updateDay()
{
	var updated_day = new Date().toISOString().slice(0, 10)
	if (updated_day !== current_day)
	{
		current_day = updated_day
		current_timestamp = new Date(updated_day)
		for (day in unique_days)
		{
			if (current_timestamp - new Date(day) > milliseconds_in_year)
			{
				browser.storage.local.remove(day).then(
					() => {}, (e) => {console.log(e)}
				)
				// TODO remove element from unique_days, update the storage!
			}
			if (current_timestamp - new Date(day) > milliseconds_in_week)
			{
				browser.storage.local.remove(day + '-intervals').then(
					() => {}, (e) => {console.log(e)}
				)
			}
		}
	}
}

Object.filter = function(obj, predicate) {
    var result = {}, key
    for (key in obj) {
        if (obj.hasOwnProperty(key) && !predicate(obj[key])) {
            result[key] = obj[key]
        }
    }
    return result;
}

browser.storage.local.get('unique_days').then(
	(item) => {unique_days = item}, 
	(error) => {unique_days = {}}
)

updateDay()

for (day in unique_days)
{
	browser.storage.local.get(day).then(
		(item) => {total_times[day] = item},
		(error) => {} // TODO
	)
	if (new Date() - new Date(day) < milliseconds_in_week)
	{
		browser.storage.local.get(day + '-intervals').then(
			(item) => {time_intervals[day] = item},
			(error) => {} // TODO
		)
	}
}

browser.storage.local.get('alltime_per_site').then(
	(item) => {total_times['alltime_per_site'] = item},
	(error) => {} // TODO	
)

browser.storage.local.get('alltime_per_day').then(
	(item) => {total_times['alltime_per_day'] = item},
	(error) => {} // TODO	
)

function startNewTimeInterval(url)
{
	// don't create intervals for internal firefox tabs
	if (url !== "null")
	{
		console.log('Starting a new time interval for ' + url)
		interval_url = url
		interval_timestamp = Date.now()	
	}
}

function stopCurrentTimeInterval()
{
	// if we're not actually on a page right now, don't add a new time interval
	if (interval_url !== undefined)
	{
		console.log('Stopping the time interval for ' + interval_url)
		var end_timestamp = Date.now() // TODO don't use current_day here? we could have a session that spans multiple days
		if (time_intervals[current_day] === undefined)
		{
			time_intervals[current_day] = {}
		}
		if (time_intervals[current_day][interval_url] === undefined)
		{
			time_intervals[current_day][interval_url] = []	
		}
		time_intervals[current_day][interval_url].push([active_timestamp, end_timestamp])
		if (total_times[current_day] === undefined)
		{
			total_times[current_day] = {}
		}
		if (total_times[current_day][interval_url] === undefined)
		{
			total_times[current_day] = array_zeroes.slice(0) // duplicate the array
		}
		// find the indices of total_times[current_day][interval_url] to add to,
		// add to those indices
		interval_url = undefined
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
	if (tab.status === "complete" && tab_url !== interval_url && tab.active)
	{
		stopCurrentTimeInterval()
		startNewTimeInterval(tab_url)
	}
}

function onTabRemoval(tabID, removeInfo)
{
	stopCurrentTimeInterval()
	interval_url = undefined
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

function convertMSToTime(ms_time)
{

	// round off the appropriate number of MS at each step
	var milliseconds = parseInt((ms_time%1000)/100),
		seconds = parseInt((ms_time % 1000) %60),
		minutes = parseInt((ms_time %(1000*60)) % 60),	
		hours = parseInt((ms_time ^ (1000* 60 * 60) %24));

	//roll over to tens for a display like 10:01:99 instead of 10:1:99
	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds: seconds;
	//return the result
	return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

function databaseQueryResponder(request, sender, sendResponse)
{
	var current_timestamp = new Date(current_day)
	if (request.type === "1day")
	{
		sendResponse(total_times.filter((key) => {return current_timestamp === new Date(key)}))
	}
	else if (request.type === "1week")
	{
		sendResponse(total_times.filter((key) => {return current_timestamp - new Date(key) < milliseconds_in_week}))
	}
	else if (request.type === "1month")
	{
		sendResponse(total_times.filter((key) => {return current_timestamp - new Date(key) < milliseconds_in_month}))
	}
	else if (request.type === "3month")
	{
		sendResponse(total_times.filter((key) => {return current_timestamp - new Date(key) < milliseconds_in_month * 3}))
	}
	else if (request.type === "6month")
	{
		sendResponse(total_times.filter((key) => {return current_timestamp - new Date(key) < milliseconds_in_month * 6}))
	}
	else if (request.type === "1year")
	{
		sendResponse(total_times.filter((key) => {return current_timestamp - new Date(key) < milliseconds_in_year}))
	}
	else if (request.type === "alltimesite")
	{
		sendResponse(alltime_per_site)
	}
	else if (request.type === "alltimeday")
	{
		sendResponse(alltime_per_day)
	}
}

browser.tabs.onCreated.addListener(onTabCreation)
browser.tabs.onUpdated.addListener(onTabUpdate)
browser.tabs.onRemoved.addListener(onTabRemoval)
browser.tabs.onHighlighted.addListener(onTabHighlight)

browser.runtime.onMessage.addListener(databaseQueryResponder)