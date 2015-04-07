'use strict';

var expect = chai.expect;

describe('Provided unit tests', function() {
});

describe('ImageModel', function() {
  var modelModule = createModelModule();
  var imageModel;
  var listener;
  var listener2;

  beforeEach(function(done) {
    imageModel = new modelModule.ImageModel("/test", new Date(), "test", 0);
    listener = sinon.spy();
    listener2 = sinon.spy();
    done();
  });

  it ('should add a listener', function() {
    imageModel.addListener(listener);
    expect(imageModel.listeners).to.have.length(1);
  })

  it ('should remove a listener when correct listener passed', function() {
    imageModel.addListener(listener);
    imageModel.removeListener(listener);
    expect(imageModel.listeners).to.have.length(0);
  });

  it ('should not remove a listener when not correct listener passed', function() {
    imageModel.addListener(listener);
    imageModel.removeListener(listener2);
    expect(imageModel.listeners).to.have.length(1);
  });

  it('should return caption if present', function() {
    expect(imageModel.getCaption()).to.equal("test");
  })

  it('should return empty string if no caption is present', function() {
    imageModel.caption = undefined;
    expect(imageModel.getCaption()).to.equal("");
  })

  it('should set caption', function() {
    imageModel.setCaption('reset');
    expect(imageModel.getCaption()).to.equal('reset');
  })

  it('should alert all listeners when caption set', function() {
    imageModel.addListener(listener);
    imageModel.setCaption('reset');
    expect(listener.callCount).to.equal(1);
  })

  it('should return set rating if provided', function() {
    expect(imageModel.getRating()).to.equal(0);
  })

  it('should return 0 if rating not set', function() {
    imageModel.rating = undefined;
    expect(imageModel.getRating()).to.equal(0);
  })

  it('should return the path to image', function() {
    expect(imageModel.getPath()).to.equal("/test");
  })

  it('should update the modification date', function() {
    var date = imageModel.getModificationDate();
    imageModel.setCaption("test");
    expect(imageModel.getModificationDate()).to.not.equal(date);
    var date = imageModel.getModificationDate();
    imageModel.setRating(4);
    expect(imageModel.getModificationDate()).to.not.equal(date);
  })
});

describe('ImageCollectionModel', function() {
  var modelModule = createModelModule();
  var imageCollectionModel;
  var imageModel;
  var imageModel2;
  var listener;
  var listener2;

  beforeEach(function(done) {
    imageCollectionModel = new modelModule.ImageCollectionModel();
    imageModel = new modelModule.ImageModel("/test", new Date(), "test", 0);
    imageModel2 = new modelModule.ImageModel("/test2", new Date(), "test2", 0);
    listener = sinon.spy();
    listener2 = sinon.spy();
    done();
  });

  it ('should add a listener', function() {
    imageModel.addListener(listener);
    expect(imageModel.listeners).to.have.length(1);
  })

  it ('should remove a listener when correct listener passed', function() {
    imageModel.addListener(listener);
    imageModel.removeListener(listener);
    expect(imageModel.listeners).to.have.length(0);
  });

  it('should add an image model when passed', function() {
    imageCollectionModel.addImageModel(imageModel);
    expect(imageCollectionModel.imageModels.length).to.equal(1);
  });

  it('should inform all listeners when image added', function() {
    imageCollectionModel.addListener(listener);
    imageCollectionModel.addImageModel(imageModel);
    expect(listener.callCount).to.equal(1);
  })

  it('should add all listeners to model when added', function() {
    imageCollectionModel.addListener(listener);
    imageCollectionModel.addListener(listener2);
    imageCollectionModel.addImageModel(imageModel);
    expect(imageModel.listeners.length).to.equal(1); // listener notifies each collection listener that image model changes
  })

  it('should remove an image model', function() {
    imageCollectionModel.addListener(listener);
    imageCollectionModel.addListener(listener2);
    imageCollectionModel.addImageModel(imageModel);
    imageCollectionModel.removeImageModel(imageModel);
    expect(imageModel.listeners.length).to.equal(0);
  })

  it('should return all image models of collection', function() {
    imageCollectionModel.addImageModel(imageModel);
    imageCollectionModel.addImageModel(imageModel2);
    expect(imageCollectionModel.getImageModels().length).to.eq(2);
  })

});

