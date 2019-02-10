var _lastTarget = "btn1"
var ctx = document.getElementById("myChart").getContext('2d');
var myChart = new Chart(ctx, {
    type: 'horizontalBar',
    data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3],
            // backgroundColor: [
            //     'rgba(255, 99, 132, 0.2)',
            //     'rgba(54, 162, 235, 0.2)',
            //     'rgba(255, 206, 86, 0.2)',
            //     'rgba(75, 192, 192, 0.2)',
            //     'rgba(153, 102, 255, 0.2)',
            //     'rgba(255, 159, 64, 0.2)'
            // ],
            // borderColor: [
            //     'rgba(255,99,132,1)',
            //     'rgba(54, 162, 235, 1)',
            //     'rgba(255, 206, 86, 1)',
            //     'rgba(75, 192, 192, 1)',
            //     'rgba(153, 102, 255, 1)',
            //     'rgba(255, 159, 64, 1)'
            // ],
            borderWidth: 1
        }]
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

// Fixes our memory leaks
function destroyChart()
{
	myChart.destroy();
}

// handles tab selection
function changeSelected(e)
{
    var old_target_obj = document.getElementById(_lastTarget)
    old_target_obj.className = old_target_obj.className.replace('selected', '');
    e.target.className += " selected";
    _lastTarget = e.target.id;
}

window.addEventListener("unload", destroyChart);
var btn_list = ["btn1", "btn2", "btn3", "btn4", "btn5", "btn6"];
for (button of btn_list)
{
    document.getElementById(button).addEventListener("click", changeSelected);   
}


var blah = site_dict.entries()
var blah2 = []
for (i = 0; i < blah.length; i++)
{
    blah2.push(blah[i].reverse())
}
blah2.sort().reverse()
var labels = []
var data = []
for (i = 0; i < 10; i++)
{
    if (blah2[i] === undefined)
    {
        break
    }
    else 
    {
        data.push(blah2[i][0])
        labels.push(blah2[i][1])
    }
}