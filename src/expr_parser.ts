import { PreExpr, splitPreStatements } from './pre_program_parser.js';
import { binOpTable } from './operators.js';
import { Program, parseProgram } from './parser.js';
import { splitArray, assert } from './util.js';

export type StringLit = {kind: 'stringLit'; value: string;}
export type IntLit = {kind: 'intLit'; value: bigint;}
export type BoolLit = {kind: 'boolLit'; value: boolean;}
export type Identifier = {kind: 'identifier'; name: string;}
export type Funcall = {kind: 'funcall'; fun: Identifier, args: Expr[];}
export type Function = {kind: 'function'; args: Identifier[]; body: Program }

export type Expr = BoolLit | IntLit | StringLit
    | Identifier | Funcall | Function;

export function parseExpr(e: PreExpr): Expr
{
    if (e.kind !== 'preExpr'){
        console.error(JSON.stringify(e));
        throw new Error('parseExpr called on not-an-expr');
    }
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
    if (v[0].kind === 'operator') {
        const functionName : Identifier = {
            kind: 'identifier',
            name: 'operator' + v[0].contents
        }
        const remainder = { kind: 'preExpr' as 'preExpr', val : v.slice(1) };
        const funcall : Funcall =
            { kind: 'funcall',
              fun: functionName,
              args: [parseExpr(remainder)]
            }
        return funcall;
    }
    if (v.length === 2 && v[0].kind === 'id'
        && v[1].kind === 'paren'){
        /* An expression with exactly two tokens, and the first is not an
         * operator. Thus, a function call. Inline lambdas are currently
         * not allowed.
         */
        const fun : Identifier = { kind: 'identifier', name: v[0].contents }
        const args = splitArray(v[1].kids, t => t.kind === 'comma')
            .map(x => parseExpr({kind: 'preExpr', val: x}));
        return {kind: 'funcall', fun, args};
    }
    if (v.length === 3 && v[0].kind === 'paren'
        && v[1].kind === 'lambdaArrow' && v[2].kind === 'brace')
    {
        // the expression is a lambda
        v[0].kids.forEach(t =>
            assert(
                t.kind === 'comma' || t.kind === 'id',
                `function expression malformed parameter list:\n${JSON.stringify(t, null, 2)}`
            ));

        const args: Identifier[] = v[0].kids
            .filter(t => t.kind === 'id')
            .map(t => { assert(t.kind === 'id');
                        return { kind: 'identifier', name: t.contents };});
        const body = parseProgram(splitPreStatements(v[2].kids));
        return { kind: 'function', args, body};
    }
    // find the location of the least-precedence binary operator
    let idx = -1;
    let precedence = Infinity;
    let op = null;
    for(let i = 0; i < v.length; i++){
        const t = v[i];
        if(t.kind === 'operator' &&
            t.contents in binOpTable &&
            binOpTable[t.contents] < precedence)
        {
            idx = i;
            precedence = binOpTable[t.contents];
            op = 'operator'+t.contents;
        }
    }
    assert(op !== null);
    if(idx < 1){
        throw new Error(`parse error in expression ${JSON.stringify(e, undefined, 2)}`);
    }
    const expr1 = parseExpr({kind: 'preExpr', val: v.slice(0, idx)});
    const expr2 = parseExpr({kind: 'preExpr', val: v.slice(idx+1)});
    return {
        kind: 'funcall',
        fun: { kind: 'identifier', name: op },
        args: [expr1, expr2]
    }
}
