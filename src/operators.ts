import { Type, TypeName, TypeVar } from './typeSignatures.js';

export type BinOpSignature = {
    precedence: number;
    overloads: Array<{leftType: Type; rightType: Type; returnType: Type;}>;
}

export const binOpTable: {[index: string]: BinOpSignature} = {};

function addBinOp(name: string, precedence: number,
                  leftType: Type, rightType : Type, returnType: Type): void
{
    if (name in binOpTable){
        if (binOpTable[name].precedence !== precedence){
            throw new Error(
                'attempting to oveload an operator with' +
                'more than once precedence');
        } else {
            binOpTable[name].overloads.push({leftType, rightType, returnType});
        }
    } else {
        binOpTable[name] = {
            precedence, overloads: [ {leftType, rightType, returnType} ]
        };
    }
}
const binOpList: Array<[string, number, Type, Type, Type]> = [
    /* the columns below are
     * operator name, precedence, left type, right type, return type
     */
    // boolean
    ['||', 10, TypeName('Bool'), TypeName('Bool'), TypeName('Bool')],
    ['&&', 10, TypeName('Bool'), TypeName('Bool'), TypeName('Bool')],
    // equality
    ['==', 20, TypeVar(1), TypeVar(1), TypeName('Bool')],
    ['!=', 20, TypeVar(1), TypeVar(1), TypeName('Bool')],
    // numbers
    ['+', 30, TypeName('Int'), TypeName('Int'), TypeName('Int')],
    ['-', 30, TypeName('Int'), TypeName('Int'), TypeName('Int')],
    ['*', 40, TypeName('Int'), TypeName('Int'), TypeName('Int')],
    ['/', 40, TypeName('Int'), TypeName('Int'), TypeName('Int')],
    ['%', 40, TypeName('Int'), TypeName('Int'), TypeName('Int')],
    // number comparison
    ['<', 20, TypeName('Int'), TypeName('Int'), TypeName('Int')],
    ['>', 20, TypeName('Int'), TypeName('Int'), TypeName('Int')],
    ['<=', 20, TypeName('Int'), TypeName('Int'), TypeName('Int')],
    ['>=', 20, TypeName('Int'), TypeName('Int'), TypeName('Int')],
    // strings
    // concatenation
    ['++', 30, TypeName('Str'), TypeName('Str'), TypeName('Str')],
];
binOpList.forEach((t) => addBinOp(...t));

export type UnOpSignature = {
    overloads: Array<{inputType: Type, returnType: Type}>;
}
export const unOpTable: {[index:string]: UnOpSignature} = {};

function addUnOpSignature(name: string, 
                          inputType: Type, returnType: Type): void
{
    if (name in unOpTable){
        unOpTable[name].overloads.push({inputType, returnType});
    } else {
        unOpTable[name] = {
            overloads: [ {inputType, returnType} ]
        };
    }
}

const unOpList: Array<[string, Type, Type]> = [
    ['!', TypeName('Bool'), TypeName('Bool')],
    ['-', TypeName('Int'), TypeName('Int')]
];
unOpList.forEach(t => addUnOpSignature(...t));
