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

    return AffineTransform.getTranslateInstance(x, y);
}

function pointInBox(point, top, right, bottom, left) {
  if (point.getTranslateY() > bottom || point.getTranslateY() < top) {
    return false;
  }
  else if (point.getTranslateX() < left || point.getTranslateX() > right) {
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

    q('#canvas').addEventListener('mousedown', function(e) {
      sceneGraph.pointInObject(canvasTranslation(canvas, e));
    });

    q("#canvas").addEventListener('mouseup', function(e) {
        q("#canvas").removeEventListener('mousemove', mouseMove);
        mousedown = undefined;
    });

    // Setup car
    var carNode = new sceneGraphModule.CarNode(AffineTransform.getTranslateInstance(200, 200));

    // Setup Bumpers of car
    var frontBumperNode = new sceneGraphModule.BumperNode(AffineTransform.getTranslateInstance(0, -carNode.attrs.BASE_HEIGHT / 2 - 5), sceneGraphModule.FRONT_BUMPER);
    var rearBumperNode = new sceneGraphModule.BumperNode(AffineTransform.getTranslateInstance(0, carNode.attrs.BASE_HEIGHT / 2), sceneGraphModule.REAR_BUMPER);
    
    // Setup Axles of car
    var frontAxle = new sceneGraphModule.AxleNode(AffineTransform.getTranslateInstance(0, -carNode.attrs.BASE_HEIGHT / 2 + 10), sceneGraphModule.FRONT_AXLE_PART);
    var rearAxle = new sceneGraphModule.AxleNode(AffineTransform.getTranslateInstance(0, carNode.attrs.BASE_HEIGHT / 2 - 15), sceneGraphModule.REAR_AXLE_PART);

    carNode.addChild(frontBumperNode);
    carNode.addChild(rearBumperNode);
    carNode.addChild(frontAxle);
    carNode.addChild(rearAxle);

    sceneGraph.addChild(carNode);
    sceneGraph.render(context);
});
