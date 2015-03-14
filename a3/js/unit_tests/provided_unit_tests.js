'use strict';

var expect = chai.expect;

describe ('Scenegraph unit tests', function() {
  var sceneGraphModule = createSceneGraphModule();

  it ('should add a child node', function() {
    var carNode = new sceneGraphModule.CarNode(AffineTransform.getTranslateInstance(200, 200));
    var frontAxleReplacement = new sceneGraphModule.AxleNode("AXLE_ROSE");

    carNode.addChild(frontAxleReplacement);

    expect(carNode.children["AXLE_ROSE"]).to.equal(frontAxleReplacement);
  });

  it ('should replace the child with the new node.', function() {
    var carNode = new sceneGraphModule.CarNode(AffineTransform.getTranslateInstance(200, 200));
    var frontAxleReplacement = new sceneGraphModule.AxleNode(sceneGraphModule.FRONT_AXLE_PART);

    carNode.replaceGraphNode(sceneGraphModule.FRONT_AXLE_PART, frontAxleReplacement);

    expect(carNode.children[sceneGraphModule.FRONT_AXLE_PART]).to.equal(frontAxleReplacement);
  });

  it ('should properly set up the car node', function() {
    var affine = AffineTransform.getTranslateInstance(200, 200);
    var carNode = new sceneGraphModule.CarNode(affine);

    expect(carNode.startPositionTransform).to.equal(affine);
    expect(carNode.objectTransform.equals(new AffineTransform())).to.be.true;
    expect(carNode.scaleTransform.equals(new AffineTransform())).to.be.true;
    expect(carNode.translationTransform.equals(new AffineTransform())).to.be.true;
    expect(carNode.rotationTransform.equals(new AffineTransform())).to.be.true;
    expect(carNode.mousedown).to.equal(undefined);
  });

  it ("should properly set up the car node's children", function() {
    var affine = AffineTransform.getTranslateInstance(200, 200);
    var carNode = new sceneGraphModule.CarNode();;

    expect(_.find(carNode.children, function(c) { return c.nodeName == sceneGraphModule.FRONT_AXLE_PART })).to.not.equal(undefined);
    expect(_.find(carNode.children, function(c) { return c.nodeName == sceneGraphModule.BACK_AXLE_PART })).to.not.equal(undefined);
    expect(_.find(carNode.children, function(c) { return c.nodeName == sceneGraphModule.LEFT_BUMPER })).to.not.equal(undefined);
    expect(_.find(carNode.children, function(c) { return c.nodeName == sceneGraphModule.RIGHT_BUMPER })).to.not.equal(undefined);
    expect(_.find(carNode.children, function(c) { return c.nodeName == sceneGraphModule.FRONT_BUMPER })).to.not.equal(undefined);
    expect(_.find(carNode.children, function(c) { return c.nodeName == sceneGraphModule.REAR_BUMPER })).to.not.equal(undefined);
  });

  it ("should properly set up the axle node's children", function() {
    var affine = AffineTransform.getTranslateInstance(200, 200);
    var carNode = new sceneGraphModule.CarNode();

    expect(_.find(carNode.children[sceneGraphModule.FRONT_AXLE_PART].children, function(c) { return c.nodeName == sceneGraphModule.FRONT_LEFT_TIRE_PART })).to.not.equal(undefined);
    expect(_.find(carNode.children[sceneGraphModule.FRONT_AXLE_PART].children, function(c) { return c.nodeName == sceneGraphModule.FRONT_RIGHT_TIRE_PART })).to.not.equal(undefined);
    expect(_.find(carNode.children[sceneGraphModule.BACK_AXLE_PART].children, function(c) { return c.nodeName == sceneGraphModule.BACK_RIGHT_TIRE_PART })).to.not.equal(undefined);
    expect(_.find(carNode.children[sceneGraphModule.BACK_AXLE_PART].children, function(c) { return c.nodeName == sceneGraphModule.BACK_LEFT_TIRE_PART })).to.not.equal(undefined);

  });


});
