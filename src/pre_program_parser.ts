import {Token} from './lexer.js';
type Brackets = {
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

export type PreExpr = {kind: 'preExpr'; val: Array<Token|Brackets>;}
export type PreDeclare = {kind: 'preDeclare'; type: string; target: string; val: PreExpr;}
export type PreAssign = {kind: 'preAsgn'; target: string; val: PreExpr;}
export type PreIfStatement = {kind: 'preIf'; condition: PreExpr;
                              trueBranch: PreProgram; falseBranch: PreProgram;}
export type PreStatement = PreDeclare | PreAssign | PreIfStatement | PreExpr;
export type PreProgram = Array<PreStatement>; 

function splitPreDeclare(ts: Array<Token|Brackets>):
[PreDeclare, Array<Token|Brackets>]
{
    if (ts[0].kind !== 'let' ||
        ts[1].kind !== 'id' || ts[2].kind !== 'typeColon' ||
        ts[3].kind !== 'type' ||
        !(ts[4].kind === 'operator' && ts[4].contents === '='))
    {
        /* after let we expect an identifier, then colon, then type,
         * then assignment operator */
        console.error(ts.slice(0,5));
        throw new Error('parse error in variable declaration');
    }
    const [val, remainder] = splitPreExpr(ts.slice(5));
    const firstPreStatement: PreDeclare =
        {kind: 'preDeclare', target: ts[1].contents,
         type: ts[3].contents, val};
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

    if(ts.length === 1) return[{kind: 'preExpr', val: ts}, []];
    // a single token which thus should be an expression
    if(ts[1].kind === 'operator' && ts[1].contents === '=')
        return splitPreAssign(ts);
    return splitPreExpr(ts);
}

function splitPreStatements(b: Array<Token|Brackets>): PreProgram
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
