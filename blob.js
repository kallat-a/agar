// Blob constructor function
function Blob(x, y, r, color) {
    this.pos = createVector(x, y);
    this.r = r;
    this.vel = createVector(0, 0);
    this.color = color;

    this.update = function () {
        var newvel = createVector(mouseX - width / 2, mouseY - height / 2);
        newvel.setMag(3); // Base speed
        this.vel.lerp(newvel, 0.1);

        // Adjust speed based on size
        var speed = 3 - this.r / 50; // Decrease speed as the radius increases
        speed = max(speed, 1); // Set a minimum speed so the blob doesn't become too slow

        this.vel.setMag(speed); // Apply the speed
        this.pos.add(this.vel);
    }

    this.eatsFood = function (food) {
        var d = p5.Vector.dist(this.pos, createVector(food.x, food.y));
        var growthRate = 0.1; // Lower this value to make growth slower
        if (d < this.r + food.r) {
            var sum = Math.PI * this.r * this.r + growthRate * Math.PI * food.r * food.r; // Corrected line
            this.r = Math.sqrt(sum / Math.PI); // Also ensure to use Math.sqrt
            return true;
        } else {
            return false;
        }
    };

    this.eats = function (other) {
        var d = p5.Vector.dist(this.pos, createVector(other.x, other.y));
        var growthRate = 0.1; // Lower this value to make growth slower
        if (d < this.r - other.r) {
            var sum = PI * this.r * this.r + growthRate * PI * other.r * other.r;
            this.r = sqrt(sum / PI);
            return true;
        } else {
            return false;
        }
    }

    this.constrain = function (worldSize) {
        blob.pos.x = constrain(blob.pos.x, -worldSize.width / 2, worldSize.width / 2);
        blob.pos.y = constrain(blob.pos.y, -worldSize.height / 2, worldSize.height / 2);
    }


    this.show = function () {
        fill(this.color[0], this.color[1], this.color[2]);
        stroke(0);
        strokeWeight(1);
        ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
    }


}