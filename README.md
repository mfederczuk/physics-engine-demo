<!--
  Copyright (c) 2022 Michael Federczuk
  SPDX-License-Identifier: CC-BY-SA-4.0
-->

# Simple Physics/Collision Engine Demo #

This is a test/demo/experiment of a very simple physics/collision engine, written in ECMAScript and using HTML5 Canvas'.

The demo is available on GitHub Pages: <https://mfederczuk.github.io/physics-engine-demo>  
Currently there is only a box with a few entities randomly moving around in it and one entity (the "subject")
that is (by default) controlled by the user.

Some of the engine's configuration can be adjusted live. Playing around with the console is encouraged. For example:

```javascript
// gravity can be dynamically changed:
state.gravity.reverse() // reverses gravity, the entities will float upwards
state.gravity.changeDirection(45) // changes gravity to be 45° (0° is downwards), the entities will be pulled to the lower right corner
state.gravity.changeMagnitude(5) // changes strength of gravity (default is 0.5), jumping won't gain as much height

state.subject.noclip = true // turns of gravity and bounds collision for the subject

state.subject.controller = new RandomController() // subject will begin to move randomly
state.subject.controller = new WebKeyboardController(window) // you're back in control of the subject

state.subject.velocity.setXdYd(75, -75) // violently fling the subject into the upper right corner

state.subject.jumpSpeed = 50 // give the subject mad hops
state.subject.manualMovementSpeed = 50 // make the subject 2 fast 4 u
```

## License ##

This engine is licensed under both the [**Mozilla Public License 2.0**](LICENSES/MPL-2.0.txt) AND the
[**Apache License 2.0**](LICENSES/Apache-2.0.txt).  
For more information about copying and licensing, see the [`COPYING.txt`](COPYING.txt) file.

---

Special thanks to Nicolae "Xelu" Berbece for the keyboard button icons, which are licensed under [CC0] and can be found
here: <https://thoseawesomeguys.com/prompts>

[CC0]: <https://creativecommons.org/publicdomain/zero/1.0> "Creative Commons &mdash; CC0 1.0 Universal"
