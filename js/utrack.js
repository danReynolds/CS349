'use strict';

/*
Put any interaction code here
 */

window.addEventListener('load', function() {
  // Health
  var health = 0;
  var healthBar = document.getElementById('progress');
  var healthTrackers = document.getElementsByClassName('track-health');

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
    healthBar.value = health;
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
    updateCarousel("backwards");
  });

  document.getElementById('next').addEventListener('click', function(e) {
    updateHealth();
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

