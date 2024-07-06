export const binOpTable: { [index: string]: number } = {};

const binOpList: Array<[string, number]> =
    [ ['||', 10],
      ['&&', 10],
      ['==', 20],
      ['!=', 20],
      ['+', 30],
      ['-', 30],
      ['*', 40],
      ['/', 40],
      ['%', 40],
      ['<', 20],
      ['>', 20],
      ['<=', 20],
      ['>=', 20],
      ['++', 30]
    ];

export function addBinOp(name: string, precedence:  number): void{
    binOpTable[name] = precedence;
}
binOpList.forEach(d => addBinOp(...d));

// import { Type, TypeName, TypeVar } from './typeSignatures.js';
// 
// export type BinOp = { leftType: Type;
//                rightType: Type;
//                returnType: Type;
//                implementation: Function
//              }
// export type BinOpOverloads = {
//     precedence: number;
//     overloads: Array<BinOp>;
// }
// 
// type BinOpTable = {[index: string]: BinOpOverloads};
// export const binOpTable: BinOpTable = {};
// 
// function addBinOp(name: string, precedence: number,
//                   leftType: Type, rightType : Type,
//                   returnType: Type, table: BinOpTable): void
// {
//     if (name in table){
//         if (table[name].precedence !== precedence){
//             throw new Error(
//                 'attempting to oveload a binary operator with' +
//                 'more than once precedence');
//         } else {
//             table[name].overloads.push({leftType, rightType, returnType});
//         }
//     } else {
//         table[name] = {
//             precedence, overloads: [ {leftType, rightType, returnType} ]
//         };
//     }
// }
// const binOpList: Array<[string, number, Type, Type, Type]> = [
//     /* the columns below are
//      * operator name, precedence, left type, right type, return type
//      */
//     // boolean
//     ['||', 10, TypeName('Bool'), TypeName('Bool'), TypeName('Bool')],
//     ['&&', 10, TypeName('Bool'), TypeName('Bool'), TypeName('Bool')],
//     // equality
//     ['==', 20, TypeVar(1), TypeVar(1), TypeName('Bool')],
//     ['!=', 20, TypeVar(1), TypeVar(1), TypeName('Bool')],
//     // numbers
//     ['+', 30, TypeName('Int'), TypeName('Int'), TypeName('Int')],
//     ['-', 30, TypeName('Int'), TypeName('Int'), TypeName('Int')],
//     ['*', 40, TypeName('Int'), TypeName('Int'), TypeName('Int')],
//     ['/', 40, TypeName('Int'), TypeName('Int'), TypeName('Int')],
//     ['%', 40, TypeName('Int'), TypeName('Int'), TypeName('Int')],
//     // number comparison
//     ['<', 20, TypeName('Int'), TypeName('Int'), TypeName('Int')],
//     ['>', 20, TypeName('Int'), TypeName('Int'), TypeName('Int')],
//     ['<=', 20, TypeName('Int'), TypeName('Int'), TypeName('Int')],
//     ['>=', 20, TypeName('Int'), TypeName('Int'), TypeName('Int')],
//     // strings
//     // concatenation
//     ['++', 30, TypeName('Str'), TypeName('Str'), TypeName('Str')],
// ];
// binOpList.forEach((t) => addBinOp(...t, binOpTable));
// 
// export type UnOpSignature = {
//     overloads: Array<{inputType: Type, returnType: Type}>;
// }
// 
// export type UnOpTable = {[index:string]: UnOpSignature};
// export const unOpTable: UnOpTable  = {};
// 
// function addUnOpSignature(name: string, 
//                           inputType: TypeName, returnType: TypeName,
//                           table: UnOpTable): void
// {
//     if (name in table){
//         table[name].overloads.push({inputType, returnType});
//     } else {
//         table[name] = {
//             overloads: [ {inputType, returnType} ]
//         };
//     }
// }
// 
// const unOpList: Array<[string, Type, Type]> = [
//     ['!', TypeName('Bool'), TypeName('Bool')],
//     ['-', TypeName('Int'), TypeName('Int')]
// ];
// unOpList.forEach(t => addUnOpSignature(...t, unOpTable));
