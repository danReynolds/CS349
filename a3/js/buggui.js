'use strict';

// This should be your main point of entry for your app
function q(identifier) {
  return document.querySelector(identifier);
}

window.addEventListener('load', function() {
    var sceneGraphModule = createSceneGraphModule();
    var appContainer = document.getElementById('app-container');
    var canvas = q('#canvas');
    var context = canvas.getContext('2d');


    var sceneGraph = new sceneGraphModule.GraphNode();
    sceneGraph.initGraphNode(new AffineTransform(), "SCENE_GRAPH");

    var transform = new AffineTransform();

    var attrs = {
      HEIGHT: 100,
      WIDTH: 50
    }

    // Setup car
    var carNode = new sceneGraphModule.CarNode(AffineTransform.getTranslateInstance(200, 100), attrs);
    
    // Setup Bumpers of car
    var frontBumperNode = new sceneGraphModule.BumperNode(AffineTransform.getTranslateInstance(0, attrs.HEIGHT/2), sceneGraphModule.FRONT_BUMPER, attrs);
    var rearBumperNode = new sceneGraphModule.BumperNode(AffineTransform.getTranslateInstance(0, -attrs.HEIGHT/2), sceneGraphModule.REAR_BUMPER, attrs);
    
    // Setup Axles of car
    var frontAxle = new sceneGraphModule.AxleNode(AffineTransform.getTranslateInstance(0, 0), sceneGraphModule.FRONT_AXLE_PART, attrs);
    var rearAxle = new sceneGraphModule.AxleNode(AffineTransform.getTranslateInstance(0, 0), sceneGraphModule.REAR_AXLE_PART, attrs);

    carNode.addChild(frontBumperNode);
    carNode.addChild(rearBumperNode);
    carNode.addChild(frontAxle);
    carNode.addChild(rearAxle);
    carNode.render(context);

    // Setup Rear Section
    // var rearSection = new sceneGraphModule.rearSection();
});
