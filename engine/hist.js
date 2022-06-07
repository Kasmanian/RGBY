export default class Hist {
    constructor(keys, object) {
        this.keys = keys;
        this.history = {...object};
    }
    hasChanged(object) {
        for (let key of this.keys) {
            if (this.history[key]!=object[key]) return true;
        }
        return false;
    }
    recover(object) {
        for(let key of this.keys) {
            object[key]=this.history[key];
        }
    }
}