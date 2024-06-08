
export function logObject(x: any): void{
    const s = JSON.stringify(x, null, 2);
    console.log(s);
}

Object.defineProperty(BigInt.prototype, 'toJSON', {
    value: function() { return this.toString(); },
    configurable: true,
    enumerable: false,
    writable: true
});
