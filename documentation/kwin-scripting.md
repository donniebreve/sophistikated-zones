# Folder structure

The docs glaze over the fact that the structure has to be:
```
path/to/project
    contents
        code
            main.js
    metadata.desktop
```

The **contents** directory must be exactly 'contents'.

# Metadata file

The docs glaze over the fact that you do not specify the contents directory in the path of the `X-Plasma-MainScript`. The 'contents' part of the path is an internal magic string.

``` toml
[Desktop Entry]
Name=My Script
...

X-Plasma-MainScript=~~contents/~~code/main.js
```

# Interactive console

Open the interactive console with:  
krunner/start: `wm console`  
terminal: `plasma-interactiveconsole --kwin`  

# Viewing logs

The interactive console does not print output (from `print()`, go figure...)

To view logs, you should restart kwin in a terminal window using `kwin --restart &`. You will be restarting KWin a lot during development anyway since there's no other way to stop/remove running scripts. Up arrow will be your friend.

You can also view logs using `journalctl -f -t kwin_x11`.

# Debugging a packaged script

When you have made it far enough to start testing the script using `kpackagetool5 --type=KWin/Script -u ~/Projects/sophistikated-zones/`, remember your up arrow friend! You will need to restart KWin after installing/upgrading the script to get things to refresh.

# Shortcuts

There are currently a few bugs with attempting to register a shortcut that is already taken. Something like `Meta+{Key}` is almost certainly taken already. I suggest leaving your shortcuts blank during testing and manually setting the shortcut you prefer in `System Settings`.

``` javascript
registerShortcut('Sophistikated Zones', 'Sophistikated Zones: Toggle snapping', '', function(){
    toggleSnap();
});
```