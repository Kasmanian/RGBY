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
        // Creates a 2D array representing 9 size-by-size faces, where the 5 middle (a cross) represent colored faces (numbered 1-5)
        let grid = new Array(size*3).fill(0);
        let tags = [1, 2, 3, 4, 5]
            .map(n => ({ n, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ n }) => n);
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
        // Given a distance dist and an axis, the grid will be updated to reflect a move
        // +1 axis = vertical; -1 axis = horizontal; dist can be negative or positive along each axis
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
        }
        else {
            this.grid = lastGrid;
            this.meta = lastMeta;
        }
    }
    shuffle() {
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
    toString() {
        let string = ``
        for (let line of this.grid) {
            for(let unit of line) string+=`${unit}  `;
            string+=`\n`;
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

// moveRight(grid, size, dist, liveX) {
// 	for (let i=0; i<size*3; i++) {
// 		for (let j=0; j<size; j++) {
// 			[grid[i][liveX+size-1+dist-j], grid[i][liveX+size-1-j]] = [grid[i][liveX+size-1-j], grid[i][liveX+size-1+dist-j]];
// 		}
// 	}
// }
// moveLeft(grid, size, dist, liveX) {
// 	for (let i=0; i<size*3; i++) {
// 		for (let j=0; j<size; j++) {
// 			[grid[i][liveX+dist+j], grid[i][liveX+j]] = [grid[i][liveX+j], grid[i][liveX+dist+j]];
// 		}
// 	}
// }
// moveUp(grid, size, dist, liveY) {
// 	for (let i=0; i<size*3; i++) {
// 		for (let j=0; j<size; j++) {
// 			[grid[liveY+dist+j][i], grid[liveY+j][i]] = [grid[liveY+j][i], grid[liveY+dist+j][i]];
// 		}
// 	}
// }
// moveDown(grid, size, dist, liveY) {
// 	for (let i=0; i<size*3; i++) {
// 		for (let j=0; j<size; j++) {
// 			[grid[liveY+dist+size-1-j][i], grid[liveY+size-1-j][i]] = [grid[liveY+size-1-j][i], grid[liveY+dist+size-1-j][i]];
// 		}
// 	}
// }
                // let a = bias<0? i : dist<0? this.liveY+dist+j : this.liveY+dist+this.size-1-j;
                // let b = bias>0? i : dist<0? this.liveX+dist-j : this.liveX+dist+this.size-1-j;
                // let c = bias<0? i : dist<0? this.liveY+j : this.liveY+size-1-j;
                // let d = bias>0? i : dist<0? this.liveX+j : this.liveX+size-1-j;

let game = new Game(3);
console.log(game.toString());
game.shuffle();
console.log(game.toString());