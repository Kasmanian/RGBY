class Game {
    constructor(arg) {
        switch(type(arg)) {
            case `object`:
                break
            case `number`:
                this.size = this.lastX = this.lastY = this.liveX = this.liveY = arg;
                this.grid = this.makeGrid(arg);
                this.meta = new Set();
                break
            default:
                break
        }
    }
    makeGrid(size) {
        // Creates a 2D array representing 9 size-by-size faces, where the 5 middle (a cross) represent colored faces (numbered 1-5).
        let grid = new Array(size*3).fill(0);
        let tags = [1, 2, 3, 4, 5]
            .map(n => ({n, sort: Math.random()}))
            .sort((a, b) => a.sort - b.sort)
            .map(({n}) => n);
        for (let i=0; i<grid.length; i++) {
            let line = i%size!=0? [...grid[i-1]] : [];
            for (let j=0; line.length<size*3; j=line.length) {
                let iInMid = (i/grid.length)>=(1/3)&&(i/grid.length)<(2/3);
                let jInMid = (j/grid.length)>=(1/3)&&(j/grid.length)<(2/3);
                if (iInMid||jInMid) {
                    for (let k=0; k<size; k++) line.push(tags[tags.length-1]);
                    tags.pop();
                }
                else line.push(0);
            }
            grid[i] = line;
        }
        return grid;
    }
    shiftBy(dist, axis) {
        // Given a distance dist and an axis, the grid will be updated to reflect a move:
        // +1 axis = vertical; -1 axis = horizontal; dist can be negative or positive along each axis.
        // Returns true if the grid was changed or false otherwise.
        let a, b, c, d;
        let lastGrid = copy(this.grid);
        let lastMeta = new Set(this.meta);
        let inBounds = true;
        this.meta.clear();
        for (let i=0; inBounds&&i<this.size*3; i++) {
            if (axis<0) if (i>=this.liveY&&i<this.liveY+this.size) continue;
            if (axis>0) if (i>=this.liveX&&i<this.liveX+this.size) continue;
            for (let j=0; inBounds&&j<this.size; j++) {
                [a, c] = axis<0? [i, i] : dist<0? [this.liveY+dist+j, this.liveY+j] : [this.liveY+dist+this.size-1-j, this.liveY+this.size-1-j];
                [b, d] = axis>0? [i, i] : dist<0? [this.liveX+dist+j, this.liveX+j] : [this.liveX+dist+this.size-1-j, this.liveX+this.size-1-j];
                if (type(this.grid[a][b])!=`number`||type(this.grid[c][d])!=`number`) inBounds = false;
                else {
                    [this.grid[a][b], this.grid[c][d]] = [this.grid[c][d], this.grid[a][b]];
                    this.meta.add(`${a}, ${b}`);
                }
            }
        }
        if (inBounds) {
            [this.lastX, this.liveX] = axis<0? [this.liveX, this.liveX+dist] : [this.lastX, this.liveX];
            [this.lastY, this.liveY] = axis>0? [this.liveY, this.liveY+dist] : [this.lastY, this.liveY];
            return true;
        }
        else {
            this.grid = lastGrid;
            this.meta = lastMeta;
            return false;
        }
    }
    shuffle() {
        // Performs randomized moves over a set number of iterations in order to simulate shuffling.
        for (let i=0; i<9999; i++) {
            let dist;
            let axis = Math.random()<0.5? -1 : 1;
            let xRange = [this.liveX, this.size*3-this.liveX-this.size];
            let yRange = [this.liveY, this.size*3-this.liveY-this.size];
            if (axis<0) {
                dist = Math.random()<0.5? -Math.ceil(Math.random()*xRange[0]) : Math.ceil(Math.random()*xRange[1]);
            }
            else {
                dist = Math.random()<0.5? -Math.ceil(Math.random()*yRange[0]) : Math.ceil(Math.random()*yRange[1]);
            }
            this.shiftBy(dist, axis);
        }
    }
    isSolved() {
        // Checks to see if each 'face' is solved; optimized to skip over already-solved faces. Will look at the top-left
        // corner of each face and check to see if it is uniform over a size-by-size area.
        let isSolved = [true, false, false, false, false, false];
        for (let i=0; i<this.size*3; i++) {
            for (let j=0; j<this.size*3;) {
                if (!isSolved[this.grid[i][j]]) {
                    for (let k=i; k<i+this.size; k++) for (let l=j; l<j+this.size; l++) if (this.grid[i][j]!=this.grid[k][l]) return false;
                    isSolved[this.grid[i][j]] = true;
                }
                j += this.grid[i][j]!=0? this.size : 1;
            }
        }
        return true;
    }
    toString() {
        let string = ``
        for (let line of this.grid) {
            for(let unit of line) string+=`${unit}  `;
            string += `\n`;
        }
        return string;
    }
}
function type(value) {
    let type = Object.prototype.toString.call(value);
    type = type.substring(type.indexOf(' ')+1, type.indexOf(']'));
    return type.toLowerCase();
}
function copy(array) {
    return array.map(e => Array.isArray(e) ? copy(e) : e);
}