'use strict';

// This should be your main point of entry for your app
function q(identifier) {
  return document.querySelector(identifier);
}

var mouseMove;
var mousedown;

function canvasTranslation(canvas, e) {
    var canvasBounds = canvas.getBoundingClientRect();
    var x = e.clientX - canvasBounds.left;
    var y = e.clientY - canvasBounds.top;

    return { x: x, y: y };
}

function applyMatrixToPoint(matrix, point) {
  var pointCopy = _.clone(point);
  var transformedPoint = {
    x: pointCopy.x * matrix.m00_ + pointCopy.y * matrix.m01_ + matrix.m02_,
    y: pointCopy.x * matrix.m10_ + pointCopy.y * matrix.m11_ + matrix.m12_
  };
  return transformedPoint;
}

function pointInBox(point, top, right, bottom, left) {
  if (point.y > bottom || point.y< top) {
    return false;
  }
  else if (point.x < left || point.x > right) {
    return false;
  }
  return true;
}

window.addEventListener('load', function() {
    var sceneGraphModule = createSceneGraphModule();
    var appContainer = document.getElementById('app-container');
    var canvas = q('#canvas');
    var context = canvas.getContext('2d');

    var sceneGraph = new sceneGraphModule.GraphNode();
    sceneGraph.initGraphNode(new AffineTransform(), "SCENE_GRAPH");


    // Setup car
    var carNode = new sceneGraphModule.CarNode(AffineTransform.getTranslateInstance(200, 200));
    var frontAxle = carNode.children[sceneGraphModule.FRONT_AXLE_PART];
    var rearAxle = carNode.children[sceneGraphModule.BACK_AXLE_PART];

    q('#canvas').addEventListener('mousedown', function(e) {
      sceneGraph.pointInObject(canvasTranslation(canvas, e));
    });

    q("#canvas").addEventListener('mouseup', function(e) {
       carNode.stopManipulate();
    });

    q("#canvas").addEventListener('mousemove', function(e) {
        var point = canvasTranslation(canvas, e);
        carNode.manipulate(point);
    });

    sceneGraph.addChild(carNode);
    sceneGraph.render(context);
});
