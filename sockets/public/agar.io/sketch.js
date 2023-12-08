var socket;

var blob;

var blobs = [];

var worldSize = { width: 4096, height: 4096 };

var foodBlobs = [];

var zoom = 1;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Start a socket connection to the server
  // Some day we would run this server somewhere else
  socket = io.connect('http://localhost:3000');

  socket.on('worldSize', function (ws) {
    worldSize = ws;
  });

  blob = new Blob(
    random(-worldSize.width / 2, worldSize.width / 2),
    random(-worldSize.height / 2, worldSize.height / 2), 16,
    [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255)]);
  // Make a little object with x and y
  var data = {
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r,
    color: blob.color,
  };
  socket.emit('start', data);

  socket.on('heartbeat', function (data) {
    //console.log(data);
    blobs = data.players; // Assuming players' data is sent under 'players' key
    foodBlobs = data.food; // Receive food blobs data
  });

  socket.on('blobEaten', function (updatedBlob) {
    // Check if the updated blob is the current client's blob
    console.log(updatedBlob);
    if (updatedBlob.id === socket.id) {
      blob.pos.x = random(-worldSize.width / 2, worldSize.width / 2);
      blob.pos.y = random(-worldSize.height / 2, worldSize.height / 2);
      blob.r = 16;
    }
  });
}

function drawBoundaries() {
  push();
  stroke(255, 0, 0);
  strokeWeight(4);
  noFill();
  translate(worldSize.width / 2, worldSize.height / 2);
  rect(-worldSize.width, -worldSize.height, worldSize.width, worldSize.height);
  pop();
}

function drawGrid() {
  let gridSpacing = 16; // Size of each grid square
  let leftBound = blob.pos.x - (width / 2) / zoom;
  let rightBound = blob.pos.x + (width / 2) / zoom;
  let topBound = blob.pos.y - (height / 2) / zoom;
  let bottomBound = blob.pos.y + (height / 2) / zoom;

  stroke(200); // Light gray for grid lines

  for (let x = leftBound - (leftBound % gridSpacing); x < rightBound; x += gridSpacing) {
    line(x, topBound, x, bottomBound);
  }
  for (let y = topBound - (topBound % gridSpacing); y < bottomBound; y += gridSpacing) {
    line(leftBound, y, rightBound, y);
  }
}

function displayScoreboard() {
  // Sort blobs in descending order of their radius (score)
  var sortedBlobs = blobs.slice().sort((a, b) => b.r - a.r);

  // Position and dimensions for the scoreboard
  var scoreboardX = width - 310; // slightly more to the left to accommodate background width
  var scoreboardY = 10;
  var scoreboardWidth = 300;
  var scoreboardHeight = 20 * Math.min(6, sortedBlobs.length) + 40; // Calculate height based on number of blobs

  // Draw the background for the scoreboard
  fill(0, 0, 0, 150); // Semi-transparent black background
  noStroke();
  rect(scoreboardX, scoreboardY, scoreboardWidth, scoreboardHeight, 10); // 10 for rounded corners

  // Set up text properties
  textSize(16);
  fill(0, 255, 0); // Green color for text
  var textX = width - 165;
  var textY = 30; // Start a little bit down from the top edge

  // Display the title of the scoreboard
  text("Scoreboard", textX, textY);

  // Loop through the top 5 blobs (or fewer if there aren't that many) and display their score
  for (var i = 0; i < Math.min(5, sortedBlobs.length); i++) {
    textY += 20; // Move down for each entry
    var scoreText = "#" + (i + 1) + " - " + sortedBlobs[i].id + ": " + sortedBlobs[i].r.toFixed(2); // Display blob ID and size
    text(scoreText, textX, textY);
  }
}


function draw() {
  background(255);
  console.log(blob.pos.x, blob.pos.y);

  translate(width / 2, height / 2);
  var newzoom = 64 / blob.r;
  zoom = lerp(zoom, newzoom, 0.1);
  scale(zoom);
  translate(-blob.pos.x, -blob.pos.y);

  drawGrid();


  for (var i = blobs.length - 1; i >= 0; i--) {
    var blobsi = blobs[i];
    if (blobsi.id !== socket.id) {
      if (blob.eats(blobsi)) {
        (socket.emit('eatBlob', i));
      } else {
        fill(blobs[i].color[0], blobs[i].color[1], blobs[i].color[2]);
        stroke(0);
        strokeWeight(1);
        ellipse(blobs[i].x, blobs[i].y, blobs[i].r * 2, blobs[i].r * 2);
        fill(255);
        textAlign(CENTER);
        textSize(4);
        text(blobs[i].id, blobs[i].x, blobs[i].y + blobs[i].r);
      }
    }
  }


  for (var i = 0; i < foodBlobs.length; i++) {
    if (blob.eatsFood(foodBlobs[i])) {
      (socket.emit('eatFood', i));
    } else {
      fill(foodBlobs[i].color[0], foodBlobs[i].color[1], foodBlobs[i].color[2]); // Set color for food blobs, e.g., yellow
      noStroke();
      ellipse(foodBlobs[i].x, foodBlobs[i].y, foodBlobs[i].r * 2, foodBlobs[i].r * 2);
    }
  }

  blob.show();
  blob.update();
  blob.constrain(worldSize);

  var data = {
    x: blob.pos.x,
    y: blob.pos.y,
    r: blob.r,
    color: blob.color
  };
  socket.emit('update', data);
  drawBoundaries();

  resetMatrix();
  displayScoreboard();
}