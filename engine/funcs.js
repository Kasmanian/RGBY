export function type(value) {
    let type = Object.prototype.toString.call(value);
    type = type.substring(type.indexOf(' ')+1, type.indexOf(']'));
    return type.toLowerCase();
}
export function copy(array) {
    return array.map(e => Array.isArray(e) ? copy(e) : e);
}
export function alph(value) {
    let key = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    let ret = '';
    let end = false;
    while (!end) {
        ret += key[value%10];
        value = Math.trunc(value/10);
        end = value<1;
    }
    return ret;
}
export function deci(value) {
    let key = {'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7, 'i': 8, 'j': 9};
    let ret = 0;
    let dig = 1;
    for (let char of value) {
        ret += key[char]*dig;
        dig *= 10;
    }
    return ret;
}
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export function redef(value, ret) {
    return value!=undefined? value : ret;
}