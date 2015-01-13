# Components
* Size
* Location
* Responds to input events
* Paint

When you start painting, you need to setup the coords so that the child can paint under the assumption the top-left corner of the parent is the origin. 

Children paint relative to their parent.

As the event goes down the interactor tree, you have to transform the coordinates. If when you click a child, the parent's origin is (50,50), then a click at (100,150) relative to the root `html` element will be (50,100) relative to the parent.

If you're building a spreadsheet component in Qt, there are a number of operations you would want to support:

* Selecting and editing cells
* Set focus
* Set cell value
* Remove row, column
* Merge cells
* Resize cell
* Filter, sort cell
* Multiple rows, columns
* Duplicate cells
* Formula support
* Paint it
* Respond to events

# MVC
## Model:
* represents the data
* methods for manipulating the data
* ability to register listeners
* ability to register listeners
* notify listeners whenever data changes
* knows nothing about view or rest of world

## View
* renders the data in a model
* requires a reference to the model
* registers itself with the model as a listener

## Controller
* Intermediary between the model and the view
* interprets input events, when a mousedown happens, controller says what that does
* interprets model events


 
