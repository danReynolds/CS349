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
    var LEFT_BUMPER = 'LEFT_BUMPER';
    var RIGHT_BUMPER = 'RIGHT_BUMPER';
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

            this.scaleTransform = new AffineTransform();
            this.translationTransform = new AffineTransform();
            this.rotateTransform = new AffineTransform();

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
        },

        manipulate: function(point) {

        },

        stopManipulate: function() {

        }

    });

    var CarNode = function(startPosition) {
        this.initGraphNode(startPosition, CAR_PART);

        this.moving = false;
        this.scalingX = false;
        this.scalingY = false;

        this.attrs = {
            BASE_HEIGHT: 100,
            BASE_WIDTH: 50,
            MAX_HEIGHT: 200,
            MIN_HEIGHT: 50,
            MAX_WIDTH: 150,
            MIN_WIDTH: 25
        }

        // Setup Bumpers of car
        var frontBumper = new BumperNode(AffineTransform.getTranslateInstance(0, -this.attrs.BASE_HEIGHT / 2 - 5), FRONT_BUMPER);
        var rearBumper = new BumperNode(AffineTransform.getTranslateInstance(0, this.attrs.BASE_HEIGHT / 2), REAR_BUMPER);
        var leftBumper = new BumperNode(AffineTransform.getTranslateInstance(-this.attrs.BASE_WIDTH / 2 - 5, 0), LEFT_BUMPER);
        var rightBumper = new BumperNode(AffineTransform.getTranslateInstance(this.attrs.BASE_WIDTH / 2, 0), RIGHT_BUMPER);
        
        // Setup Axles of car
        var frontAxle = new AxleNode(AffineTransform.getTranslateInstance(0, -this.attrs.BASE_HEIGHT / 2 + 10), FRONT_AXLE_PART);
        var rearAxle = new AxleNode(AffineTransform.getTranslateInstance(0, this.attrs.BASE_HEIGHT / 2 - 15), BACK_AXLE_PART);

        this.addChild(frontBumper);
        this.addChild(leftBumper);
        this.addChild(rightBumper);
        this.addChild(rearBumper);
        this.addChild(frontAxle);
        this.addChild(rearAxle);
    };

    _.extend(CarNode.prototype, GraphNode.prototype, {
        // Overrides parent method
        render: function(context) {
            this.objectTransform.copyFrom(this.scaleTransform);

            context.save();
            context.setAffineTransform(this.startPositionTransform.clone().concatenate(this.objectTransform));

            context.fillStyle="red";
            context.fillRect(-this.attrs.BASE_WIDTH / 2, -this.attrs.BASE_HEIGHT / 2, this.attrs.BASE_WIDTH, this.attrs.BASE_HEIGHT);
            
            context.beginPath();
            context.arc(-this.attrs.BASE_WIDTH / 8, -this.attrs.BASE_HEIGHT / 2.3, 5, 0, 2 * Math.PI, false);
            context.arc(this.attrs.BASE_WIDTH / 8, -this.attrs.BASE_HEIGHT / 2.3, 5, 0, 2 * Math.PI, false);
            context.fillStyle = 'yellow';
            context.fill();
            context.lineWidth = 5;

            context.beginPath();
            context.arc(-this.attrs.BASE_WIDTH / 8, this.attrs.BASE_HEIGHT / 2.3, 5, 0, 2 * Math.PI, false);
            context.arc(this.attrs.BASE_WIDTH / 8, this.attrs.BASE_HEIGHT / 2.3, 5, 0, 2 * Math.PI, false);
            context.fillStyle = 'white';
            context.fill();
            context.lineWidth = 3;

            context.fillStyle="#FFFFFF";
            context.fillRect(-this.attrs.BASE_WIDTH / 4, -this.attrs.BASE_HEIGHT / 3, this.attrs.BASE_WIDTH / 2, this.attrs.BASE_HEIGHT / 4);
            context.fillRect(-this.attrs.BASE_WIDTH / 4, this.attrs.BASE_HEIGHT / 12, this.attrs.BASE_WIDTH / 2, this.attrs.BASE_HEIGHT / 4);
            
            context.fillStyle="#282828";
            context.strokeRect(-this.attrs.BASE_WIDTH / 4, this.attrs.BASE_HEIGHT / 12, this.attrs.BASE_WIDTH / 2, this.attrs.BASE_HEIGHT / 4);
            context.strokeRect(-this.attrs.BASE_WIDTH / 4, -this.attrs.BASE_HEIGHT / 3, this.attrs.BASE_WIDTH / 2, this.attrs.BASE_HEIGHT / 4);
            
            // Remove scaling going down
            context.restore();
            context.save();
            context.setAffineTransform(this.startPositionTransform);
            context.globalCompositeOperation = 'destination-over';

            _.each(this.children, function(c) {
                c.render(context);
            });

            context.restore();
        },

        // Overrides parent method
        pointInObject: function(coords) {
            var _this = this;

            var point = AffineTransform.getTranslateInstance(coords.x, coords.y);

            // Generate inverse
            var inversePoint = point.clone().concatenate(this.objectTransform.clone().concatenate(this.startPositionTransform).createInverse());
            coords.x = inversePoint.getTranslateX();
            coords.y = inversePoint.getTranslateY();

            _.each(this.children, function(c) {
                c.pointInObject(coords);
            });

            if (!pointInBox(inversePoint, -this.attrs.BASE_HEIGHT / 2 * this.objectTransform.getScaleY(), this.attrs.BASE_WIDTH / 2 * this.objectTransform.getScaleX(), this.attrs.BASE_HEIGHT / 2 * this.objectTransform.getScaleY(), -this.attrs.BASE_WIDTH / 2 * this.objectTransform.getScaleX())) {
                return false;
            }

            console.log('Clicked ' + this.nodeName);
            
            this.moving = true;

            return true;      
        },

        manipulate: function(point) {

            var matrixFromPoint = AffineTransform.getTranslateInstance(point.x, point.y);

            // Generate inverse
            var invMatrixFromPoint = matrixFromPoint.clone().concatenate(this.objectTransform.clone().concatenate(this.startPositionTransform).createInverse());
            
            // Get the point to pass down to child nodes
            var childPoint = _.clone(point);
            childPoint.x = invMatrixFromPoint.getTranslateX();
            childPoint.y = invMatrixFromPoint.getTranslateY();

            // Scale Car
            invMatrixFromPoint.setToTranslation(Math.abs(invMatrixFromPoint.getTranslateX()), Math.abs(invMatrixFromPoint.getTranslateY()));

            if (this.moving) {
              this.move(point);
            }
            else if(this.scalingX) {
              this.scaleX(invMatrixFromPoint);
            }
            else if (this.scalingY) {
              this.scaleY(invMatrixFromPoint);
            }

            _.each(this.children, function(c) {
                c.manipulate(childPoint);
            });
        },

        stopManipulate: function() {
            this.moving = false;
            this.scalingX = false;
            this.scalingY = false;

            _.each(this.children, function(c) {
                c.stopManipulate();
            });
        },

        move: function(point) {
            this.startPositionTransform.setToTranslation(point.x, point.y);
            q("#canvas").getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            this.render(q("#canvas").getContext('2d'));
        },

        scaleX: function(matrix) {
            var scaleX = matrix.getTranslateX() / (this.attrs.BASE_WIDTH / 2);

            if (scaleX * this.attrs.BASE_WIDTH > this.attrs.MAX_WIDTH) {
                console.log("At max width");
                return;
            }
            
            else if (scaleX * this.attrs.BASE_WIDTH < this.attrs.MIN_WIDTH) {
                console.log("At min width");
                return;
            }

            this.scaleTransform = this.scaleTransform.setToScale(scaleX, this.scaleTransform.getScaleY());

            // Translate LEFT and RIGHT bumpers
            this.children[LEFT_BUMPER].translationTransform.setToTranslation((matrix.getTranslateX() - this.attrs.BASE_WIDTH / 2) * -1, 0);
            this.children[RIGHT_BUMPER].translationTransform.setToTranslation(matrix.getTranslateX() - this.attrs.BASE_WIDTH / 2, 0);

            // scale FRONT AND REAR bumpers
            this.children[FRONT_BUMPER].scaleTransform.setToScale(scaleX, 1);
            this.children[REAR_BUMPER].scaleTransform.setToScale(scaleX, 1);

            // Scale TOP and BOTTOM axles
            this.children[FRONT_AXLE_PART].scaleTransform.setToScale((scaleX * this.attrs.BASE_WIDTH + this.children[FRONT_AXLE_PART].attrs.BASE_AXLE_OFFSET) / this.children[FRONT_AXLE_PART].attrs.BASE_WIDTH, 1);
            this.children[BACK_AXLE_PART].scaleTransform.setToScale((scaleX * this.attrs.BASE_WIDTH + this.children[BACK_AXLE_PART].attrs.BASE_AXLE_OFFSET) / this.children[BACK_AXLE_PART].attrs.BASE_WIDTH, 1);

            q("#canvas").getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            this.render(q("#canvas").getContext('2d'));
            console.log("Scaling X");
        },

        scaleY: function(matrix) {
            var scaleY = matrix.getTranslateY() / (this.attrs.BASE_HEIGHT / 2);

            if (scaleY * this.attrs.BASE_HEIGHT > this.attrs.MAX_HEIGHT) {
                console.log("At max height");
                return;
            }
            
            else if (scaleY * this.attrs.BASE_HEIGHT < this.attrs.MIN_HEIGHT) {
                console.log("At min height");
                return;
            }

            this.scaleTransform = this.scaleTransform.setToScale(this.scaleTransform.getScaleX(), scaleY);

            // Scale LEFT and RIGHT bumpers
            this.children[LEFT_BUMPER].scaleTransform.setToScale(1, scaleY);
            this.children[RIGHT_BUMPER].scaleTransform.setToScale(1, scaleY);

            // Translate TOP and BOTTOM axles
            this.children[BACK_AXLE_PART].translationTransform.setToTranslation(0, matrix.getTranslateY() - this.attrs.BASE_HEIGHT / 2);
            this.children[FRONT_AXLE_PART].translationTransform.setToTranslation(0, (matrix.getTranslateY() - this.attrs.BASE_HEIGHT / 2) * -1);

            // Translate TOP and BOTTOM bumpers
            this.children[REAR_BUMPER].translationTransform.setToTranslation(0, matrix.getTranslateY() - this.attrs.BASE_HEIGHT / 2);
            this.children[FRONT_BUMPER].translationTransform.setToTranslation(0, (matrix.getTranslateY() - this.attrs.BASE_HEIGHT / 2) * -1);

            q("#canvas").getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            this.render(q("#canvas").getContext('2d'));
            console.log("Scaling Y");
        }
    });

    /**
     * Node for the front and back bumpers of the car
     */
    var BumperNode = function(startPosition, bumperName) {
        this.initGraphNode(startPosition, bumperName);

        this.attrs = {
            THICKNESS: 5
        }
    };

    _.extend(BumperNode.prototype, GraphNode.prototype, {
        // Overrides parent method
        render: function(context) {
            context.save();
            this.objectTransform.copyFrom(this.scaleTransform).concatenate(this.translationTransform);

            context.setAffineTransform(this.startPositionTransform.clone().concatenate(this.objectTransform));

            if (this.nodeName == FRONT_BUMPER) {
                context.fillStyle="#312812";
                context.fillRect(-this.parent.attrs.BASE_WIDTH / 2, 0, this.parent.attrs.BASE_WIDTH, this.attrs.THICKNESS);
            }
            else if (this.nodeName == REAR_BUMPER) {
                context.fillStyle="#312812";
                context.fillRect(-this.parent.attrs.BASE_WIDTH / 2, 0, this.parent.attrs.BASE_WIDTH, this.attrs.THICKNESS);
            }
            else if (this.nodeName == LEFT_BUMPER) {
                context.fillStyle="#312812";
                context.fillRect(0, -this.parent.attrs.BASE_HEIGHT / 2, this.attrs.THICKNESS, this.parent.attrs.BASE_HEIGHT);
            }
            else if (this.nodeName == RIGHT_BUMPER) {
                context.fillStyle="#312812";
                context.fillRect(0, -this.parent.attrs.BASE_HEIGHT / 2, this.attrs.THICKNESS, this.parent.attrs.BASE_HEIGHT);
            }
            context.restore();
        },

        // Overrides parent method
        pointInObject: function(coords) {
            var _this = this;

            var point = AffineTransform.getTranslateInstance(coords.x, coords.y);

            // Generate inverse
            var inversePoint = point.clone().concatenate(this.objectTransform.clone().concatenate(this.startPositionTransform).createInverse());

            if (this.nodeName == FRONT_BUMPER || this.nodeName == REAR_BUMPER) {
                if (pointInBox(inversePoint, 0, this.parent.attrs.BASE_WIDTH / 2 * this.objectTransform.getScaleX(), this.attrs.THICKNESS, -this.parent.attrs.BASE_WIDTH / 2 * this.objectTransform.getScaleX())) {
                    console.log("Clicked " + this.nodeName);
                    this.parent.scalingY = true;
                }
                else {
                    return false;
                }
            }
            else {
                if (pointInBox(inversePoint, -this.parent.attrs.BASE_HEIGHT / 2 * this.objectTransform.getScaleY(), this.attrs.THICKNESS, this.parent.attrs.BASE_HEIGHT / 2 * this.objectTransform.getScaleY(), 0)) {
                    console.log("Clicked " + this.nodeName);
                    this.parent.scalingX = true;
                    return false;
                }
                else {
                    return false;
                }
            }            
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
            BASE_WIDTH: 75,
            BASE_AXLE_OFFSET: 30
        }

        // Setup Tires of car
        if (this.nodeName == FRONT_AXLE_PART) {
            var leftTire = new TireNode(AffineTransform.getTranslateInstance(-this.attrs.BASE_WIDTH / 2, this.attrs.BASE_HEIGHT / 2), FRONT_LEFT_TIRE_PART);
            var rightTire = new TireNode(AffineTransform.getTranslateInstance(this.attrs.BASE_WIDTH / 2, this.attrs.BASE_HEIGHT / 2), FRONT_RIGHT_TIRE_PART);
        }
        else {
            var leftTire = new TireNode(AffineTransform.getTranslateInstance(-this.attrs.BASE_WIDTH / 2, this.attrs.BASE_HEIGHT / 2), BACK_LEFT_TIRE_PART);
            var rightTire = new TireNode(AffineTransform.getTranslateInstance(this.attrs.BASE_WIDTH / 2, this.attrs.BASE_HEIGHT / 2), BACK_RIGHT_TIRE_PART);
        }
        this.addChild(leftTire);
        this.addChild(rightTire);
    };

    _.extend(AxleNode.prototype, GraphNode.prototype, {
        // Overrides parent method
        render: function(context) {
            this.objectTransform.copyFrom(this.scaleTransform).concatenate(this.translationTransform);

            context.save();
            context.setAffineTransform(this.startPositionTransform.clone().concatenate(this.objectTransform));

            context.fillStyle="red";
            context.fillRect(-this.attrs.BASE_WIDTH/2, 0, this.attrs.BASE_WIDTH, this.attrs.BASE_HEIGHT);
            context.restore();

            context.save();
            context.setAffineTransform(this.startPositionTransform.clone().concatenate(this.translationTransform));

            _.each(this.children, function(c) {
                c.render(context);
            });

            context.restore();
        },

        // Overrides parent method
        pointInObject: function(point) {
            var _this = this;

            var matrixFromPoint = AffineTransform.getTranslateInstance(point.x, point.y);
            var childPoint = _.clone(point);

            // Generate inverse
            var invMatrixFromPoint = matrixFromPoint.clone().concatenate(this.objectTransform.clone().concatenate(this.startPositionTransform).createInverse());
            childPoint.x = invMatrixFromPoint.getTranslateX();
            childPoint.y = invMatrixFromPoint.getTranslateY();

            _.each(this.children, function(c) {
                c.pointInObject(childPoint);
            });

            // The axle doesn't do anything so it just passes the event down to its children
        },

        scale: function(coords) {
            var point = AffineTransform.getTranslateInstance(coords.x, coords.y);

            // Generate inverse
            var inversePoint = point.clone().concatenate(this.objectTransform.clone().concatenate(this.startPositionTransform).createInverse());
        },

        manipulate: function(point) {
            var matrixFromPoint = AffineTransform.getTranslateInstance(point.x, point.y);
            var childPoint = _.clone(point);

            // Generate inverse
            var invMatrixFromPoint = matrixFromPoint.clone().concatenate(this.objectTransform.clone().concatenate(this.startPositionTransform).createInverse());
            childPoint.x = invMatrixFromPoint.getTranslateX();
            childPoint.y = invMatrixFromPoint.getTranslateY();

            _.each(this.children, function(c) {
                c.manipulate(childPoint);
            });
        },

        stopManipulate: function() {
            _.each(this.children, function(c) {
                c.stopManipulate();
            })
        }
    });

    /**
     * @param tirePartName Which tire this node represents
     * @constructor
     */
    var TireNode = function(startPositionTransform, tirePartName) {
        this.initGraphNode(new AffineTransform(), tirePartName);

        this.startPositionTransform = startPositionTransform;
        
        this.attrs = {
            BASE_WIDTH: 10,
            BASE_HEIGHT: 15
        }
    };

    _.extend(TireNode.prototype, GraphNode.prototype, {
        // Overrides parent method
        render: function(context) {
            context.save();

            // Must move it vertically the same way as its parent
            // this.translationTransform = this.parent.translationTransform.clone();

            // Set its translationX to the equivalent of how much the axle scaled
            this.translationTransform.setToTranslation(this.startPositionTransform.getTranslateX() * (this.parent.scaleTransform.getScaleX() - 1), this.translationTransform.getTranslateY());

            this.objectTransform.setToTranslation(this.translationTransform.getTranslateX(), this.translationTransform.getTranslateY());

            context.setAffineTransform(this.startPositionTransform.clone().concatenate(this.objectTransform));
            context.globalCompositeOperation = 'source-over';

            context.fillStyle="#282828";
            context.fillRect(-this.attrs.BASE_WIDTH / 2, -this.attrs.BASE_HEIGHT / 2, this.attrs.BASE_WIDTH, this.attrs.BASE_HEIGHT);
            context.restore();
        },

        // Overrides parent method
        pointInObject: function(coords) {
            var _this = this;

            var point = AffineTransform.getTranslateInstance(coords.x, coords.y);

            // Generate inverse
            var inversePoint = point.clone().concatenate(this.objectTransform.clone().concatenate(this.startPositionTransform).createInverse());

            if (pointInBox(inversePoint, -this.attrs.BASE_HEIGHT / 2, this.attrs.BASE_WIDTH / 2, this.attrs.BASE_HEIGHT / 2, -this.attrs.BASE_WIDTH / 2)) {
                this.scalingAxle = true;

                console.log("Clicked " + this.nodeName);
            }
        },

        manipulate: function(point) {
            var matrixFromPoint = AffineTransform.getTranslateInstance(point.x, point.y);
            var childPoint = _.clone(point);

            // Generate inverse
            var invMatrixFromPoint = matrixFromPoint.clone().concatenate(this.objectTransform.clone().concatenate(this.startPositionTransform).createInverse());
            childPoint.x = invMatrixFromPoint.getTranslateX();
            childPoint.y = invMatrixFromPoint.getTranslateY();
        
            if (this.scalingAxle) {
                console.log("hey");
                this.parent.scaleTransform.setToScale((this.parent.parent.scaleTransform.getScaleX() * this.parent.parent.attrs.BASE_WIDTH + this.parent.attrs.BASE_AXLE_OFFSET + invMatrixFromPoint.getTranslateX()) / this.parent.attrs.BASE_WIDTH, 1);
                console.log("here");
                q("#canvas").getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                this.parent.parent.render(q("#canvas").getContext('2d'));
            }
        },

        stopManipulate: function() {
            this.scalingAxle = false;
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
