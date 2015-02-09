'use strict';

/**
 * A function that creates and returns all of the model classes and constants.
  */
function createViewModule() {

    var LIST_VIEW = 'LIST_VIEW';
    var GRID_VIEW = 'GRID_VIEW';
    var RATING_CHANGE = 'RATING_CHANGE';

    /**
     * An object representing a DOM element that will render the given ImageModel object.
     */
    var ImageRenderer = function(imageModel) {
        var _this = this;
        this.imageModel = imageModel;
        this.viewType;
        this.imageWrapper = document.createElement("div");
        this.imageModelListener = function(imageModel) {
            _this.updateView();
        };

        this.imageModel.addListener(this.imageModelListener);
    };

    _.extend(ImageRenderer.prototype, {

        updateView: function() {
            var _this = this;
            var imageWrapperTemplate;
            var imageWrapper = document.createElement("div");;

            if (this.viewType == GRID_VIEW) {
                this.imageWrapper.className = "image-wrapper-grid";
                imageWrapperTemplate = document.getElementById('image-wrapper-grid-template');
            }
            else if (this.viewType == LIST_VIEW) {
                this.imageWrapper.className = "image-wrapper-list";
                imageWrapperTemplate = document.getElementById('image-wrapper-list-template');
            }

            imageWrapper.appendChild(document.importNode(imageWrapperTemplate.content, true));
            imageWrapper.querySelector('img').src = this.imageModel.getPath();
            imageWrapper.querySelector('.name').innerHTML = this.imageModel.getPath();
            imageWrapper.querySelector('.caption').innerHTML = this.imageModel.getCaption();
            var date = this.imageModel.getModificationDate();
            imageWrapper.querySelector('.date').innerHTML = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

            this.imageWrapper.innerHTML = imageWrapper.innerHTML;

            // Add Event Listeners

            this.imageWrapper.querySelector('img').addEventListener('click', function(e) {
                new Popup(_this.getImageModel());
            });

            var rating = this.imageModel.getRating();
            _.each(this.imageWrapper.querySelectorAll('.rating li'), function(elem, index, list) {
                elem.addEventListener('click', function(e) {
                    if (_this.getImageModel().getRating() == index + 1) {
                        _this.getImageModel().setRating(0);
                    }
                    else {
                        _this.getImageModel().setRating(index + 1);
                    }
                });

                if (index <= rating - 1) {
                    elem.className = "selected";
                }
                else {
                    elem.className = "";
                }
            });
        },

        /**
         * Returns an element representing the ImageModel, which can be attached to the DOM
         * to display the ImageModel.
         */
        getElement: function() {
            return this.imageWrapper;
        },

        /**
         * Returns the ImageModel represented by this ImageRenderer.
         */
        getImageModel: function() {
            return this.imageModel;
        },

        /**
         * Sets the ImageModel represented by this ImageRenderer, changing the element and its
         * contents as necessary.
         */
        setImageModel: function(imageModel) {
            this.imageModel = imageModel;
            this.updateView();
        },

        /**
         * Changes the rendering of the ImageModel to either list or grid view.
         * @param viewType A string, either LIST_VIEW or GRID_VIEW
         */
        setToView: function(viewType) {
            this.viewType = viewType;
            this.updateView();
        },

        /**
         * Returns a string of either LIST_VIEW or GRID_VIEW indicating which view type it is
         * currently rendering.
         */
        getCurrentView: function() {
            return this.viewType;
        }
    });

    /**
     * A factory is an object that creates other objects. In this case, this object will create
     * objects that fulfill the ImageRenderer class's contract defined above.
     */
    var ImageRendererFactory = function() {
    };

    _.extend(ImageRendererFactory.prototype, {

        /**
         * Creates a new ImageRenderer object for the given ImageModel
         */
        createImageRenderer: function(imageModel) {
            return new ImageRenderer(imageModel);
        }
    });

    /**
     * An object representing a DOM element that will render an ImageCollectionModel.
     * Multiple such objects can be created and added to the DOM (i.e., you shouldn't
     * assume there is only one ImageCollectionView that will ever be created).
     */
    var ImageCollectionView = function() {
        this.rendererFactory;
        this.imageCollection;
        this.toolbar;
        this.imageRenderers = [];
        this.viewType = GRID_VIEW;
        this.fileChooser;

        var _this = this;

        // Listener to be added to the imageCollection assigned to it
        this.imageCollectionListener = function(eventType, imageModelCollection, imageModel, eventDate) {
            if (eventType == 'IMAGE_ADDED_TO_COLLECTION_EVENT') {
                _this.addRenderer(imageModel);
            }
            else if (eventType == 'IMAGE_REMOVED_FROM_COLLECTION_EVENT') {
                var removedRenderer = _.find(_this.imageRenderers, function(renderer) {
                    return renderer.getImageModel() == imageModel;
                })
                _this.collectionDiv.removeChild(removedRenderer.getElement());
            }
            // After the renderer has been updated, if it has too few stars, hide it.
            // This works because the listener for updating the renderer is run before this listener
            else if (eventType == 'IMAGE_META_DATA_CHANGED_EVENT') {
                var modifiedRenderer = _.find(_this.imageRenderers, function(renderer) {
                    return renderer.getImageModel() == imageModel;
                })
                if (imageModel.getRating() != 0 && imageModel.getRating() < _this.toolbar.getCurrentRatingFilter()) {
                    _this.collectionDiv.removeChild(modifiedRenderer.getElement());
                }
            }
        };

        this._init();
    };

    _.extend(ImageCollectionView.prototype, {

        _init: function() {
            var _this = this;
            this.rendererFactory = new ImageRendererFactory();
            var collectionTemplate = document.getElementById('collection-template');
            this.collectionDiv = document.createElement('div');
            this.collectionDiv.className = "container";
        },

        setFileChooser: function(fileChooser) {
            this.fileChooser = fileChooser;
            var view;

            if (this.getCurrentView() == GRID_VIEW) {
                view = "grid";
            }
            else {
                view = "list";
            }

            this.fileChooser.getElement().className = "file-chooser-wrapper " + view;
            this.collectionDiv.appendChild(fileChooser.getElement());
        },

        setToolBar: function(toolbar) {
            var _this = this;
            this.toolbar = toolbar;

            this.toolbar.addListener(function(toolbar, eventType, eventDate) {
                if (eventType == LIST_VIEW || eventType == GRID_VIEW) {
                    _this.setToView(eventType);
                }
                else if (eventType == RATING_CHANGE) {
                    var validRenderers = _.filter(_this.imageRenderers, function(renderer) {
                        var rating = renderer.getImageModel().getRating();
                        return (rating >= toolbar.ratingFilter || rating === 0);
                    });

                    _this.collectionDiv.innerHTML = '';
                    _this.collectionDiv.appendChild(_this.fileChooser.getElement());
                    _.each(validRenderers, function(renderer) {
                        _this.collectionDiv.insertBefore(renderer.getElement(), _this.fileChooser.getElement());
                    });
                }
            });
        },

        /**
         * Returns an element that can be attached to the DOM to display the ImageCollectionModel
         * this object represents.
         */
        getElement: function() {
            return this.collectionDiv;
        },

        /**
         * Gets the current ImageRendererFactory being used to create new ImageRenderer objects.
         */
        getImageRendererFactory: function() {
            return this.rendererFactory;
        },

        /**
         * Sets the ImageRendererFactory to use to render ImageModels. When a *new* factory is provided,
         * the ImageCollectionView should redo its entire presentation, replacing all of the old
         * ImageRenderer objects with new ImageRenderer objects produced by the factory.
         */
        setImageRendererFactory: function(imageRendererFactory) {
            this.rendererFactory = imageRendererFactory;

            this.imageRenderers = _.map(this.imageRenderers, function(renderer) {
                return this.rendererFactory.createImageRenderer(renderer.getImageModel());
            })

            // Clear existing HTML
            this.collectionDiv.innerHTML = "";
            _.each(this.imageRenderers, function(renderer) {
                this.collectionDiv.appendChild(renderer.getElement());
            });
        },

        addRenderer: function(model) {
            var newRenderer = this.rendererFactory.createImageRenderer(model);
            this.imageRenderers.push(newRenderer);
            newRenderer.setToView(this.getCurrentView());
            this.collectionDiv.insertBefore(newRenderer.getElement(), this.collectionDiv.querySelector('.file-chooser-wrapper'));
        },

        /**
         * Returns the ImageCollectionModel represented by this view.
         */
        getImageCollectionModel: function() {
            return this.imageCollection;
        },

        /**
         * Sets the ImageCollectionModel to be represented by this view. When setting the ImageCollectionModel,
         * you should properly register/unregister listeners with the model, so you will be notified of
         * any changes to the given model.
         */
        setImageCollectionModel: function(imageCollectionModel) {
            // Remove the listener the imageCollectionView added to the collection
            if (this.imageCollection != undefined) {
                this.imageCollection.removeListener(this.imageCollectionListener);
            }

            var _this = this;
            this.imageCollection = imageCollectionModel;

            // Remove old renderers and create new
            _.each(this.imageRenderers, function(renderer) {
                _this.collectionDiv.removeChild(renderer.getElement());
                renderer.getImageModel().removeListener(renderer.imageModelListener);
            })
            this.imageRenderers = [];
            _.each(this.imageCollection.getImageModels(), function(model) {
                _this.addRenderer(model);
            });

            this.imageCollection.addListener(this.imageCollectionListener);
        },

        /**
         * Changes the presentation of the images to either grid view or list view.
         * @param viewType A string of either LIST_VIEW or GRID_VIEW.
         */
        setToView: function(viewType) {
            this.viewType = viewType;
            var view;

            if (viewType == LIST_VIEW) {
                view = "list";
            }
            else {
                view = "grid";
            }

            this.fileChooser.getElement().className = "file-chooser-wrapper " + view;
            _.each(this.imageRenderers, function(renderer) {
                renderer.setToView(viewType);
            });
        },

        /**
         * Returns a string of either LIST_VIEW or GRID_VIEW indicating which view type is currently
         * being rendered.
         */
        getCurrentView: function() {
            return this.viewType;
        }
    });


    // Header Widget
    var Header = function() {
        var headerTemplate = document.getElementById('header-template');
        this.headerDiv = document.createElement("div");
        this.headerDiv.className = "header";
        this.headerDiv.appendChild(document.importNode(headerTemplate.content, true));
    }

    _.extend(Header.prototype, {
        getElement: function() {
            return this.headerDiv;
        }
    });


    /**
     * An object representing a DOM element that will render the toolbar to the screen.
     */
    var Toolbar = function() {
        this.viewType = GRID_VIEW;
        this.ratingFilter = 0;
        this.listeners = [];
        this._init();
    };

    _.extend(Toolbar.prototype, {

        _init: function() {
            var _this = this;
            var toolbarTemplate = document.getElementById('toolbar-template');
            this.toolbarDiv = document.createElement("div");
            this.toolbarDiv.className = "toolbar";
            this.toolbarDiv.appendChild(document.importNode(toolbarTemplate.content, true));

            _.each(this.toolbarDiv.querySelectorAll('ul.view-type li'), function(elem) {
                elem.addEventListener('click', function(e) {
                    if (this.className === "grid") {
                        this.className = "grid selected";
                        this.parentElement.querySelector('.list').className = "list";

                        _this.setToView(GRID_VIEW);
                    }
                    else if (this.className == "list") {
                        this.className = "list selected";
                        this.parentElement.querySelector('.grid').className = "grid";

                        _this.setToView(LIST_VIEW);
                    }
                });
            });

            _.each(this.toolbarDiv.querySelectorAll('ul.rating li'), function(elem) {
                elem.addEventListener('click', function(e) {
                    var elem = e.toElement;
                    var elemIndex = _.indexOf(elem.parentElement.children, elem);

                    if (elemIndex === _this.getCurrentRatingFilter() - 1) {
                        _.each(elem.parentElement.children, function(sibling) {
                            sibling.className = "";
                        })
                        _this.setRatingFilter(0);
                    }
                    else {
                        _.each(elem.parentElement.children, function(sibling, index, list) {
                            if (index <= elemIndex) {
                                sibling.className = "selected";
                            }
                            else {
                                sibling.className = "";
                            }
                        });
                        _this.setRatingFilter(elemIndex + 1);
                    }
                });
            });
        },

        /**
         * Returns an element representing the toolbar, which can be attached to the DOM.
         */
        getElement: function() {
            return this.toolbarDiv;
        },

        /**
         * Registers the given listener to be notified when the toolbar changes from one
         * view type to another.
         * @param listener_fn A function with signature (toolbar, eventType, eventDate), where
         *                    toolbar is a reference to this object, eventType is a string of
         *                    either, LIST_VIEW, GRID_VIEW, or RATING_CHANGE representing how
         *                    the toolbar has changed (specifically, the user has switched to
         *                    a list view, grid view, or changed the star rating filter).
         *                    eventDate is a Date object representing when the event occurred.
         */
        addListener: function(listener_fn) {
            this.listeners.push(listener_fn);
        },

        /**
         * Removes the given listener from the toolbar.
         */
        removeListener: function(listener_fn) {
            return this.listeners = _.filter(this.listeners, function(l) {
                return l !== listener_fn;
            });
        },

        /**
         * Sets the toolbar to either grid view or list view.
         * @param viewType A string of either LIST_VIEW or GRID_VIEW representing the desired view.
         */
        setToView: function(viewType) {
            var _this = this;
            this.viewType = viewType;

            _.each(this.listeners, function(listener) {
                listener.call(this, _this, viewType, new Date());
            });
        },

        /**
         * Returns the current view selected in the toolbar, a string that is
         * either LIST_VIEW or GRID_VIEW.
         */
        getCurrentView: function() {
            return this.viewType;
        },

        /**
         * Returns the current rating filter. A number in the range [0,5], where 0 indicates no
         * filtering should take place.
         */
        getCurrentRatingFilter: function() {
            return this.ratingFilter;
        },

        /**
         * Sets the rating filter.
         * @param rating An integer in the range [0,5], where 0 indicates no filtering should take place.
         */
        setRatingFilter: function(rating) {
            var _this = this;
            this.ratingFilter = rating;

            _.each(this.listeners, function(listener) {
                listener.call(this, _this, RATING_CHANGE, new Date());
            });
        }
    });


    /**
     * An object that will allow the user to display a full size image.
     * @constructor
     */
     var Popup = function(imageModel) {
        this.imageModel = imageModel;
        this._init();
     }

    _.extend(Popup.prototype, {
        _init: function() {
            var _this = this;
            var popupTemplate = document.getElementById('popup-template');
            this.popupDiv = document.createElement("div");
            this.popupDiv.className = "popup";
            this.popupDiv.appendChild(document.importNode(popupTemplate.content, true));
            this.popupDiv.querySelector('img').src = this.imageModel.getPath();
            var caption = this.popupDiv.querySelector('.caption');
            caption.value = this.imageModel.getCaption();
            var container = document.querySelector('#app-container');
            container.style.display = "none";

            this.popupDiv.querySelector('.popup-wrapper .close').addEventListener('click', function() {
                document.body.removeChild(_this.popupDiv);
                container.style.display = "block";
            });

            this.popupDiv.querySelector('.popup-wrapper .save').addEventListener('click', function(e) {
                _this.imageModel.setCaption(caption.value);
                document.body.removeChild(_this.popupDiv);
                container.style.display = "block";
            });

            document.body.appendChild(this.popupDiv);
        }
    });

    /**
     * An object that will allow the user to choose images to display.
     * @constructor
     */
    var FileChooser = function() {
        this.listeners = [];
        this._init();
    };

    _.extend(FileChooser.prototype, {
        // This code partially derived from: http://www.html5rocks.com/en/tutorials/file/dndfiles/
        _init: function() {
            var self = this;
            this.fileChooserDiv = document.createElement('div');
            this.fileChooserDiv.className = "file-chooser-wrapper";
            var fileChooserTemplate = document.getElementById('file-chooser');
            this.fileChooserDiv.appendChild(document.importNode(fileChooserTemplate.content, true));
            var fileChooserInput = this.fileChooserDiv.querySelector('.files-input');
            var fileChooserInputVisible = this.fileChooserDiv.querySelector('.files-input-visible');

            fileChooserInputVisible.addEventListener('click', function(evt) {
                fileChooserInput.click();
            });

            fileChooserInput.addEventListener('change', function(evt) {
                var files = evt.target.files;
                var eventDate = new Date();
                _.each(
                    self.listeners,
                    function(listener_fn) {
                        listener_fn(self, files, eventDate);
                    }
                );
            });
        },

        /**
         * Returns an element that can be added to the DOM to display the file chooser.
         */
        getElement: function() {
            return this.fileChooserDiv;
        },

        /**
         * Adds a listener to be notified when a new set of files have been chosen.
         * @param listener_fn A function with signature (fileChooser, fileList, eventDate), where
         *                    fileChooser is a reference to this object, fileList is a list of files
         *                    as returned by the File API, and eventDate is when the files were chosen.
         */
        addListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to FileChooser.addListener: " + JSON.stringify(arguments));
            }

            this.listeners.push(listener_fn);
        },

        /**
         * Removes the given listener from this object.
         * @param listener_fn
         */
        removeListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to FileChooser.removeListener: " + JSON.stringify(arguments));
            }
            this.listeners = _.without(this.listeners, listener_fn);
        }
    });

    // Return an object containing all of our classes and constants
    return {
        ImageRenderer: ImageRenderer,
        ImageRendererFactory: ImageRendererFactory,
        ImageCollectionView: ImageCollectionView,
        Toolbar: Toolbar,
        FileChooser: FileChooser,
        Header: Header,

        LIST_VIEW: LIST_VIEW,
        GRID_VIEW: GRID_VIEW,
        RATING_CHANGE: RATING_CHANGE
    };
}
