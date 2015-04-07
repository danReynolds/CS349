'use strict';

// Controller - Interaction Code

// ========================================
// Instantiate Models, add listeners
// ========================================

window.addEventListener('load', function() {

  // ========================================
  // Create activity model and add listeners
  // ========================================

  var activityModel = new ActivityStoreModel();
  activityModel.addListener(function() {
    name = graphModel.getNameOfCurrentlySelectedGraph();
    if (name == 'activity-table') {
      renderActivityTable(activityModel);
    }
    else {
      renderBarGraph(activityModel, name);
    }
  });

  // ========================================
  // Create graph model and add listeners
  // ========================================
  
  var graphModel = new GraphModel();

  // ========================================
  // Create view module and objects
  // ========================================

  var view = viewModule();

  // Set the root view for the app, in this case the body
  var rootView = new view.RootView(document.body);

  // Create the views
  var headerView = new view.HeaderView(rootView);
  var UtrackContentView = new view.UtrackContentView(rootView);
  var navigationView = new view.NavigationView(UtrackContentView);
  var tabsView = new view.TabsView(UtrackContentView);

  // Create the views for the Activity Tab
  var activityTabView = new view.ActivityTabView(tabsView);
  var alertView = new view.AlertView(activityTabView);
  var addActivityView = new view.AddActivityView(activityTabView);
  var ActivityFormView = new view.ActivityFormView(addActivityView);
  var HealthView = new view.HealthView(addActivityView);

  // Create the views for the History Tab
  var historyTabView = new view.HistoryTabView(tabsView);
  var selectAnalyzationView = new view.SelectAnalyzationView(historyTabView);
  var displayAnalyzationView = new view.DisplayAnalyzationView(historyTabView);
  var graphView = new view.GraphView(displayAnalyzationView, graphModel, activityModel);
  var tableView = new view.TableView(displayAnalyzationView, graphModel, activityModel);

  graphModel.selectGraph('activity-table');

  // ========================================
  // Submit Activity
  // ========================================

  function resetActivityForm() {
    carouselPosition = 0;
    health = 0;
    var select = document.getElementById("activity-select")
    var inputs = document.getElementById('activity-form').getElementsByTagName('input');
    _.each(inputs, function(i) {
      i.value = "";
    });
    select.value = select.children[0].value;
    updateCarousel();
    updateHealthBar();
  }

  document.getElementById('finish').addEventListener('click', function() {
    var inputs = document.getElementById('activity-form').getElementsByClassName('track-health');
    var activityName = document.getElementById('activity-select').value
    var time = document.getElementById('time').value
    var healthMetricsDict = {};
    var html = "";

    _.each(inputs, function(i) {
      healthMetricsDict[i.id] = i.value;
    });

    try  {
      var new_activity = new ActivityData(activityName, healthMetricsDict, time);
      activityModel.addActivityDataPoint(new_activity);
      html = "Activity Added.";
      document.getElementById('alert-type').className = "alert alert-success";
      resetActivityForm();
    }
    catch(errors) {
      html += '<ul id="alert-list">';
      _.each(errors, function(e) {
        html += "<li>" + e + "</li>";
      });
      html += "</ul>";
      document.getElementById('alert-type').className = "alert alert-danger";
    }
    document.getElementById('alert-content').innerHTML = html;
    document.getElementById('alert-wrapper').className = "show";
  });

  // ========================================
  // Toggle Graph Type
  // ========================================

  var radios = document.getElementsByClassName('toggle-graph');
  _.each(radios, function(r) {
    r.addEventListener('click', function(e) {
      graphModel.selectGraph(e.toElement.value);
    });
  });

  // ========================================
  // Health
  // ========================================

  var health = 0;
  var healthBar = document.getElementById('progress');
  var healthStatus = document.getElementById('health-status');
  var healthTrackers = document.getElementsByClassName('track-health');

  function updateHealthBar() {
    healthBar.value = health;
    if (health == 0) {
      healthStatus.innerText = "Health Rating";
    }
    else if (health > 0 && health < 50) {
      healthStatus.innerText = "Somewhat Healthy";
    }
    else if (health >= 50 && health < 80) {
      healthStatus.innerText = "Great Heath";
    }
    else if (health >= 80 && health < 95) {
      healthStatus.innerText = "Health Nut";
    }
    else if (health >= 95) {
      healthStatus.innerText = "Health Guru";
    }
  }

  function updateHealth() {
    parent = document.getElementsByClassName('form-group active')[0];
    health = 0;
    _.each(healthTrackers, function(object) {
      if (object.value != "") {
        if (object.id == "stress") {
          health = health + 5 - parseInt(object.value);
        }
        else {
          health = health + parseInt(object.value);
        }
      }
    });
    health = health * 7.14;
  }

  // ========================================
  // Alert Boxes
  // ========================================

  var alerts = document.getElementsByClassName('alert')
  _.each(alerts, function(a) {
    _.each(a.getElementsByClassName('close'), function(c) {
      c.addEventListener('click', function(e) {
        e.toElement.parentElement.parentElement.className = "hide";
      });
    });
  });

  // ========================================
  // Tab Interaction
  // ========================================

  var tabRegex = /(.*)-tab/

  _.each(document.getElementsByClassName('tab'), function(object, index, list) {
    object.addEventListener('click', function() {
      _.each(list, function(object) {
        object.className = 'tab';
        document.getElementById(tabRegex.exec(object.id)[1]).style.display = 'none';
      });
      document.getElementById(tabRegex.exec(object.id)[1]).style.display = 'block';
      this.className = 'tab active';
    });
  });

  // ========================================
  // Carousel Interaction
  // ========================================

  var carouselPosition = 0;
  var carouselItems = document.getElementsByClassName('form-group');

  updateCarousel() // Initially set the carousel

  document.getElementById('back').addEventListener('click', function(e) {
    updateHealth();
    updateHealthBar();
    updateCarousel("backwards");
  });

  document.getElementById('next').addEventListener('click', function(e) {
    updateHealth();
    updateHealthBar();
    updateCarousel("forwards");
  });

  function resetCarousel() {
    document.getElementById('back').disabled = false;
    document.getElementById('finish').style.display = "none";
    document.getElementById('next').style.display = "inline-block";

    _.each(carouselItems, function(object) {
      object.className = "form-group";
    });
  }

  function updateCarousel(direction) {
    if (direction == "forwards") {
      carouselPosition = carouselPosition + 1;
      resetCarousel();
      if (carouselPosition == carouselItems.length - 1) {
        document.getElementById('finish').style.display = "inline-block";
        document.getElementById('next').style.display = "none"
      }
      carouselItems[carouselPosition].className = "form-group active";
    }

    else if (direction == "backwards") {
      carouselPosition = carouselPosition - 1;
      resetCarousel();
      if (carouselPosition == 0) {
        document.getElementById('back').disabled = true;
      }
      carouselItems[carouselPosition].className = "form-group active";
    }

    else {
      resetCarousel();
      document.getElementById('back').disabled = true;
      carouselItems[carouselPosition].className = "form-group active";
    }

    _.each(carouselItems[carouselPosition].getElementsByTagName('input'), function(input) {
      input.focus();
    });
  }
});
