'use strict';

function composeData(model) {
  var data = {
    "Assignments": 0,
    "Sleep": 0,
    "Play": 0
  }
  _.each(model.activities, function(a) {
    data[a.activityType] = data[a.activityType] + parseInt(a.activityDurationInMinutes);
  })

  return data;
}

function renderActivityTable(model) {
  var data = composeData(model);
  var html = "";
  _.each(data, function(total, key) {
    html += "<tr><td>" + key + "</td><td>" + total + "</td>";
  });
  if (model.activities.length == 0) {
    html += "<tr><td colspan=2>You have no activities!</td></tr>";
  }
  document.getElementById("activity-table-body").innerHTML = html;
}

function renderActivityChart(model) {
  var canvas = document.getElementById('activity-graph');
  canvas.width = canvas.width
  var context = canvas.getContext('2d');
  var data = composeData(model);

  // Margin between outer and inner content
  var marginX = 25;
  var marginY = 20;

  // outer content
  var outerTop = 0;
  var outerBottom = canvas.height;
  var outerLeft = 0;
  var outerRight = canvas.width;

  // inner content, within margin, where axes are drawn
  var innerTop = marginY;
  var innerBottom = canvas.height - marginY;
  var innerLeft = marginX;
  var innerRight = canvas.width - marginX;
  var innerWidth = canvas.width - 2 * marginX; // width of inner content within margin
  var innerHeight = canvas.height - 2 * marginY; // height of inner content within margin
  
  // bar config
  var highestBar = _.max(data);
  var barSpacing = 10;
  var barWidth = (canvas.width - 2 * marginX - barSpacing * _.size(data)) / _.size(data);

  renderLine(context, innerLeft, innerTop, innerLeft, innerBottom); // draw y-axis, bottom is higher y value
  renderLine(context, innerLeft, innerBottom, innerRight, innerBottom); // draw x-axis

  var index = 0;
  _.each(data, function(total, key) {

    // Write the bars
    context.fillStyle = "#363636";
    renderBar(context, innerLeft + (index * barWidth) + (index + 1) * barSpacing, innerBottom, barWidth, -(innerHeight * (total / highestBar)), true);
    
    // Add the column title to the x-axis
    context.textAlign = "left";
    context.fillStyle = "#000";
    context.fillText(key, innerLeft + (index * barWidth) + (index + 1) * barSpacing, outerBottom - 5);

    index = index + 1; // increment because each doesn't keep track
  });

  // render the y-axis markers
  if (highestBar == 0) {
    context.fillText(highestBar, outerLeft, innerBottom);
  }
  else {
    for (var x = 0; x <= 10; x = x + 1) {
      context.fillText(highestBar * x / 10, outerLeft, innerBottom * (11 - x) / 11);
    }
  }
}

// create a line going from one starting position to a end position
function renderLine(context, startx, starty, endx, endy) {
  context.beginPath();
  context.moveTo(startx, starty);
  context.lineTo(endx, endy);
  context.closePath();
  context.stroke();
}

// create the bar going from the x-axis up to its proper height
function renderBar(context, x, y, w, h) {
  context.beginPath();
  context.rect(x, y, w, h);
  context.closePath();
  context.stroke();
  context.fill();
}


