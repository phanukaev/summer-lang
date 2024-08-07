import { assert } from './util.js';
import {Token} from './lexer.js';

export type Brackets = {
    kind: 'top' | 'paren' | 'brace';
    kids: Array<Token|Brackets>;
}

function Brackets(kind: Brackets['kind'], kids: Brackets['kids'])
{
    return {kind, kids};
}

function matchBrackets(ts: Token[]): Brackets
{
    const e = new Error('mismatched brackets');
    let out: Brackets = Brackets('top', []);
    let stack: Array<Brackets> = [out];
    for (let t of ts) {
        switch (t.kind) {
            case 'openParen': {
                let b: Brackets = Brackets('paren', []);
                stack.at(-1)!.kids.push(b);
                stack.push(b);
                break;
            }
            case 'openBrace': {
                let b: Brackets = Brackets('brace', []);
                stack.at(-1)!.kids.push(b);
                stack.push(b);
                break;
            }
            case 'closeBrace': {
                if (stack.at(-1)!.kind !== 'brace')
                    throw e;
                stack.pop();
                break;
            }
            case 'closeParen': {
                if (stack.at(-1)!.kind !== 'paren')
                    throw e;
                stack.pop();
                break;
            }
            default:
                stack.at(-1)!.kids.push(t);
        }
    }
    if (stack.length !== 1)
        throw e;
    return out;
}

export type PreExpr = {
    kind: 'preExpr';
    val: Array<Token|Brackets>;
}
export type PreDeclare = {
    kind: 'preDeclare';
    type: Array<Token|Brackets>;
    target: string;
    val: PreExpr;
}
export type PreAssign = {
    kind: 'preAsgn';
    target: string;
    val: PreExpr;
}
export type PreIfStatement = {
    kind: 'preIf';
    condition: PreExpr;

    trueBranch: PreProgram;
    falseBranch: PreProgram;
}
export type PreWhileLoop = {
    kind: 'preWhile';
    condition: PreExpr;
    body: PreProgram;
}
export type PreReturn = {
    kind: 'preReturn';
    val: PreExpr | 'VOID';
}

export type PreStatement =
    PreDeclare | PreAssign | PreIfStatement
    | PreExpr | PreWhileLoop | PreReturn;

export type PreProgram = Array<PreStatement>; 

function splitPreDeclare(ts: Array<Token|Brackets>):
[PreDeclare, Array<Token|Brackets>]
{
    assert(ts[0].kind === 'let' && ts[1].kind === 'id'
        && ts[2].kind === 'typeColon',
           `parse error in variable declaration ${ts}`);
           
    const typeSig: Array<Token|Brackets> = [];
    let i = 3;
    while(true){
        let t = ts[i];
        if(t.kind === 'operator' && t.contents === '=') break;
        typeSig.push(t);
        i++;
    }
    const [val, remainder] = splitPreExpr(ts.slice(i+1));
    const firstPreStatement: PreDeclare =
        {kind: 'preDeclare', target: ts[1].contents, type: typeSig, val};
    return [firstPreStatement, remainder];
}

function splitPreIfStatement(ts: Array<Token|Brackets>):
[PreIfStatement, Array<Token|Brackets>]
{
    if (ts[1].kind !== 'paren' || ts[2].kind !== 'brace' ||
        ts[3].kind !== 'else' || ts[4].kind !== 'brace')
    {
        console.error(ts.slice(1,5));
        throw new Error('parse error in if statement');
    }
    const firstPreStatement: PreIfStatement =
        { kind: 'preIf', condition: {kind: 'preExpr', val: ts[1].kids},
          trueBranch: splitPreStatements(ts[2].kids),
          falseBranch: splitPreStatements(ts[4].kids) 
        }
    return [firstPreStatement, ts.slice(5)];
}

function splitPreWhileLoop(ts: Array<Token|Brackets>):
[PreWhileLoop, Array<Token|Brackets>]
{
    if(ts[1].kind !== 'paren' || ts[2].kind !== 'brace'){
        console.error(ts.slice(1,3));
        throw new Error('parse error in while loop');
    }
    const firstPreStatement: PreWhileLoop =
        { kind: 'preWhile',
          condition: {kind: 'preExpr', val: ts[1].kids},
          body: splitPreStatements(ts[2].kids)
        };
    return [firstPreStatement, ts.slice(3)];
}

function splitPreAssign(ts: Array<Token|Brackets>):
[PreAssign, Array<Token|Brackets>]
{
    if (ts.length < 3)
        throw new Error('parse error in assign statment');
    if (ts[0].kind !== 'id')
        throw new Error('assignment target must be identifier');
    if (ts[1].kind !== 'operator' || ts[1].contents !== '=')
        throw new Error('splitPreAssign called on non-assign statement');
    const target = ts[0].contents;
    const [val, remainder] = splitPreExpr(ts.slice(2));
    const asgn: PreAssign = { kind: 'preAsgn', target, val };
    return [asgn, remainder];
}

function splitPreReturn(ts: Array<Token|Brackets>):
[PreReturn, Array<Token|Brackets>]
{
    if(ts[1].kind === 'semicolon'){
        return [{kind: 'preReturn', val: 'VOID'},
                ts.slice(2)];
    }
    let [val, remainder] = splitPreExpr(ts.slice(1));
    return [{kind: 'preReturn', val}, remainder ];
}

function splitPreExpr(ts: Array<Token|Brackets>):
[PreExpr, Array<Token|Brackets>]
{
    const idx: number =  ts.findIndex(t => t.kind === 'semicolon');
    const val: PreExpr = {kind: 'preExpr', val: ts.slice(0, idx)}
    const remainder = ts.slice(idx+1);
    return [val, remainder];
}

function splitFirstStatement(ts: Array<Token|Brackets>):
[PreStatement, Array<Token|Brackets>]
{
    if(ts.length === 0) throw new Error;
    if(ts[0].kind === 'let') return splitPreDeclare(ts);
    if(ts[0].kind === 'if') return splitPreIfStatement(ts);
    if(ts[0].kind === 'while') return splitPreWhileLoop(ts);
    if(ts[0].kind === 'return') return splitPreReturn(ts);

    if(ts.length === 1) return[{kind: 'preExpr', val: ts}, []];
    // a single token which thus should be an expression
    if(ts[1].kind === 'operator' && ts[1].contents === '=')
        return splitPreAssign(ts);
    return splitPreExpr(ts);
}

export function splitPreStatements(b: Array<Token|Brackets>): PreProgram
{
    let p = [];
    while(b.length > 0){
        let [s, remainder] = splitFirstStatement(b);
        p.push(s);
        b = remainder;
    }
    return p;
}

export function parsePreProgram(ts: Array<Token>): PreProgram
{
    return splitPreStatements(matchBrackets(ts).kids);
}
