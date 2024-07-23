import { assert } from './util.js';
import { Expr, parseExpr } from './expr_parser.js';
import { PreProgram, PreIfStatement, PreAssign, PreDeclare, PreStatement,
         PreWhileLoop, PreReturn, parsePreProgram
       } from './pre_program_parser.js';
import { Token, lexStream } from './lexer.js';
import { TypeSignature, parseTypeSig } from './types.js';

export type Declare = {
    kind: 'declare';
    target: string;
    typeSignature: TypeSignature;
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

export type Return = {
    kind: 'return';
    val: Expr | 'VOID';
}

export type Statement = Declare | Assign | IfStatement | Expr | WhileLoop | Return;
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
    const typeSignature = parseTypeSig(d.type);
    return { kind: 'declare', target, val, typeSignature };
}

function parseReturn(d: PreReturn): Return {
    return { kind: 'return',
             val: d.val === 'VOID' ? 'VOID' : parseExpr(d.val) };
}

function parseStatement(s: PreStatement){
    switch (s.kind){
        case 'preIf': return parseIfStatement(s);
        case 'preAsgn': return parseAssign(s);
        case 'preDeclare': return parseDeclare(s);
        case 'preExpr': return parseExpr(s);
        case 'preWhile': return parseWhile(s);
        case 'preReturn': return parseReturn(s);
    }
}
export function parseProgram(prog: PreProgram): Program{
    return prog.map(s => parseStatement(s));
}

export function parse(ts: Array<Token>): Program{
    return parseProgram(parsePreProgram(ts));
}

export function lexAndParse(s: string): Program{
    return parse(lexStream(s));
}
