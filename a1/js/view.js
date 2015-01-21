'use strict';

// View - Front-facing View Modules

// ========================================
// View Module
// ========================================

function viewModule() {
  // Create Abstract View Class
  var AbstractView = function() {};

  _.extend(AbstractView.prototype, {
    _instantiateToParent: function (templateId, parentView) {
      var template = document.getElementById(templateId);
      parentView.hostElement.innerHTML += template.innerHTML
      this.hostElement = _.last(parentView.hostElement.children);
    }
  });

  var RootView = function(rootElement) {
    this.hostElement = rootElement;
  }

  var UtrackContentView = function(parentView) {
    this._instantiateToParent('utrack_content_template', parentView);
  }
  _.extend(UtrackContentView.prototype, AbstractView.prototype);

  var HeaderView = function (parentView) {
    this._instantiateToParent('header_template', parentView);
  };
  _.extend(HeaderView.prototype, AbstractView.prototype);

  var NavigationView = function (parentView) {
    this._instantiateToParent('navigation_template', parentView);
  };
  _.extend(NavigationView.prototype, AbstractView.prototype);

  var TabsView = function (parentView) {
    this._instantiateToParent('tabs_template', parentView);
  };
  _.extend(TabsView.prototype, AbstractView.prototype);

  var ActivityTabView = function(parentView) {
    this._instantiateToParent('activity_tab_template', parentView);
  }
  _.extend(ActivityTabView.prototype, AbstractView.prototype);

  var HistoryTabView = function(parentView) {
    this._instantiateToParent('history_tab_template', parentView);
  }
  _.extend(HistoryTabView.prototype, AbstractView.prototype);

  var AlertView = function(parentView) {
    this._instantiateToParent('alert_template', parentView);
  }
  _.extend(AlertView.prototype, AbstractView.prototype);

  var AddActivityView = function(parentView) {
    this._instantiateToParent('add_activity_template', parentView);
  }
  _.extend(AddActivityView.prototype, AbstractView.prototype);

  var ActivityFormView = function(parentView) {
    this._instantiateToParent('activity_form_template', parentView);
  }
  _.extend(ActivityFormView.prototype, AbstractView.prototype);

  var HealthView = function(parentView) {
    this._instantiateToParent('health_template', parentView);
  }
  _.extend(HealthView.prototype, AbstractView.prototype);

  var SelectAnalyzationView = function(parentView) {
    this._instantiateToParent('select_analyzation_template', parentView);
  }
  _.extend(SelectAnalyzationView.prototype, AbstractView.prototype);

  var DisplayAnalyzationView = function(parentView) {
    this._instantiateToParent('display_analyzation_template', parentView);
  }
  _.extend(DisplayAnalyzationView.prototype, AbstractView.prototype);

  var GraphView = function(parentView, graphModel, activityModel) {
    this._instantiateToParent('graph_template', parentView);

    var _this = this;

    graphModel.addListener(function(event, date, name) {
      if (name == 'activity-table') {
        document.getElementById('graph').className = "hide";
      }
      else {
        renderBarGraph(activityModel, name, "Total Time Spent Per Activity", "Activity", "Time in Minutes");
        document.getElementById('graph').className = "show";
      }
    });
  }
  _.extend(GraphView.prototype, AbstractView.prototype);

  var TableView = function(parentView, graphModel, activityModel) {
    this._instantiateToParent('table_template', parentView);

    var _this = this;

    graphModel.addListener(function(event, date, name) {
      if (name == 'activity-table') {
        renderActivityTable(activityModel);
        _this.hostElement.className = "table table-bordered show";
      }
      else {
        _this.hostElement.className = "table table-bordered hide";
      }
    });
  }
  _.extend(TableView.prototype, AbstractView.prototype);

  return {
    RootView: RootView,
    HeaderView: HeaderView,
    UtrackContentView: UtrackContentView,
    NavigationView: NavigationView,
    TabsView: TabsView,
    ActivityTabView: ActivityTabView,
    HistoryTabView: HistoryTabView,
    AlertView: AlertView,
    AddActivityView: AddActivityView,
    ActivityFormView: ActivityFormView,
    HealthView: HealthView,
    SelectAnalyzationView: SelectAnalyzationView,
    DisplayAnalyzationView: DisplayAnalyzationView,
    GraphView: GraphView,
    TableView: TableView
  };
}

// ========================================
// Graphing Functions
// ========================================

function totalActivities(model) {
  var data = {
    "Assignments": 0,
    "Sports": 0,
    "Side Projects": 0
  }
  _.each(model.activities, function(a) {
    data[a.activityType] = data[a.activityType] + parseInt(a.activityDurationInMinutes);
  })

  return data;
}

function durationActivities(model) {
  var data = {};
  _.each(model.activities, function(a) {
    if (data[a.activityDurationInMinutes] === undefined)
      data[a.activityDurationInMinutes] = 1;
    else
      data[a.activityDurationInMinutes] = data[a.activityDurationInMinutes] + 1;
  })

  return data;
}

function renderActivityTable(model) {
  var data = totalActivities(model);
  var html = "";
  _.each(data, function(total, key) {
    html += "<tr><td>" + key + "</td><td>" + total + "</td>";
  });
  if (model.activities.length == 0) {
    html += "<tr><td colspan=2>You have no activities!</td></tr>";
  }
  document.getElementById("activity-table-body").innerHTML = html;
}

function renderBarGraph(model, graphId) {
  var canvas = document.getElementById('graph');
  canvas.width = canvas.width
  var context = canvas.getContext('2d');
  var data, graphTitle, xAxisTitle, yAxisTitle;

  if (graphId == 'activity-graph'){
    data = totalActivities(model);
    graphTitle = "Total Time Spent Per Activity";
    xAxisTitle = "Activity";
    yAxisTitle = "Time in Minutes";
  }
  else if (graphId == 'duration-graph') {
    data = durationActivities(model);
    graphTitle = "Length of Activity";
    xAxisTitle = "Activity Time in Minutes";
    yAxisTitle = "Number of Activities";
  }

  // Margin between outer and inner content
  var marginX = 40;
  var marginY = 40;

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
    
    // Render column labels
    context.textAlign = "left";
    context.fillStyle = "#000";
    context.fillText(key, innerLeft + (index * barWidth) + (index + 1) * barSpacing, innerBottom + 15);

    index = index + 1; // increment because each doesn't keep track
  });

  // render axis labels
    context.save(); // save current state before doing rotation of canvas
    context.textAlign = "center";
    context.fillText(graphTitle, innerWidth / 1.5, innerTop - 10); // render graph title
    context.fillText(xAxisTitle, innerWidth / 1.5, outerBottom - 5); // render x-axis label
    context.rotate(Math.PI * -0.5); // rotates canvas about axis at 0,0 (top left)
    context.fillText(yAxisTitle, innerWidth * -0.6, 10); // render y-axis label
    context.restore(); // restore current state when finished

  // render the y-axis markers
  if (highestBar == 0 || highestBar == -Infinity) {
    context.fillText(0, outerLeft + 15, innerBottom);
  }
  else {
    for (var x = 0; x <= 10; x = x + 1) {
      context.fillText(highestBar * x / 10, outerLeft + 20, innerBottom - innerHeight * x / 10);
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


