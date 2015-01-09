'use strict';

/*
Put any interaction code here
 */

window.addEventListener('load', function() {
  // Submit Activity
  document.getElementById('finish').addEventListener('click', function() {
    var inputs = document.getElementById('activity-form').getElementsByTagName('input');
    var activityName = document.getElementById('activity-select').value
    var time = document.getElementById('time').value
    var healthMetricsDict = {}; 
    _.each(inputs, function(i) {
      healthMetricsDict[i.id] = i.value;
    });
    success = new ActivityData(activityName, healthMetricsDict, time);
  });

  // Health
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

  // Tabs
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

  // Carousel
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
  }
});

