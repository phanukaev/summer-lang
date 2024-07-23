import { assert, splitArray } from './util.js';
import { Brackets } from './pre_program_parser.js';
import { Token } from './lexer.js';

export type TypeName = { kind: 'typeName'; name: string; }
export type FunctionType = {
    kind: 'functionType';
    source: TypeSignature[];
    target: TypeSignature;
}
export type TypeSignature = TypeName | FunctionType;

export function TypeName(name: string): TypeName {return { kind: 'typeName', name };}
export function parseTypeSig(ts: Array<Token|Brackets>): TypeSignature
{
    assert(ts.length === 3 || ts.length === 1,
           `parentheses are required in function type signatures: ${ts}`);
    if(ts.length === 1){
        let t = ts[0];
        if(t.kind === 'type'){
            return { kind: 'typeName', name: t.contents };
        }
        assert(t.kind === 'paren');
        return parseTypeSig(t.kids);
    }
    assert(ts[1].kind === 'typeArrow');
    let target = parseTypeSig([ts[2]]);
    let src = ts[0];
    assert(src.kind === 'paren');
    let source = splitArray(src.kids, x => x.kind === 'comma')
        .map(x => parseTypeSig(x));
    return { kind: 'functionType', source, target };
}


export function typeEqual(t1: TypeSignature, t2: TypeSignature): boolean
{
    if(t1.kind !== t2.kind){
        return false;
    }
    if (t1.kind === 'typeName'){
        assert(t2.kind === 'typeName');
        return t1.name === t2.name;
    }
    if (t1.kind === 'functionType'){
        assert(t2.kind === 'functionType');
        if (t1.source.length !== t2.source.length) return false;
        if (!typeEqual(t1.target, t2.target)) return false;
        for( let i = 0; i < t1.source.length; i++){
            if (!typeEqual(t1.source[i], t2.source[i])) return false
        }
        return true;
    }
    assert(false);
}
