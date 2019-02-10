var active_url = undefined
var active_timestamp = Date.now()
var current_day = undefined

var time_intervals = {}
var total_times = {}
var unique_days = undefined

var array_zeroes = []

for (let i = 0; i < 24; i++)
{
	array_zeroes.push(0)
}

var milliseconds_in_day = 1000 * 60 * 60 * 24
var milliseconds_in_week = milliseconds_in_day * 7
var milliseconds_in_year = milliseconds_in_day * 365

function updateDay()
{
	var real_day = new Date().toISOString().slice(0, 10)
	if (real_day !== current_day)
	{
		current_day = real_day
		real_day_obj = new Date(real_day)
		for (day in unique_days)
		{
			if (real_day_obj - new Date(day) > milliseconds_in_year)
			{
				browser.storage.local.remove(day).then(
					() => {}, (e) => {console.log(e)}
				)
			}
			if (real_day_obj - new Date(day) > milliseconds_in_week)
			{
				browser.storage.local.remove(day + '-intervals').then(
					() => {}, (e) => {console.log(e)}
				)
			}
		}
	}
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
			(item) => {total_times[day] = item},
			(error) => {} // TODO
		)
	}
}

var alltime_data_promise = browser.storage.local.get('alltime-values').then(
	(item) => {total_times['alltime-values'] = item},
	(error) => {} // TODO	
)

function startNewTimeInterval(url)
{
	// don't create intervals for internal firefox tabs
	if (url !== "null")
	{
		console.log('Starting a new time interval for ' + url)
		active_url = url
		active_timestamp = Date.now()	
	}
}

function stopCurrentTimeInterval()
{
	// if we're not actually on a page right now, don't add a new time interval
	if (active_url !== undefined)
	{
		console.log('Stopping the time interval for ' + active_url)
		var end_timestamp = Date.now()
		// TODO refactor the storage mechanism based on new mechanisms
		// if (time_intervals[active_url] === undefined)
		// {
		// 	time_intervals[active_url] = []
		// }
		// time_intervals[active_url].push([active_timestamp, end_timestamp])
		// if (total_times[active_url] === undefined)
		// {
		// 	total_times[active_url] = end_timestamp - active_timestamp
		// }
		// else
		// {
		// 	total_times[active_url] += end_timestamp - active_timestamp		
		// }
		// active_url = undefined
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

browser.tabs.onCreated.addListener(onTabCreation)
browser.tabs.onUpdated.addListener(onTabUpdate)
browser.tabs.onRemoved.addListener(onTabRemoval)
browser.tabs.onHighlighted.addListener(onTabHighlight)
