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
        initGraphNode: function(nodeName, startPositionTransform) {

            this.nodeName = nodeName;

            // The transform that will position this object, relative
            // to its parent
            this.startPositionTransform = startPositionTransform;

            // Any additional transforms of this object after the previous transform
            // has been applied
            this.objectTransform = new AffineTransform();

            this.scaleTransform = new AffineTransform();
            this.translationTransform = new AffineTransform();
            this.rotationTransform = new AffineTransform();

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
        this.initGraphNode(CAR_PART, startPosition);

        this.moving = false;
        this.scalingX = false;
        this.scalingY = false;
        this.rotatingFront = false;
        this.rotatingBack = false;

        this.attrs = {
            BASE_HEIGHT: 100,
            BASE_WIDTH: 50,
            MAX_HEIGHT: 200,
            MIN_HEIGHT: 50,
            MAX_WIDTH: 150,
            MIN_WIDTH: 25
        }

        // Setup Bumpers of car
        var frontBumper = new BumperNode(FRONT_BUMPER, AffineTransform.getTranslateInstance(0, -this.attrs.BASE_HEIGHT / 2 - 5));
        var rearBumper = new BumperNode(REAR_BUMPER, AffineTransform.getTranslateInstance(0, this.attrs.BASE_HEIGHT / 2));
        var leftBumper = new BumperNode(LEFT_BUMPER, AffineTransform.getTranslateInstance(-this.attrs.BASE_WIDTH / 2 - 5, 0));
        var rightBumper = new BumperNode(RIGHT_BUMPER, AffineTransform.getTranslateInstance(this.attrs.BASE_WIDTH / 2, 0));
        
        // Setup Axles of car
        var frontAxle = new AxleNode(FRONT_AXLE_PART, AffineTransform.getTranslateInstance(0, -this.attrs.BASE_HEIGHT / 2 + 10));
        var rearAxle = new AxleNode(BACK_AXLE_PART, AffineTransform.getTranslateInstance(0, this.attrs.BASE_HEIGHT / 2 - 15));

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
            // The translation transform is never used, why make the line unnecessarily long?
            this.objectTransform.copyFrom(this.rotationTransform).concatenate(this.scaleTransform);

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
            
            context.restore();
            context.save();
            // Remove scaling going down, so only rotation applies
            context.setAffineTransform(this.startPositionTransform.clone().concatenate(this.rotationTransform));
            context.globalCompositeOperation = 'destination-over';

            _.each(this.children, function(c) {
                c.render(context);
            });

            context.restore();
        },

        // Overrides parent method
        pointInObject: function(point) {
            var _this = this;

            // Generate inverse, no children care about scaling
            var inverseMatrix = this.startPositionTransform.clone().concatenate(this.rotationTransform).concatenate(this.translationTransform).createInverse();
            var inverseMatrixScaling = this.startPositionTransform.clone().concatenate(this.objectTransform).createInverse();

            var invPoint = _.clone(point);
            invPoint = applyMatrixToPoint(inverseMatrix, invPoint);

            var invPointScaling = _.clone(point);
            invPointScaling = applyMatrixToPoint(inverseMatrixScaling, invPointScaling);

            console.log(point.x + " " + point.y);
            console.log(invPointScaling.x + " " + invPointScaling.y);

            _.each(this.children, function(c) {
                c.pointInObject(invPoint);
            });

            if (pointInBox(invPointScaling, -this.attrs.BASE_HEIGHT / 2, this.attrs.BASE_WIDTH / 2, this.attrs.BASE_HEIGHT / 2, -this.attrs.BASE_WIDTH / 2)) {
                console.log('Clicked ' + this.nodeName +  " AT " + point.x + " " + point.y);
                
                // Check if we clicked in the front area for rotation
                if (pointInBox(invPointScaling, -this.attrs.BASE_HEIGHT / 2, this.attrs.BASE_WIDTH / 2, -this.attrs.BASE_HEIGHT / 4, -this.attrs.BASE_WIDTH / 2)) {
                    console.log("Rotation front area");
                    this.rotatingFront = true;
                }
                // Check if we clicked in the back area for rotation
                else if (pointInBox(invPointScaling, this.attrs.BASE_HEIGHT / 4, this.attrs.BASE_WIDTH / 2, this.attrs.BASE_HEIGHT / 2, -this.attrs.BASE_WIDTH / 2)) {
                    console.log("Rotation back area");
                    this.rotatingBack = true;
                }
                else {
                    this.moving = true;
                }
            }

        },

        manipulate: function(point) {

            var matrixFromPoint = new AffineTransform();

            // Generate inverse
            var inverseMatrix = matrixFromPoint.clone().concatenate(this.startPositionTransform.clone().createInverse());
            var inverseMatrixWithRotate = matrixFromPoint.clone().concatenate(this.startPositionTransform.clone().concatenate(this.rotationTransform).createInverse());
            
            // Get the point to pass down to child nodes
            var invPoint = _.clone(point);
            invPoint = applyMatrixToPoint(inverseMatrix, invPoint);

            var invPointWithRotate = _.clone(point);
            invPointWithRotate = applyMatrixToPoint(inverseMatrixWithRotate, invPointWithRotate);

            if (this.moving) {
                this.move(point);
            }
            else if (this.scalingX) {
                invPointWithRotate.x = Math.abs(invPointWithRotate.x);
                invPointWithRotate.y = Math.abs(invPointWithRotate.y);
                this.scaleX(invPointWithRotate);
            }
            else if (this.scalingY) {
                invPointWithRotate.x = Math.abs(invPointWithRotate.x);
                invPointWithRotate.y = Math.abs(invPointWithRotate.y);
                this.scaleY(invPointWithRotate);
            }
            else if (this.rotatingFront) {
                invPoint.x = invPoint.x * -1;
                invPoint.y = invPoint.y * -1;
                this.rotateFront(invPoint);
            }
            else if (this.rotatingBack) {
                invPoint.x = invPoint.x;
                invPoint.y = invPoint.y;
                this.rotateBack(invPoint);
            }

            _.each(this.children, function(c) {
                c.manipulate(invPointWithRotate);
            });
        },

        stopManipulate: function() {
            this.moving = false;
            this.scalingX = false;
            this.scalingY = false;
            this.rotatingFront = false;
            this.rotatingBack = false;

            _.each(this.children, function(c) {
                c.stopManipulate();
            });
        },

        rotateFront: function(point) {
            console.log("X: " + point.x);
            console.log("Y: " + point.y);
            console.log(Math.atan2(point.y, point.x));
            this.rotationTransform.setToRotation(Math.atan2(point.y, point.x) - Math.PI / 2, 0, 0);

            q("#canvas").getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            this.render(q("#canvas").getContext('2d'));
        },

        rotateBack: function(point) {
            console.log("X: " + point.x);
            console.log("Y: " + point.y);
            console.log(Math.atan2(point.y, point.x));
            this.rotationTransform.setToRotation(Math.atan2(point.y, point.x) - Math.PI / 2, 0, 0);

            q("#canvas").getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            this.render(q("#canvas").getContext('2d'));
        },

        move: function(point) {
            this.startPositionTransform.setToTranslation(point.x, point.y);
            q("#canvas").getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            this.render(q("#canvas").getContext('2d'));
        },

        scaleX: function(point) {
            var scaleX = point.x / (this.attrs.BASE_WIDTH / 2);

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
            this.children[LEFT_BUMPER].translationTransform.setToTranslation((point.x - this.attrs.BASE_WIDTH / 2) * -1, 0);
            this.children[RIGHT_BUMPER].translationTransform.setToTranslation(point.x - this.attrs.BASE_WIDTH / 2, 0);

            // scale FRONT AND REAR bumpers
            this.children[FRONT_BUMPER].scaleTransform.setToScale(scaleX, 1);
            this.children[REAR_BUMPER].scaleTransform.setToScale(scaleX, 1);

            // Scale TOP and BOTTOM axles
            this.children[FRONT_AXLE_PART].scaleTransform.setToScale(((this.children[FRONT_AXLE_PART].attrs.WIDTH / 2) + point.x - this.attrs.BASE_WIDTH / 2) / (this.children[FRONT_AXLE_PART].attrs.WIDTH / 2), 1);
            this.children[BACK_AXLE_PART].scaleTransform.setToScale(((this.children[BACK_AXLE_PART].attrs.WIDTH / 2) + point.x - this.attrs.BASE_WIDTH / 2) / (this.children[BACK_AXLE_PART].attrs.WIDTH / 2), 1);

            q("#canvas").getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            this.render(q("#canvas").getContext('2d'));
            console.log("Scaling X");
        },

        scaleY: function(point) {
            var scaleY = point.y / (this.attrs.BASE_HEIGHT / 2);

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
            this.children[BACK_AXLE_PART].translationTransform.setToTranslation(0, point.y - this.attrs.BASE_HEIGHT / 2);
            this.children[FRONT_AXLE_PART].translationTransform.setToTranslation(0, (point.y - this.attrs.BASE_HEIGHT / 2) * -1);

            // Translate TOP and BOTTOM bumpers
            this.children[REAR_BUMPER].translationTransform.setToTranslation(0, point.y - this.attrs.BASE_HEIGHT / 2);
            this.children[FRONT_BUMPER].translationTransform.setToTranslation(0, (point.y - this.attrs.BASE_HEIGHT / 2) * -1);

            q("#canvas").getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            this.render(q("#canvas").getContext('2d'));
            console.log("Scaling Y");
        }
    });

    /**
     * Node for the front and back bumpers of the car
     */
    var BumperNode = function(bumperName, startPosition) {
        this.initGraphNode(bumperName, startPosition);

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
        pointInObject: function(point) {
            var _this = this;

            var matrix = new AffineTransform();

            // Generate inverse
            var inverseMatrix = matrix.clone().concatenate(this.startPositionTransform.clone().concatenate(this.objectTransform).createInverse());

            var invPoint = _.clone(point);
            invPoint = applyMatrixToPoint(inverseMatrix, invPoint);

            if (this.nodeName == FRONT_BUMPER || this.nodeName == REAR_BUMPER) {
                if (pointInBox(invPoint, 0, this.parent.attrs.BASE_WIDTH / 2, this.attrs.THICKNESS, -this.parent.attrs.BASE_WIDTH / 2)) {
                    console.log("Clicked " + this.nodeName);
                    this.parent.scalingY = true;
                }
                else {
                    return false;
                }
            }
            else {
                if (pointInBox(invPoint, -this.parent.attrs.BASE_HEIGHT / 2, this.attrs.THICKNESS, this.parent.attrs.BASE_HEIGHT / 2, 0)) {
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
    var AxleNode = function(axlePartName, startPosition) {
        this.initGraphNode(axlePartName, startPosition);

        this.attrs = {
            BASE_HEIGHT: 5,
            BASE_WIDTH: 90,
            WIDTH: 90,
            MIN_WIDTH: 90,
            MAX_WIDTH: 220
        }

        // Setup Tires of car
        if (this.nodeName == FRONT_AXLE_PART) {
            var leftTire = new TireNode(FRONT_LEFT_TIRE_PART, AffineTransform.getTranslateInstance(-this.attrs.WIDTH / 2, this.attrs.BASE_HEIGHT / 2));
            var rightTire = new TireNode(FRONT_RIGHT_TIRE_PART, AffineTransform.getTranslateInstance(this.attrs.WIDTH / 2, this.attrs.BASE_HEIGHT / 2));
        }
        else {
            var leftTire = new TireNode(BACK_LEFT_TIRE_PART, AffineTransform.getTranslateInstance(-this.attrs.WIDTH / 2, this.attrs.BASE_HEIGHT / 2));
            var rightTire = new TireNode(BACK_RIGHT_TIRE_PART, AffineTransform.getTranslateInstance(this.attrs.WIDTH / 2, this.attrs.BASE_HEIGHT / 2));
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
            context.fillRect(-this.attrs.WIDTH / 2, 0, this.attrs.WIDTH, this.attrs.BASE_HEIGHT);
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

            var matrixFromPoint = new AffineTransform();

            // Generate inverse
            var inverseMatrix = matrixFromPoint.clone().concatenate(this.startPositionTransform.clone().concatenate(this.translationTransform).createInverse());
            
            var invPoint = _.clone(point);
            invPoint = applyMatrixToPoint(inverseMatrix, invPoint);

            _.each(this.children, function(c) {
                c.pointInObject(invPoint);
            });

            // The axle doesn't do anything so it just passes the event down to its children
        },

        manipulate: function(point) {
            var matrix = new AffineTransform();

            // Generate inverse
            var inverseMatrix = matrix.clone().concatenate(this.startPositionTransform.clone().concatenate(this.objectTransform).createInverse());
            var invPoint = _.clone(point);
            invPoint = applyMatrixToPoint(inverseMatrix, invPoint);

            _.each(this.children, function(c) {
                c.manipulate(invPoint);
            });

            if (this.nodeName == FRONT_AXLE_PART) {
                this.children[FRONT_LEFT_TIRE_PART].startPositionTransform.setToTranslation(-this.attrs.WIDTH / 2, this.children[FRONT_LEFT_TIRE_PART].startPositionTransform.getTranslateY());
                this.children[FRONT_RIGHT_TIRE_PART].startPositionTransform.setToTranslation(this.attrs.WIDTH / 2, this.children[FRONT_RIGHT_TIRE_PART].startPositionTransform.getTranslateY());
            }

            else {
                this.children[BACK_LEFT_TIRE_PART].startPositionTransform.setToTranslation(-this.attrs.WIDTH / 2, this.children[BACK_LEFT_TIRE_PART].startPositionTransform.getTranslateY());
                this.children[BACK_RIGHT_TIRE_PART].startPositionTransform.setToTranslation(this.attrs.WIDTH / 2, this.children[BACK_RIGHT_TIRE_PART].startPositionTransform.getTranslateY());
            }

            q("#canvas").getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            this.parent.parent.render(q("#canvas").getContext('2d'));
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
    var TireNode = function(tirePartName, startPositionTransform) {
        this.initGraphNode(tirePartName, new AffineTransform());

        this.startPositionTransform = startPositionTransform;

        this.rotating = false;
        this.scalingAxle = false;
        
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

            this.objectTransform.copyFrom(this.translationTransform).concatenate(this.rotationTransform);

            context.setAffineTransform(this.startPositionTransform.clone().concatenate(this.objectTransform));
            context.globalCompositeOperation = 'source-over';

            context.fillStyle="#282828";
            context.fillRect(-this.attrs.BASE_WIDTH / 2, -this.attrs.BASE_HEIGHT / 2, this.attrs.BASE_WIDTH, this.attrs.BASE_HEIGHT);
            context.fillStyle="yellow";
            context.fillRect(-this.attrs.BASE_WIDTH / 2, -this.attrs.BASE_HEIGHT / 6, this.attrs.BASE_WIDTH, this.attrs.BASE_HEIGHT / 4);
            context.restore();
        },

        // Overrides parent method
        pointInObject: function(point) {
            var _this = this;

            var matrix = new AffineTransform();

            // Generate inverse
            var inverseMatrix = matrix.clone().concatenate(this.startPositionTransform.clone().concatenate(this.objectTransform).createInverse());

            var invPoint = _.clone(point);
            invPoint = applyMatrixToPoint(inverseMatrix, invPoint);

            if (pointInBox(invPoint, -this.attrs.BASE_HEIGHT / 2, this.attrs.BASE_WIDTH / 2, this.attrs.BASE_HEIGHT / 2, -this.attrs.BASE_WIDTH / 2)) {

                if (pointInBox(invPoint, -this.attrs.BASE_HEIGHT / 6, this.attrs.BASE_WIDTH / 2, this.attrs.BASE_HEIGHT / 4, -this.attrs.BASE_WIDTH / 2)) {
                    if (this.nodeName == FRONT_LEFT_TIRE_PART || this.nodeName == FRONT_RIGHT_TIRE_PART) {
                        this.scalingAxle = true;
                    }
                }
                else {
                    this.rotating = true;
                }

                console.log("Clicked " + this.nodeName);
            }
        },

        rotate: function(point) {
            // console.log((Math.atan2(point.y * -1, point.x * -1) - Math.PI / 2) * 180 / Math.PI);
            var angle = Math.atan2(point.y * -1, point.x * -1) - Math.PI / 2;
            
            console.log(angle);
            if (!(angle <= Math.PI / 4 && angle >= -Math.PI / 4 || angle >= -Math.PI - Math.PI / 4 && angle <= -Math.PI + Math.PI / 4)) {
                return;
            }
            _.each(this.parent.children, function(c) {
                if (c.nodeName == FRONT_RIGHT_TIRE_PART || c.nodeName == FRONT_LEFT_TIRE_PART) {
                    c.rotationTransform.setToRotation(angle, 0, 0);
                }
            });

            q("#canvas").getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            this.render(q("#canvas").getContext('2d'));
        },

        manipulate: function(point) {
            var _this = this;
            var matrix = new AffineTransform();

            var matrixFromPoint = new AffineTransform();

            // Generate inverse
            var inverseMatrix = matrixFromPoint.clone().concatenate(this.startPositionTransform.clone().createInverse());
            
            // Get the point to pass down to child nodes
            var invPoint = _.clone(point);
            invPoint = applyMatrixToPoint(inverseMatrix, invPoint);

            if (this.scalingAxle) {
                var newWidth = Math.abs(point.x) * 2;

                console.log("POINT: " + point.x);
                console.log("NEWWIDTH: " + newWidth);
                console.log("MAX WIDTH: " + this.parent.attrs.MAX_WIDTH);

                if (newWidth <= this.parent.attrs.MAX_WIDTH && newWidth >= this.parent.attrs.MIN_WIDTH) {
                    this.parent.parent.children[FRONT_AXLE_PART].attrs.WIDTH = Math.abs(point.x) * 2;
                    this.parent.parent.children[BACK_AXLE_PART].attrs.WIDTH = Math.abs(point.x) * 2;
                }
                
                else {
                    console.log("At width boundary");
                }

            }

            if (this.rotating) {
                this.rotate(invPoint);
            }
        },

        stopManipulate: function() {
            this.scalingAxle = false;
            this.rotating = false;
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
