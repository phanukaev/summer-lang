
export type binOpSignature = {
    precedence: number;
    leftType: string;
    rightType: string;
}
    
export const binOpTable: {[index: string]: binOpSignature} = (() => {
    let out: typeof binOpTable = {};
    const binOpList: Array<[string, number, string, string]> = [
        // boolean
        ['||', 10, 'Bool', 'Bool'],
        ['&&', 10, 'Bool', 'Bool'],
        // equality
        ['==', 20, '1', '1'],
        ['!=', 20, '1', '1'],
        // numbers
        ['+', 30, 'Int', 'Int'],
        ['-', 30, 'Int', 'Int'],
        ['*', 40, 'Int', 'Int'],
        ['/', 40, 'Int', 'Int'],
        ['%', 40, 'Int', 'Int'],
        // strings
        ['++', 30, 'Str', 'Str'], // concatenation
    ];
    binOpList.forEach(([o, precedence, leftType, rightType]) => {
        out[o] = {precedence, leftType, rightType};
    });
    return out;
})();

export type unOpSignature = {
    type: string;
}

export const unOpTable: {[index:string]: unOpSignature} = (() => {
    let out: typeof unOpTable = {};
    const unOpList: Array<[string, string]> = [
        ['!', 'Bool'],
        ['-', 'Int']
    ];
    unOpList.forEach(([o, type]) => { out[o] = {type}});
    return out;
})();
