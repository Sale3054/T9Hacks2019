var myChart = undefined
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
      function add(a,b)
      {
        return a + b;
      }
      /* 
      Doubly nested dictionary; first key is date:
      Second Key : Val combo is 
      Website Host : Numbers => cumulative miliseconds spent by hour
      */
      if (myChart !== undefined)
      {
        destroyChart();
      }
      var top_10_sites = 0;
      var ctx = document.getElementById("myChart").getContext('2d');
      var site_dict = {};
      for (var day in message)
      {
        for (var site in message[day])
        {
          if (site_dict[site] === undefined)
          {
            site_dict[site] = message[day][site].reduce(add, 0);
          }
          else
          {
            site_dict[site] += message[day][site].reduce(add, 0);
          }
        }
      }
      site_kv_pairs = Object.entries(site_dict);
      var keys = [];
      var times_to_sites = {}
      for(i = 0; i < site_kv_pairs.length; i++)
      {
        keys.push(site_kv_pairs[i][1]);
        times_to_sites[site_kv_pairs[i][1]] = site_kv_pairs[i][0]
      }

      keys.sort((a, b) => {return a - b}).reverse()
      var labels = []
      var dataum = []

      for(i = 0; i < 10; i ++)
      {
        if(keys[i] === undefined)
        {
          break;
        }
        dataum.push(keys[i]/1000/60);
        labels.push(times_to_sites[keys[i]]);
      }

      myChart = new Chart(ctx, {
          type: 'horizontalBar',
          data: {
              labels: labels,
              datasets: [{
                  label: 'popularly visited sites',
                  data: dataum,
                  backgroundColor: [
                      'rgba(255, 99, 132, 0.2)',
                      'rgba(54, 162, 235, 0.2)',
                      'rgba(255, 206, 86, 0.2)',
                      'rgba(75, 192, 192, 0.2)',
                      'rgba(153, 102, 255, 0.2)',
                      'rgba(255, 159, 64, 0.2)',
                      'rgba(255, 206, 86, 0.2)',
                      'rgba(75, 192, 192, 0.2)',
                      'rgba(153, 102, 255, 0.2)',
                      'rgba(255, 159, 64, 0.2)',

                  ],
                  borderColor: [
                      'rgba(255,99,132,1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                      'rgba(153, 102, 255, 1)',
                      'rgba(255, 159, 64, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                      'rgba(153, 102, 255, 1)',
                      'rgba(255, 159, 64, 1)',

                  ],

                  borderWidth: 1
              }],
          },
          options: {
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero:true
                      }
                  }]
              }
          }
      });
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

var _lastTarget = "btn1"


// Fixes our memory leaks
function destroyChart()
{
  if (myChart !== undefined)
  {
    myChart.destroy();
  }

}

// handles tab selection
function changeSelected(e)
{
    var old_target_obj = document.getElementById(_lastTarget)
    old_target_obj.className = old_target_obj.className.replace('selected', '');
    e.target.className += " selected";
    _lastTarget = e.target.id;
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

window.addEventListener("unload", destroyChart);
var btn_list = ["btn1", "btn2", "btn3", "btn4", "btn5", "btn6"];
for (button of btn_list)
{
    document.getElementById(button).addEventListener("click", changeSelected);   
}

document.getElementById("btn1").click()
