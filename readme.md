# Weasel
**WebSocket Client / Console**

In-Browser Helper Console for WS Test and Developement

* Lightweight
* Dependency-free & Embeddable
* Works Offline (Local) in Modern Browsers
* Supports Binary and textual communication
* Syntax Highlighting (JSON)
* Supports Sub-Protocols
* Eye-Friendly Light / Dark Theme
* Colorized Memory Slots
* Message History

Check out its github page for a [working demo](https://mhgolkar.github.io/Weasel/)  
> Online demo may only work with WSS (Secured WS;)
> To use with WS it's recommended to download the repo or use the [Firefox Add-on][firefox-addon].  

Also available as:

+ **[Firefox Add-on][firefox-addon]**

> Files in the `./src` directory consist the source of the Firefox add-on.  
> If you want to just use the tool, `./weasel.html` file is the only file you need.

[![](https://raw.githubusercontent.com/mhgolkar/Weasel/gh-pages/websocket-weasel-in-action.png)](https://mhgolkar.github.io/Weasel/) 


## Tips

+ `Ctrl + Enter` to Send Text Message
+ `Ctrl + Alt + B` to Send Selected Binary
+ `Ctrl + M` Memorize
+ `Ctrl + Alt + M` Remember Next Memory Slot
+ Right Click on a Memory Slot to Remove it
+ Double Click on a Memory Slot to Remember and Send it
+ `Ctrl + Alt + Z` Move Backward in the Sent Message History
+ `Ctrl + Alt + X` Move Forward in the Sent Message History
+ `Ctrl + Alt + Enter` Open/Override Socket
+ `Ctrl + Alt + S` Switch Autoscroll
+ `Ctrl + <numeral key>` Remembers Memory Slots by Index
    > e.g. `Ctrl+0` recalls the first memory
+ Message console input captures `tab` button press and inserts a "\t" character, when focused.
    > We can use `Ctrl + Alt + Shift + Tab` to jump out of it.

<!-- Refs -->
[firefox-addon]: https://addons.mozilla.org/en-US/firefox/addon/websocket-weasel/

