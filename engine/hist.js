export default class Hist {
    constructor(keys, object) {
        this.keys = keys;
        this.history = {...object};
    }
    hasChanged(object) {
        for (let key of this.keys) {
            if (typeof this.history[key]==='object'&&!Array.isArray(this.history[key])&&this.history[key]!==null) {
                for (let subkey of Object.keys(this.history[key])) if (this.history[key][subkey]!=object[key][subkey]) return true;
            }
            else if (this.history[key]!=object[key]) return true;
        }
        return false;
    }
    recover(object) {
        for(let key of this.keys) {
            object[key]=this.history[key];
        }
    }
}