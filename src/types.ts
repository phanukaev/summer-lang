import { assert } from './util.js';
import { Brackets } from './pre_program_parser.js';
import { Token } from './lexer.js';

export type TypeName = { kind: 'typeName'; name: string; }
export type FunctionType = {
    kind: 'functionType';
    args: TypeSignature[];
    outType: TypeSignature;
}
export type TypeSignature = TypeName | FunctionType;

export function parseTypeSig(ts: Array<Token|Brackets>): TypeSignature
{
    assert(ts.length <= 3,
           `parentheses are required in function type signatures: ${ts}`);
    if(ts.length === 1){
        let t = ts[0];
        assert(t.kind === 'type');
        return { kind: 'typeName', name: t.contents };
    }
    assert(false);
}
