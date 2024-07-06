import { Expr, parseExpr } from './expr_parser.js';
import { PreProgram, PreIfStatement, PreAssign, PreDeclare, PreStatement,
         PreWhileLoop, parsePreProgram
       } from './pre_program_parser.js';
import { Token, lexStream } from './lexer.js';

export type Declare = {
    kind: 'declare';
    target: string;
    type: string;
    val: Expr;
}
export type Assign = {
    kind: 'assign';
    target: string;
    val: Expr;
}
export type IfStatement = {
    kind: 'ifStatement';
    condition: Expr;
    trueBranch: Program;
    falseBranch: Program;
}
export type WhileLoop = {
    kind: 'whileLoop';
    condition: Expr;
    body: Program;
}

export type Statement = Declare | Assign | IfStatement | Expr | WhileLoop;
export type Program = Array<Statement>;

function parseIfStatement(s: PreIfStatement): IfStatement{
    const condition = parseExpr(s.condition);
    const trueBranch = parseProgram(s.trueBranch);
    const falseBranch = parseProgram(s.falseBranch);
    return { kind: 'ifStatement', condition, trueBranch, falseBranch };
}

function parseWhile(s: PreWhileLoop): WhileLoop {
    const condition = parseExpr(s.condition);
    const body = parseProgram(s.body);
    return { kind: 'whileLoop', condition, body };
}

function parseAssign(a: PreAssign): Assign{
    const target = a.target;
    const val = parseExpr(a.val);
    return { kind: 'assign', target, val };
}

function parseDeclare(d: PreDeclare): Declare{
    const target = d.target;
    const val = parseExpr(d.val);
    const type = d.type;
    return { kind: 'declare', target, val, type };
}

function parseStatement(s: PreStatement){
    switch (s.kind){
        case 'preIf': return parseIfStatement(s);
        case 'preAsgn': return parseAssign(s);
        case 'preDeclare': return parseDeclare(s);
        case 'preExpr': return parseExpr(s);
        case 'preWhile': return parseWhile(s);
    }
}
function parseProgram(prog: PreProgram): Program{
    return prog.map(s => parseStatement(s));
}

export function parse(ts: Array<Token>): Program{
    return parseProgram(parsePreProgram(ts));
}

export function lexAndParse(s: string): Program{
    return parse(lexStream(s));
}
