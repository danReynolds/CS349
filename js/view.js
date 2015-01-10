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

function renderActivityChart(model) {
  var canvas = document.getElementById('activity-graph');
  canvas.width = canvas.width
  var context = canvas.getContext('2d');
  var data = composeData(model);

  // Margin between outer and inner content
  var marginX = 20;
  var marginY = 20;

  // outer content
  var outerTopY = 0;
  var outerBottomY = canvas.height;
  var outerLeftX = 0;
  var outerRightX = canvas.width;

  // inner content, within margin, where axes are drawn
  var innerTopY = marginY;
  var innerBottomY = canvas.height - marginY;
  var innerLeftX = marginX;
  var innerRightX = canvas.width - marginX;
  var innerWidth = canvas.width - 2 * marginX; // width of inner content within margin
  var innerHeight = canvas.height - 2 * marginY; // height of inner content within margin
  
  // bar config
  var highestBar = _.max(data);
  var barSpacing = 10;
  var barWidth = (canvas.width - 2 * marginX - barSpacing * _.size(data)) / _.size(data);

  renderLine(context, innerLeftX, innerTopY, innerLeftX, innerBottomY); // draw y-axis, bottom is higher y value
  renderLine(context, innerLeftX, innerBottomY, innerRightX, innerBottomY); // draw x-axis

  var index = 0;
  _.each(data, function(total, key) {

    // Write the bars
    context.fillStyle = "#363636";
    renderBar(context, innerLeftX + (index * barWidth) + (index + 1) * barSpacing, innerBottomY, barWidth, -(innerHeight * (total / highestBar)), true);
    
    // Write the bar markers
    context.fillText(total, innerLeftX + (index * barWidth) + (index + 1) * barSpacing, innerBottomY - (innerHeight * (total / highestBar)) - 5, 50);
    
    // Add the column title to the x-axis
    context.textAlign = "left";
    context.fillStyle = "#000";
    context.fillText(key, innerLeftX + (index * barWidth) + (index + 1) * barSpacing, outerBottomY - 10);

    index = index + 1; // increment because each doesn't keep track
  });
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
function renderBar(context, x, y, w, h, fill) {      
  context.beginPath();
  context.rect(x, y, w, h);
  context.closePath();
  context.stroke();
  if (fill) context.fill();
}


