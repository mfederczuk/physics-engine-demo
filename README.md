# Simple Physics/Collision Engine Demo #

This is a test/demo/experiment of a very simple physics/collision engine, written in ECMAScript and using HTML5 Canvas'.

The demo is available on GitHub Pages: <https://mfederczuk.github.io/physics-engine-demo>  
Currently there is only on entity (the "subject") moveable in a box.

Some of the engine's configuration can be adjusted live. Playing around with the console is encouraged. For example:

```javascript
// gravity can be dynamically changed:
state.gravity.reverse() // reverses gravity, the subject will float upwards
state.gravity.changeDirection(45) // changes gravity to be 45° (0° is downwards), the subject will move to the right
state.gravity.changeMagnitude(5) // changes strength of gravity (default is 0.5), jumping won't gain as much height

state.subject.noclip = true // turns of gravity and bounds collision for the subject

state.subject.controller = new RandomController() // subject will begin to move randomly
state.subject.controller = new WebKeyboardController(window) // you're back in control of the subject

state.subject.velocity.setXdYd(75, -75) // violently fling the subject into the upper right corner

state.subject.jumpSpeed = 50 // give the subject mad hops
state.subject.manualMovementSpeed = 50 // make the subject 2 fast 4 u
```
