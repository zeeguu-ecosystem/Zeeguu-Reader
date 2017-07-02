# UI Design
## Goals
Our team strongly believes in the [Material Design](https://material.io/guidelines/#introduction-principles) philosophy, where hierarchy, meaning and focus are combined with tactile and intuitive design. 

![ZEEGUU](asset/material.jpg)

As the application's primary focus is to help the user _identify_ and _read_ articles (in many different languages), we would like to minimise the number of distractions on the screen. Material design helps us achieve this goal, but we in turn must be careful to not clutter the screen with either features or unnecessary information. At the same time, actions, settings, and information should remain quick and intuitive to access. We believe that tools which are hard to reach or identify, will end up not being used by our users.

Finally, the interface has to be as responsive and consistent, due to the system having to be compatible with a broad range of web-enabled devices without modifying the code-base.

## Implementation
Adhering to the goals mentioned above, we came up with the design as described below. We made use of the MDL framework to implement most of these designs, along with Google's wonderfully broad set of [Material Design icons](https://material.io/icons/). The framework is designed to be optimally responsive, where the scale and position of elements will adapt to fit many resolutions and dimensions. Custom styling had to be defined, where elements are either scaled to percentages of the screen or the size of the font. This should (and has been tested to) keep the custom elements properly scaled.

When it comes to color, we usually went with a light or dimmed blue for important items, unless there was a clear reason not to (see the section about article listing). This is to attract the attention of the user whilst remaining easy on the eye if they intend to ignore it. Anything else should be neutral white - just like paper, or a light gray - for background elements.
