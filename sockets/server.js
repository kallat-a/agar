var blobs = [];

var foodBlobs = [];

const worldSize = { width: 4096, height: 4096 }; // Define the world size


function Blob(id, x, y, r, color) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;
}

function createFoodBlob() {
    var x = (Math.random() - 1 / 2) * worldSize.width;
    var y = (Math.random() - 1 / 2) * worldSize.height;
    var r = Math.random() * (4 - 2) + 2; // Random size between 2 and 4
    var color = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
    return { x, y, r, color };
}

for (var i = 0; i < worldSize.width; i++) { // Adjust the number of initial food blobs as needed
    foodBlobs.push(createFoodBlob());
}

// Using express: http://expressjs.com/
var express = require('express');
// Create the app
var app = express();

// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 3000, listen);

// This call back just tells us that the server has started
function listen() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);

setInterval(heartbeat, 33);

function heartbeat() {
    io.sockets.emit('heartbeat', { players: blobs, food: foodBlobs });
}

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on(
    'connection',
    // We are given a websocket object in our function
    function (socket) {
        console.log('We have a new client: ' + socket.id);

        socket.emit('worldSize', worldSize); // Send world size to the client


        socket.on('start', function (data) {
            console.log(socket.id + ' ' + data.x + ' ' + data.y + ' ' + data.r + ' ' + data.color);
            var blob = new Blob(socket.id, data.x, data.y, data.r, data.color);
            blobs.push(blob);
        });

        socket.on('update', function (data) {
            //console.log(socket.id + " " + data.x + " " + data.y + " " + data.r);
            var blob;
            for (var i = 0; i < blobs.length; i++) {
                if (socket.id == blobs[i].id) {
                    blob = blobs[i];
                }
            }
            blob.x = data.x;
            blob.y = data.y;
            blob.r = data.r;
            blob.color = data.color;
        });

        socket.on('disconnect', function () {
            for (var i = 0; i < blobs.length; i++) {
                if (socket.id == blobs[i].id) {
                    blobs.splice(i, 1);
                }
            }
            console.log('Client has disconnected');
        });
        socket.on('eatBlob', function (i) {
            blobs[i].x = worldSize.width * 10;
            blobs[i].y = worldSize.height * 10;
            blobs[i].r = 16;
            io.to(blobs[i].id).emit('blobEaten', blobs[i]);
        });

        socket.on('eatFood', function (i) {
            foodBlobs.splice(i, 1);
            foodBlobs.push(createFoodBlob());
        });
    });