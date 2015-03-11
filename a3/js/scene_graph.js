'use strict';

/**
 * A function that creates and returns the scene graph classes and constants.
 */

CanvasRenderingContext2D.prototype.setAffineTransform = function(transform) {
    this.transform(transform.getScaleX(), transform.getShearY(), transform.getShearX(), transform.getScaleY(), transform.getTranslateX(), transform.getTranslateY());
};

function createSceneGraphModule() {

    // Part names. Use these to name your different nodes
    var CAR_PART = 'CAR_PART';
    var FRONT_AXLE_PART = 'FRONT_AXLE_PART';
    var BACK_AXLE_PART = 'BACK_AXLE_PART';
    var FRONT_LEFT_TIRE_PART = 'FRONT_LEFT_TIRE_PART';
    var FRONT_RIGHT_TIRE_PART = 'FRONT_RIGHT_TIRE_PART';
    var BACK_LEFT_TIRE_PART = 'BACK_LEFT_TIRE_PART';
    var BACK_RIGHT_TIRE_PART = 'BACK_RIGHT_TIRE_PART';
    var FRONT_BUMPER = 'FRONT_BUMPER';
    var REAR_BUMPER = 'REAR_BUMPER';
    var FRONT_SECTION = 'FRONT_SECTION';
    var REAR_SECTION = 'REAR_SECTION';

    var GraphNode = function() {
    };

    _.extend(GraphNode.prototype, {

        /**
         * Subclasses should call this function to initialize the object.
         *
         * @param startPositionTransform The transform that should be applied prior
         * to performing any rendering, so that the component can render in its own,
         * local, object-centric coordinate system.
         * @param nodeName The name of the node. Useful for debugging, but also used to uniquely identify each node
         */
        initGraphNode: function(startPositionTransform, nodeName) {

            this.nodeName = nodeName;

            // The transform that will position this object, relative
            // to its parent
            this.startPositionTransform = startPositionTransform;

            // Any additional transforms of this object after the previous transform
            // has been applied
            this.objectTransform = new AffineTransform();

            this.parent;

            this.mousedown = undefined;

            // Any child nodes of this node
            this.children = {};

            // Add any other properties you need, here
        },

        addChild: function(graphNode) {
            this.children[graphNode.nodeName] = graphNode;
            graphNode.parent = this;
        },

        /**
         * Swaps a graph node with a new graph node.
         * @param nodeName The name of the graph node
         * @param newNode The new graph node
         */
        replaceGraphNode: function(nodeName, newNode) {
            if (nodeName in this.children) {
                this.children[nodeName] = newNode;
            } else {
                _.each(
                    _.values(this.children),
                    function(child) {
                        child.replaceGraphNode(nodeName, newNode);
                    }
                );
            }
        },

        /**
         * Render this node using the graphics context provided.
         * Prior to doing any painting, the start_position_transform must be
         * applied, so the component can render itself in its local, object-centric
         * coordinate system. See the assignment specs for more details.
         *
         * This method should also call each child's render method.
         * @param context
         */
        render: function(context) {
            _.each(this.children, function(c) {
                c.render(context);
            });
        },

        /**
         * Determines whether a point lies within this object. Be sure the point is
         * transformed correctly prior to performing the hit test.
         */
        pointInObject: function(point) {
            _.each(this.children, function(c) {
                c.pointInObject(point);
            });
        }

    });

    var CarNode = function(startPosition) {
        this.initGraphNode(startPosition, CAR_PART);

        this.attrs = {
            BASE_HEIGHT: 100,
            BASE_WIDTH: 50
        }
    };

    _.extend(CarNode.prototype, GraphNode.prototype, {
        // Overrides parent method
        render: function(context) {
            context.save();
            context.setAffineTransform(this.startPositionTransform.clone().concatenate(this.objectTransform.clone()));

            context.fillRect(-this.attrs.BASE_WIDTH / 2, -this.attrs.BASE_HEIGHT / 2, this.attrs.BASE_WIDTH, this.attrs.BASE_HEIGHT);
            
            // Remove scaling going down
            context.restore();
            context.save();
            context.setAffineTransform(this.startPositionTransform.clone().concatenate(this.objectTransform.clone().scale(1, 1 / this.objectTransform.getScaleY())));

            _.each(this.children, function(c) {
                c.render(context);
            });

            context.restore();
        },

        // Overrides parent method
        pointInObject: function(point) {
            var _this = this;

            // Generate inverse
            var transformWithoutScale = this.objectTransform.clone();
            transformWithoutScale.m11_ = 1;
            var inversePoint = point.clone().concatenate(transformWithoutScale.concatenate(this.startPositionTransform).createInverse());

            _.each(this.children, function(c) {
                c.pointInObject(inversePoint);
            });

            if (this.mousedown != undefined) {
                var diffX = inversePoint.getTranslateX() - this.mousedown.getTranslateX();
                var diffY = inversePoint.getTranslateY() - this.mousedown.getTranslateY();
                q("#canvas").getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                _this.objectTransform.translate(diffX, diffY);
                _this.render(q("#canvas").getContext('2d'));
            }

            if (!pointInBox(inversePoint, -this.attrs.BASE_HEIGHT / 2 * this.objectTransform.getScaleY(), this.attrs.BASE_WIDTH / 2, this.attrs.BASE_HEIGHT / 2 * this.objectTransform.getScaleY(), -this.attrs.BASE_WIDTH / 2)) {
                return false;
            }

            else if (this.mousedown == undefined) {
                console.log(_this.nodeName + " Clicked");
                this.mousedown = inversePoint;
                q("#canvas").addEventListener('mousemove', mouseMove=function(e) {
                    _this.pointInObject(canvasTranslation(canvas, e));
                });
            }
        }
    });

    /**
     * Node for the front and back bumpers of the car
     */
    var BumperNode = function(startPosition, bumperName) {
        this.initGraphNode(startPosition, bumperName);

        this.attrs = {
            BASE_HEIGHT: 5
        }
    };

    _.extend(BumperNode.prototype, GraphNode.prototype, {
        // Overrides parent method
        render: function(context) {
            context.save();
            context.setAffineTransform(this.startPositionTransform.clone().concatenate(this.objectTransform));

            if (this.nodeName == FRONT_BUMPER) {
                context.fillStyle="#FF0000";
                context.fillRect(-this.parent.attrs.BASE_WIDTH / 2, 0, this.parent.attrs.BASE_WIDTH, this.attrs.BASE_HEIGHT);
            }
            else {
                context.fillStyle="#adadad";
                context.fillRect(-this.parent.attrs.BASE_WIDTH / 2, 0, this.parent.attrs.BASE_WIDTH, this.attrs.BASE_HEIGHT);
            }
            context.restore();
        },

        // Overrides parent method
        pointInObject: function(point) {

            // Generate inverse
            var inversePoint = point.clone().concatenate(this.objectTransform.clone().concatenate(this.startPositionTransform).createInverse());

            if (this.mousedown != undefined) {
                var diffX = inversePoint.getTranslateX() - this.mousedown.getTranslateX();
                var diffY = inversePoint.getTranslateY() - this.mousedown.getTranslateY();
                q("#canvas").getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                _this.objectTransform.translate(diffX, diffY);
                _this.render(q("#canvas").getContext('2d'));
            }
            
            if (!pointInBox(inversePoint, 0, this.parent.attrs.BASE_WIDTH / 2, this.attrs.BASE_HEIGHT, -this.parent.attrs.BASE_WIDTH / 2)) {
                return false;
            }

            else if (this.mousedown == undefined) {
                console.log(_this.nodeName + " Clicked");
                this.mousedown = inversePoint;
                q("#canvas").addEventListener('mousemove', mouseMove=function(e) {
                    _this.pointInObject(canvasTranslation(canvas, e));
                });
            }

           // this.parent.objectTransform.scale(1,4);
           // this.objectTransform.translate(0,this.startPositionTransform.clone().concatenate(this.objectTransform).getTranslateY() * 3);
           // var context = canvas.getContext('2d');
           // context.clearRect(0, 0, canvas.height, canvas.width);
           // this.parent.render(context);
           // console.log("Clicked " + this.nodeName);
        }
    });

    /**
     * @param axlePartName Which axle this node represents
     * @constructor
     */
    var AxleNode = function(startPosition, axlePartName) {
        this.initGraphNode(startPosition, axlePartName);
        
        this.attrs = {
            BASE_HEIGHT: 5,
            BASE_WIDTH: 75
        }
    };

    _.extend(AxleNode.prototype, GraphNode.prototype, {
        // Overrides parent method
        render: function(context) {
            context.save();
            context.setAffineTransform(this.startPositionTransform.clone().concatenate(this.objectTransform));
            context.fillRect(-this.attrs.BASE_WIDTH/2, 0, this.attrs.BASE_WIDTH, this.attrs.BASE_HEIGHT);
            context.restore();
        },

        // Overrides parent method
        pointInObject: function(point) {
            // User can't select axles
            return false;
        }
    });

    /**
     * @param tirePartName Which tire this node represents
     * @constructor
     */
    var TireNode = function(tirePartName) {
        this.initGraphNode(new AffineTransform(), tirePartName);
        // TODO
    };

    _.extend(TireNode.prototype, GraphNode.prototype, {
        // Overrides parent method
        render: function(context) {
            // TODO
        },

        // Overrides parent method
        pointInObject: function(point) {
            // TODO
        }
    });

    // Return an object containing all of our classes and constants
    return {
        GraphNode: GraphNode,
        CarNode: CarNode,
        BumperNode: BumperNode,
        AxleNode: AxleNode,
        TireNode: TireNode,
        CAR_PART: CAR_PART,
        FRONT_AXLE_PART: FRONT_AXLE_PART,
        BACK_AXLE_PART: BACK_AXLE_PART,
        FRONT_LEFT_TIRE_PART: FRONT_LEFT_TIRE_PART,
        FRONT_RIGHT_TIRE_PART: FRONT_RIGHT_TIRE_PART,
        BACK_LEFT_TIRE_PART: BACK_LEFT_TIRE_PART,
        BACK_RIGHT_TIRE_PART: BACK_RIGHT_TIRE_PART,
        FRONT_BUMPER: FRONT_BUMPER,
        REAR_BUMPER: REAR_BUMPER,
        FRONT_SECTION: FRONT_SECTION,
        REAR_SECTION: REAR_SECTION
    };
}
