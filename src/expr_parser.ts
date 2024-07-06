import { PreExpr } from './pre_program_parser.js';
import { binOpTable } from './operators.js';

export type StringLit = {kind: 'stringLit'; value: string;}
export type IntLit = {kind: 'intLit'; value: bigint;}
export type BoolLit = {kind: 'boolLit'; value: boolean;}
export type UnOpExpr = {kind: 'unOpExpr'; op: string; expr: Expr;}
export type BinOpExpr = {kind: 'binOpExpr'; op: string; expr1: Expr; expr2: Expr;}
export type Identifier = {kind: 'identifier'; name: string;}
export type Expr = BoolLit | IntLit | StringLit
    | Identifier | UnOpExpr | BinOpExpr;

export function parseExpr(e: PreExpr): Expr
{
    if (e.kind !== 'preExpr')
        throw new Error('parseExpr called on not-an-expr');
    const v = e.val;
    console.debug(v);
    if (v.length === 0)
        throw new Error('parseExpr called on empty expression');


    // if the expression consits of only one element, parse that directly
    if (v.length === 1){
        switch (v[0].kind){
            case 'paren':
                return parseExpr({kind: 'preExpr', val: v[0].kids});
            case 'id':
                return {kind: 'identifier', name: v[0].contents};
            case 'boolean':
                return {kind: 'boolLit',
                        value: v[0].contents === 'true' ? true : false};
            case 'number':
                return {kind: 'intLit', value: BigInt(v[0].contents)};
            case 'string':
                return {kind: 'stringLit', value: v[0].contents};
        }
        throw new Error(`parse error in expression ${e}`);
    }
    // if the first token is an operator, apply it and parse the rest.
    if (v[0].kind === 'operator'){
        const op = v[0].contents;
        const remainder = { kind: 'preExpr' as 'preExpr', val : v.slice(1) };
        return { kind: 'unOpExpr', op, expr: parseExpr(remainder)};
    }
    if (v.length === 2){
        // function call parsing goes here later.
    }
    // find the location of the least-precedence binary operator
    let idx = -1;
    let precedence = Infinity;
    let op = '';
    for(let i = 0; i < v.length; i++){
        const t = v[i];
        if(t.kind === 'operator' &&
            t.contents in binOpTable &&
            binOpTable[t.contents] < precedence)
        {
            idx = i;
            precedence = binOpTable[t.contents];
            op = t.contents;
        }
    }
    if(idx < 1)
        throw new Error(`parse error in expression ${e}`);
    const expr1 = parseExpr({kind: 'preExpr', val: v.slice(0, idx)});
    const expr2 = parseExpr({kind: 'preExpr', val: v.slice(idx+1)});
    return {kind: 'binOpExpr', op, expr1, expr2};
}
