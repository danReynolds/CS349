'use strict';

// This should be your main point of entry for your app

window.addEventListener('load', function() {
    var modelModule = createModelModule();
    var viewModule = createViewModule();
    var appContainer = document.getElementById('app-container');

    // add header to page
    var header = new viewModule.Header();
    appContainer.appendChild(header.getElement());

    // add toolbar to top of page
    var toolbar = new viewModule.Toolbar();
    appContainer.appendChild(toolbar.getElement());

    // create image collection model
    var imageCollectionModel = new modelModule.loadImageCollectionModel();

    // set imageCollectionView to imageCollectionModel
    var imageCollectionView = new viewModule.ImageCollectionView();
    appContainer.appendChild(imageCollectionView.getElement());
    imageCollectionView.setImageCollectionModel(imageCollectionModel);

    // add toolbar to imageCollectionView
    imageCollectionView.setToolBar(toolbar);

    // Attach the file chooser to the page. You can choose to put this elsewhere, and style as desired
    var fileChooser = new viewModule.FileChooser();
    imageCollectionView.setFileChooser(fileChooser);

    // Demo that we can choose files and save to local storage. This can be replaced, later
    fileChooser.addListener(function(fileChooser, files, eventDate) {
        _.each(
            files,
            function(file) {
                var newDiv = document.createElement('div');
                var fileInfo = "File name: " + file.name + ", last modified: " + file.lastModifiedDate;
                appContainer.appendChild(newDiv);
                imageCollectionModel.addImageModel(
                    new modelModule.ImageModel(
                        '/images/' + file.name,
                        file.lastModifiedDate,
                        '',
                        0
                    ));
            }
        );
        modelModule.storeImageCollectionModel(imageCollectionModel);
    });

    window.addEventListener("beforeunload", function() {
        modelModule.storeImageCollectionModel(imageCollectionModel);
    });
});
