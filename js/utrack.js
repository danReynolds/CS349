'use strict';

/*
Put any interaction code here
 */

window.addEventListener('load', function() {
  var carouselPosition = 0;
  var carouselItems = document.getElementsByClassName('form-group');
  var healthLevel = 0;
  var progressBar = document.getElementById('progress');

  updateCarousel()

  _.each(document.getElementsByTagName('li'), function(object, index, list) {
    object.addEventListener('click', function(e) {
      _.each(list, function(object) {
        object.className = '';
      });
      this.className = 'active';
    });
  });

  document.getElementById('back').addEventListener('click', function(e) {
    updateCarousel("backwards");
  });

  document.getElementById('next').addEventListener('click', function(e) {
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

