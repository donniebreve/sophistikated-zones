/*
    Sophistikated Zones
    'Fancy' zones for KDE Plasma

    github.com/donniebreve

    GNU General Public License v2.0
*/

let padding = 10;
let layout = {
    size: 1,
    direction: 'horizontal', // areas will be placed horizontally (in a row)
    areas: [
        {
            size: 0.666
        },
        {
            size: 0.334,
            direction: 'vertical', // areas will be placed vertically (in a column)
            areas: [
                {
                    size: 0.5
                },
                {
                    size: 0.5
                }
            ]
        }
    ]
}
let spaces = [];
calculateLayout(layout);
printLayout(layout);
printSpaces(spaces);

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
 * Calculates the layout areas.
 * 
 * @param {object} node The starting layout node.
 */
function calculateLayout(node) {
    if (!node.x && !node.y) {
        let parent = workspace.clientArea(KWin.MaximizeArea, workspace.activeScreen, workspace.currentDesktop);
        node.x = parent.x;
        node.y = parent.y;
        node.width = parent.width;
        node.height = parent.height;
    }
    node.isGroup = node.areas && node.areas.length > 0;
    if (node.isGroup) {
        for (var i = 0; i < node.areas.length; i++){
            let child = node.areas[i];
            if (node.direction == 'horizontal') {
                child.x = node.x;
                child.y = node.y;
                child.height = node.height;
                if (i > 0) {
                    child.x = node.areas[i - 1].x + node.areas[i - 1].width + 1;
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
                    child.y = node.areas[i - 1].y + node.areas[i - 1].height + 1;
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
        if (isOverlapping(geometry, space) && overlapPercentage(geometry, space) > .5) {
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
        if (isOverlapping(geometry, space) && overlapPercentage(geometry, space) > .5) {
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

// Shortcuts
// ----------

function toggleSnap() {
    snap = !snap;
}

registerShortcut("Sophistikated Zones", "Toggle snapping", "Meta+Shift+Z", toggleSnap);
