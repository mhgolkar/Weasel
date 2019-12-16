# Weasel
**WebSocket Client / Console**   

An In-Browser Helper Console for WS Test and Developement    
Check out its github.io page for a [working demo](https://mhgolkar.github.io/Weasel/)  
Note: Demo Works with WSS (Secured WS) Only. To Use with WS You May Fork/Download the Weasel.  

* Single HTML5 Document  
* Modern Browsers  
* Works Offline (Local Dev)  
* Dependency-free  
* Embeddable  
* Colorized Memory Slots  
* Supports Sub-Protocols  
* Supports Binary Communication  
* Syntax Highlighting (JSON)  
* Lightweight  
* Eye-Friendly Light / Dark Theme   
* Sent Message History   
  
also available as :  
**[FireFox Add-on](https://addons.mozilla.org/en-US/firefox/addon/websocket-weasel/)**  

[![](https://raw.githubusercontent.com/mhgolkar/Weasel/gh-pages/websocket-weasel-in-action.png)](https://mhgolkar.github.io/Weasel/) 

## Tips
`Ctrl + Enter` to Send Text Message  
`Ctrl + Alt + B` to Send Selected Binary  
`Ctrl + M` Memorize  
`Ctrl + Alt + M` Remember Next Memory Slot  
Right Click on a Memory Slot to Remove it  
Double Click on a Memory Slot to Remember and Send it   
`Ctrl + Alt + Z` Move Backward in the Sent Message History   
`Ctrl + Alt + X` Move Forward in the Sent Message History   
`Ctrl + Alt + Enter` Open/Override Socket   
`Ctrl + Alt + S` Switch Autoscroll   
`Ctrl + <numeral key>` Remembers Memory Slots by Index (e.g. Ctrl+0 recalls the first memory)   

## Changelog
### v1.2.0
Few Updates Including:  
- Default Theme is now Dark  
- New Color Scheme for the Light Theme  
- Store / Restore / Clear Memory Slots (localStorage)  
- Shortcut to Send Message [ Ctrl + Enter ]  

### v1.3.0
Better Binary Support & Other Minor Improvements:  
- Shows Name, Type and Size of the Sent/Received Binary  
- Detects Major File Formats using file Signatures (Magic Numbers)  
- Shows Links which help Preview received Binaries Easier (Save or Open in new tab)  

### v1.4.x
- JSON Syntax Highlighting  
- New Key Bindings   
- Other Minor Improvements   
- Fixing Unsafe assignment to innerHTML (v1.4.1)   
- Sent Message History (v1.4.3)   
- Switch Autoscroll (v1.4.3)   
- More Responsive, Mobile-Friendly Design (v1.4.4)   

### v2
- Total UI retouch   
- New shortcuts   
- Better support for multiple sub-protocols (comma separated)   
- Better support for mobile devices   
