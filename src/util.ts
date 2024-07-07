export function assert(condition: any, msg?: string): asserts condition {
    if(!condition){
        throw new Error('Assertion failed with: ' + msg);
    }
}

export function splitArray<T>(xs: T[], p:(_: T) => boolean): T[][]{
    const out : T[][] = [];
    let current: T[] = [];
    for(let x of xs){
        if (p(x)){
            out.push(current);
            current = [];
        } else {
            current.push(x);
        }
    }
    return out;
}
