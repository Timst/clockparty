# Clock party!

This is a very straightforward piece of code that does two things:

- Display a minimalistic clock
- Change the lights of a connected Philipps Hue system

## Clock party?

A good chunk of the code is currently hardcoded to fit the requirement of my famed "Clock Parties", where you take a color-coded shot every 30 minutes. As a result, this is what the code does:

- **20:00:00**: the party starts. At the beginning, the color of both the clocks and light is white. We start drawing a circle shape on a black backround, counting down until 20:30. The lights start on low brightness, and get increasingly brighter as we get closer to the end of the half-hour.
- **20:29:00**: on the last minute of every half-hour, the stroke of the circle starts getting increasingly thicker, so that the cirle becomes full at the end (currently there is a bug where the circle becomes *too* full and start overflowing on itself) 
- **20:29:45**: we use the "alert" feature of the Hue system to make the lights blink for 15 seconds
- **21:00:00**: after the full circle, we restart from the beginning, but this time both the drawn circle and the Hue system shift to red. The colors are defined at the top of the JS file. Brightness goes back to low, and we start slowly increasing it as the circle fills, etc.
- **Rest of  the night**: the cycle repeats every half hour, changing colors until midnight. Currently, after midnight, the lights stay on the color of the last circle (purple). This could be changed, as even at full brightness, this is pretty dark.

The code is somewhat flexible: you can change "type" to make each section last longer (current values are one minute, half a hour (default), one hour, or "until midnight"), the Hue feature can be disabled, and you can mess with the constants to somewhat easily change colors, stroke thickness, etc.

## Making it work

It *should* work pretty much out of the box. The one thing that needs to be changed is the address of the Hue bridge, defined as a constant in the JS file. I think bridges are set to accept local network commands by default, but I might be misremembering. 

Testing can be done by setting the system time to the desired time. On Windows/Chrome, there is a small bug where the new time takes 30-60 seconds to be captured by the clock (refreshing doesn't help), so plan accordingly. 
