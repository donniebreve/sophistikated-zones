/*
    Sophistikated Zones
    'Fancy' zones for KDE Plasma

    github.com/donniebreve

    GNU General Public License v2.0
*/

// Configuration
let padding = 10;
let layout = {
    size: 1,
    direction: 'horizontal', // areas will be placed horizontally (in a row)
    areas: [
        {
            size: 0.6
        },
        {
            size: 0.4,
            direction: 'vertical', // areas will be placed vertically (in a column)
            areas: [
                {
                    size: 0.6,
                },
                {
                    size: 0.4,
                }
            ]
        }
    ]
}
let spaces = [];

// Flags
var snap = true;
var resized = false;

/**
 * Checks if two rectangles are overlapping
 * 
 * @param {rectangle} rectangleOne 
 * @param {rectangle} rectangleTwo 
 * @returns {boolean}
 */
function isOverlapping(rectangleOne, rectangleTwo) {
    let pointOneX = rectangleOne.x;
    let pointOneY = rectangleOne.y;
    let pointTwoX = rectangleOne.x + rectangleOne.width;
    let pointTwoY = rectangleOne.y + rectangleOne.height;
    let pointThreeX = rectangleTwo.x;
    let pointThreeY = rectangleTwo.y;
    let pointFourX = rectangleTwo.x + rectangleTwo.width;
    let pointFourY = rectangleTwo.y + rectangleTwo.height;
    return !(pointOneY > pointFourY || pointOneX > pointFourX || pointTwoY < pointThreeY || pointTwoX < pointThreeX);
}

/**
 * Calculates the overlapping percentage of two rectangles.
 * 
 * @param {rectangle} rectangleOne 
 * @param {rectangle} rectangleTwo 
 * @returns {decimal} The overlap percentage with respect to the smaller rectangle.
 */
function overlapPercentage(rectangleOne, rectangleTwo) {
    let pointOneX = rectangleOne.x;
    let pointOneY = rectangleOne.y;
    let pointTwoX = rectangleOne.x + rectangleOne.width;
    let pointTwoY = rectangleOne.y + rectangleOne.height;
    let pointThreeX = rectangleTwo.x;
    let pointThreeY = rectangleTwo.y;
    let pointFourX = rectangleTwo.x + rectangleTwo.width;
    let pointFourY = rectangleTwo.y + rectangleTwo.height;
    let rectangleOneArea = Math.abs(pointTwoX - pointOneX) * Math.abs(pointTwoY - pointOneY);
    let rectangleTwoArea = Math.abs(pointFourX - pointThreeX) * Math.abs(pointFourY - pointThreeY);
    let overlappingArea = (Math.max(pointOneX, pointThreeX) - Math.min(pointTwoX, pointFourX)) * (Math.max(pointOneY, pointThreeY) - Math.min(pointTwoY, pointFourY));
    if (rectangleTwoArea < rectangleOneArea) {
        let temp = rectangleOneArea;
        rectangleOneArea = rectangleTwoArea;
        rectangleTwoArea = temp;
    }
    let percentage = overlappingArea / rectangleOneArea;
    return percentage;
}

/**
 * Calculates the layout areas. Loops through all the children nodes (areas) of a node
 * and calculates the width (if a horizontal group) or the height (if a vertical group).
 * 
 * Group nodes control the maximum size of children nodes.
 * 
 * Recursively calculates the children layout nodes.
 * 
 * @param {object} node The starting layout node.
 */
function calculateLayout(node) {
    node.isGroup = node.areas && node.areas.length > 0;
    if (node.isGroup) {
        for (var i = 0; i < node.areas.length; i++){
            let child = node.areas[i];
            if (node.direction == 'horizontal') {
                child.x = node.x;
                child.y = node.y;
                child.height = node.height;
                if (i > 0) {
                    child.x = node.areas[i - 1].x + node.areas[i - 1].width;
                }
                if (child.size && child.size > 0) {
                    child.width = Math.floor(node.width * child.size);
                }
            }
            if (node.direction == 'vertical') {
                child.x = node.x;
                child.y = node.y;
                child.width = node.width;
                if (i > 0) {
                    child.y = node.areas[i - 1].y + node.areas[i - 1].height;
                } 
                if (child.size && child.size > 0) {
                    child.height = Math.floor(node.height * child.size);
                }
            }
            calculateLayout(child, node, spaces);
        }
    }
    else {
        spaces.push(node);
    }
}

/**
 * Applies gaps to the window spaces.
 * 
 * @param {object} parent The parent space (client area).
 * @param {array} spaces An array of spaces.
 */
function applyGaps(parent, spaces) {
    for (var i = 0; i < spaces.length; i++) {
        let space = spaces[i];
        if (Math.abs(space.x - parent.x) <= 1) {
            // outside gap
            space.x += padding;
            space.width -= padding;
        }
        else {
            // inside gap
            space.x += Math.floor(padding / 2);
            space.width -= Math.floor(padding / 2);
        }
        if (Math.abs(space.y - parent.y) <= 1) {
            // outside gap
            space.y += padding;
            space.height -= padding;
        }
        else {
            // inside gap
            space.y += Math.floor(padding / 2);
            space.height -= Math.floor(padding / 2);
        }
        if (Math.abs((space.x + space.width) - (parent.x + parent.width)) <= 1) {
            // outside gap
            space.width -= padding;
        }
        else {
            // inside gap
            space.width -= Math.floor(padding / 2);
        }
        if (Math.abs((space.y + space.height) - (parent.y + parent.height)) <= 1) {
            // outside gap
            space.height -= padding;
        }
        else {
            // inside gap
            space.height -= Math.floor(padding / 2);
        }
    }
}

/**
 * Prints the layout areas.
 * 
 * @param {object} node The starting layout node.
 */
function printLayout(node) {
    if (node.isGroup) {
        print('group');
    }
    else {
        print('area');
    }
    print('  x: ' + node.x);
    print('  y: ' + node.y);
    print('  width : ' + node.width);
    print('  height: ' + node.height);
    if (node.areas && node.areas.length > 0) {
        for (var i = 0; i < node.areas.length; i++) {
            printLayout(node.areas[i]);
        }
    }
}

/**
 * Prints the window spaces.
 * 
 * @param {array} spaces An array of spaces.
 */
function printSpaces(spaces) {
    for (var i = 0; i < spaces.length; i++) {
        print('space[' + i + ']');
        print('  x: ' + spaces[i].x);
        print('  y: ' + spaces[i].y);
        print('  width : ' + spaces[i].width);
        print('  height: ' + spaces[i].height);
    } 
}

// Client functions
// -----------------

var clientMoveStart = function(client) {
    if (client == null) {
        return;
    }
    workspace.hideOutline();
    resized = false;
}

var clientMoving = function(client) {
    if (client == null || !snap) {
        workspace.hideOutline();
        return;
    }
    if (client.resize) {
        resized = true;
        workspace.hideOutline();
        return;
    }
    let geometry = client.frameGeometry;
    for (var i = 0; i < spaces.length; i++) {
        let space = spaces[i];
        if (isOverlapping(geometry, space) && overlapPercentage(geometry, space) > .6) {
            workspace.showOutline(space);
            break;
        }
    }
}

var clientMoveStop = function(client) {
    if (client == null || !snap || resized) {
        workspace.hideOutline();
        return;
    }
    workspace.hideOutline();
    let geometry = client.frameGeometry;
    for (var i = 0; i < spaces.length; i++) {
        let space = spaces[i];
        if (isOverlapping(geometry, space) && overlapPercentage(geometry, space) > .6) {
            client.frameGeometry = space;
            break;
        }
    }
}

// Workspace functions
// --------------------

var attachToClient = function(client) {
    client.clientStartUserMovedResized.connect(clientMoveStart);
    client.clientStepUserMovedResized.connect(clientMoving);
    client.clientFinishUserMovedResized.connect(clientMoveStop);
}

// Attach to running clients
let clients = workspace.clientList();
for (var i = 0; i < clients.length; i++) {
    attachToClient(clients[i]);
}

// Receive new client events
workspace.clientAdded.connect(attachToClient);

var recalculateLayout = function(event) {
    print('trigger event::' + event + ', recalculating layout');
    let parent = workspace.clientArea(KWin.MaximizeArea, workspace.activeScreen, workspace.currentDesktop);
    layout.x = parent.x;
    layout.y = parent.y;
    layout.width = parent.width;
    layout.height = parent.height;
    spaces.length = 0;
    calculateLayout(layout);
    printLayout(layout);
    if (padding > 0) {
        applyGaps(parent, spaces);
    }
    printSpaces(spaces);
}

// Receive desktop layout changed events
// This is also the primary entry point
workspace.activitiesChanged.connect(function() { recalculateLayout('activitiesChanged'); } )
workspace.activityAdded.connect(function() { recalculateLayout('activityAdded'); } )
workspace.activityRemoved.connect(function() { recalculateLayout('activityRemoved'); } )
workspace.currentActivityChanged.connect(function() { recalculateLayout('currentActivityChanged'); });
workspace.currentDesktopChanged.connect(function() { recalculateLayout('currentDesktopChanged'); });
workspace.numberDesktopsChanged.connect(function() { recalculateLayout('numberDesktopsChanged'); });
workspace.numberScreensChanged.connect(function() { recalculateLayout('numberScreensChanged'); });
workspace.screenResized.connect(function() { recalculateLayout('screenResized'); });
recalculateLayout('loaded');

// Shortcuts
// ----------

function toggleSnap() {
    snap = !snap;
}

registerShortcut('Sophistikated Zones', 'Sophistikated Zones: Toggle snapping', '', function(){
    toggleSnap();
});