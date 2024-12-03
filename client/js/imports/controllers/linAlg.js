// linAlg.js
export class Vec2 {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  
    add(vec) {
      return new Vec2(this.x + vec.x, this.y + vec.y);
    }
  
    toString() {
      return `${this.x},${this.y}`;
    }
  
    equals(vec) {
      return this.x === vec.x && this.y === vec.y;
    }
  }
  