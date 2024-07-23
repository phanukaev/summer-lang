import { TypeCheckCtx } from './typechecker.js';
import { TypeSignature, TypeName } from './types.js';


const [Bool, Int, String] = ['Bool', 'Int', 'String'].map(x => TypeName(x));
export const builtinBinOpTypes:
[string, TypeSignature, TypeSignature, TypeSignature][]
    = [
        ['||', Bool, Bool, Bool],
        ['&&', Bool, Bool, Bool],
        ['==', Int, Int, Bool],
        ['!=', Int, Int, Bool],
        ['+', Int, Int, Int],
        ['-', Int, Int, Int],
        ['*', Int, Int, Int],
        ['/', Int, Int, Int],
        ['%', Int, Int, Int],
        ['<', Int, Int, Bool],
        ['>', Int, Int, Bool],
        ['<=', Int, Int, Bool],
        ['>=', Int, Int, Bool],
        ['++', String, String, String]
    ];
