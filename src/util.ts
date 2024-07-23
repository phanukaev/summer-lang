export function assert(condition: any, msg?: string): asserts condition {
    if(!condition){
        throw new Error('Assertion failed with: ' + msg);
    }
}

function includesBy<T>(xs: T[], t: T, eq: (_0: T, _1: T) => boolean): boolean
{
    for(let x of xs){
        if(eq(t, x))
            return true
    }
    return false;
}

export function uniqueBy<T>(xs: T[], eq: (_0: T, _1: T) => boolean): T[]{
    if(xs.length === 0) return [];
    const out: T[] = [];
    for(let x of xs){
        if(!includesBy(out, x, eq))
            out.push(x);
    }
    return out;
}

export function splitArray<T>(xs: T[], p:(_: T) => boolean): T[][]{
    /* Take an array @xs@ and a predicate @p@,
     * return a 2D array where each element is a maximal, non-empty subsequence
     * of @xs@ all of whose elements don't satisfy @p@.
     */
    const out : T[][] = [];
    let current: T[] = [];
    for(let x of xs){
        if (p(x)){
            if(current.length !== 0) out.push(current);
            current = [];
        } else {
            current.push(x);
        }
    }
    if(current.length !== 0) out.push(current);
    return out;
}
