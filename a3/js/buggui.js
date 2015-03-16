'use strict';

// This should be your main point of entry for your app
function q(identifier) {
  return document.querySelector(identifier);
}

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
var globalPoint = { x: 125, y: 175 };
function updateCopy() {
    var canvasCopy = q('#canvasCopy');
    var context = canvas.getContext('2d');
    var copyContext = canvasCopy.getContext('2d');

    //call its drawImage() function passing it the source canvas directly
    copyContext.save();
    copyContext.clearRect(0, 0, canvasCopy.width, canvasCopy.height);
    copyContext.scale(5,5);
    copyContext.translate(-globalPoint.x / 2.5, -globalPoint.y / 2);
    copyContext.drawImage(canvas, 0, 0, 400, 400);
    copyContext.restore();
}

CanvasRenderingContext2D.prototype.replaceAffineTransform = function(transform) {
    this.transform(transform.getScaleX(), transform.getShearY(), transform.getShearX(), transform.getScaleY(), transform.getTranslateX(), transform.getTranslateY());
};

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
      updateCopy();
    });

    q("#canvas").addEventListener('mouseup', function(e) {
       carNode.stopManipulate();
    });

    q("#canvas").addEventListener('mousemove', function(e) {
        var point = canvasTranslation(canvas, e);
        carNode.manipulate(point);
        carNode.cursorInObject(point);

        if (carNode.moving) {
          globalPoint = _.clone(point);
        }
        updateCopy();
    });

    sceneGraph.addChild(carNode);
    sceneGraph.render(context);

    updateCopy();
});
