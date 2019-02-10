var interval_url = undefined
var interval_timestamp = new Date()
var current_timestamp = undefined
var current_day = undefined

var array_zeroes = []

for (let i = 0; i < 24; i++)
{
	array_zeroes.push(0)
}

var time_intervals = {}
var total_times = {}
var alltime_per_site = {}
var alltime_per_day = array_zeroes.slice(0)
var unique_days = undefined

var milliseconds_in_day = 1000 * 60 * 60 * 24
var milliseconds_in_week = milliseconds_in_day * 7
var milliseconds_in_month = milliseconds_in_day * 30
var milliseconds_in_year = milliseconds_in_day * 365

browser.storage.local.get('unique_days').then(
	// (item) => {unique_days = []; updateDay()},
	(item) => {unique_days = item['unique_days']; updateDay()}, 
	(error) => {unique_days = []; updateDay()}
)

function updateDay()
{
	var updated_day = new Date().toISOString().slice(0, 10)
	if (updated_day !== current_day)
	{
		current_day = updated_day
		if (!unique_days.includes(updated_day))
		{
			current_timestamp = new Date(updated_day)
			var indices_to_erase = []
			unique_days.push(current_day)
			for (let i = 0; i < unique_days.length; i++)
			{
				if (current_timestamp - new Date(unique_days[i]) > milliseconds_in_year)
				{
					browser.storage.local.remove(unique_days[i]).then(
						() => {}, (e) => {console.log(e)}
					)
					indices_to_erase.push(i)
				}
				if (current_timestamp - new Date(unique_days[i]) > milliseconds_in_week)
				{
					browser.storage.local.remove(unique_days[i] + '-intervals').then(
						() => {}, (e) => {console.log(e)}
					)
				}
			}
			for (let j = unique_days.length - 1; j >= 0; j--)
			{
				if (j === indices_to_erase[indices_to_erase.length - 1])
				{
					unique_days.splice(j, 1)
					indices_to_erase.splice(indices_to_erase.length - 1, 1)
				}
			}
			browser.storage.local.set({'unique_days' : unique_days})
		}
	}
	retrieveDatabaseInfo()
}

function retrieveDatabaseInfo()
{
	for (day of unique_days)
	{
		browser.storage.local.get(day).then(
			// (item) => {},
			(item) => {total_times[day] = item[day]},
			(error) => {total_times[day] = {}}
		)
		if (new Date() - new Date(day) < milliseconds_in_week)
		{
			browser.storage.local.get(day + '-intervals').then(
				// (item) => {},
				(item) => {time_intervals[day] = item[day]},
				(error) => {time_intervals[day] = {}}
			)
		}
	}

	browser.storage.local.get('alltime_per_site').then(
		// (item) => {},
		(item) => {alltime_per_site = item['alltime_per_site']},
		(error) => {console.log(error)}
	)

	browser.storage.local.get('alltime_per_day').then(
		// (item) => {},
		(item) => {alltime_per_day = item['alltime_per_day']},
		(error) => {console.log(error)}
	)
}

function objectFilter(obj, predicate) {
    var result = {}, key
    for (key in obj) {
        if (obj.hasOwnProperty(key) && !predicate(obj[key])) {
            result[key] = obj[key]
        }
    }
    return result;
}

function startNewTimeInterval(url)
{
	// don't create intervals for internal firefox tabs
	if (url !== "null")
	{
		console.log('Starting a new time interval for ' + url)
		interval_url = url
		interval_timestamp = new Date()
	}
}

function stopCurrentTimeInterval()
{
	// if we're not actually on a page right now, don't add a new time interval
	if (interval_url !== undefined)
	{
		console.log('Stopping the time interval for ' + interval_url)
		var end_timestamp = new Date()
		if (time_intervals[current_day] === undefined)
		{
			time_intervals[current_day] = {}
		}
		if (time_intervals[current_day][interval_url] === undefined)
		{
			time_intervals[current_day][interval_url] = []	
		}
		time_intervals[current_day][interval_url].push([interval_timestamp.getTime(), end_timestamp.getTime()])
		browser.storage.local.set({[current_day + '-intervals'] : time_intervals[current_day]}).then(
			() => {}, (error) => {console.log(error)}
		)

		var temp_timestamp = interval_timestamp
		var firstIteration = false
		while (temp_timestamp < end_timestamp)
		{
			current_day = temp_timestamp.toISOString().slice(0, 10)
			if (total_times[current_day] === undefined)
			{
				total_times[current_day] = {}
			}
			if (total_times[current_day][interval_url] === undefined)
			{
				total_times[current_day][interval_url] = array_zeroes.slice(0) // duplicate the array
			}
			let milliseconds_to_add = ((end_timestamp - temp_timestamp) > 1000 * 60 * 60) ? 1000 * 60 * 60 : end_timestamp - temp_timestamp
			total_times[current_day][interval_url][temp_timestamp.getHours()] += milliseconds_to_add
			
			browser.storage.local.set({[current_day] : total_times[current_day]}).then(
				() => {}, (error) => {console.log(error)}
			)

			if (alltime_per_site[interval_url] === undefined)
			{
				alltime_per_site[interval_url] = milliseconds_to_add
			}
			else
			{
				alltime_per_site[interval_url] += milliseconds_to_add
			}

			alltime_per_day[temp_timestamp.getHours()] += milliseconds_to_add

			browser.storage.local.set({'alltime_per_site' : alltime_per_site}).then(
				() => {}, (error) => {console.log(error)}
			)
			browser.storage.local.set({'alltime_per_day' : alltime_per_day}).then(
				() => {}, (error) => {console.log(error)}
			)

			temp_timestamp.setHours(temp_timestamp.getHours() + 1)
			if (!firstIteration)
			{
				temp_timestamp.setMinutes(0)
				temp_timestamp.setSeconds(0)
				temp_timestamp.setMilliseconds(0)
				firstIteration = false
			}
		}
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
	console.log(request.type)
	var current_timestamp = new Date(current_day)
	if (request.type === "1day")
	{
		sendResponse(objectFilter(total_times, (key) => {return current_timestamp === new Date(key)}))
	}
	else if (request.type === "1week")
	{
		sendResponse(objectFilter(total_times, (key) => {return current_timestamp - new Date(key) < milliseconds_in_week}))
	}
	else if (request.type === "1month")
	{
		sendResponse(objectFilter(total_times, (key) => {return current_timestamp - new Date(key) < milliseconds_in_month}))
	}
	else if (request.type === "3month")
	{
		sendResponse(objectFilter(total_times, (key) => {return current_timestamp - new Date(key) < milliseconds_in_month * 3}))
	}
	else if (request.type === "6month")
	{
		sendResponse(objectFilter(total_times, (key) => {return current_timestamp - new Date(key) < milliseconds_in_month * 6}))
	}
	else if (request.type === "1year")
	{
		sendResponse(objectFilter(total_times, (key) => {return current_timestamp - new Date(key) < milliseconds_in_year}))
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
