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

    // Setup car
    var carNode = new sceneGraphModule.CarNode();
    // Set car starting position
    carNode.startPositionTransform = transform.setToTranslation(50, 50);

    // Setup Front Section
    var frontSection = new sceneGraphModule.frontSection();
    frontSection.startPositionTransform = transform.

    // Setup Rear Section
    var rearSection = new sceneGraphModule.rearSection();
});