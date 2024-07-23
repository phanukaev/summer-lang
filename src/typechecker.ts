import { assert, uniqueBy } from './util.js';
import { TypeSignature, TypeName, typeEqual, FunctionType } from './types.js';
import { Expr } from './expr_parser.js';
import { Statement, Program, Declare } from './parser.js';
import { builtinBinOpTypes } from './builtins.js';
import './logger.js';

export type TypeCheckCtx = {
    table: { [index: string]: TypeSignature }
    parent: TypeCheckCtx | null
}

export function copyTypeCheckCtx(ctx: TypeCheckCtx): TypeCheckCtx {
    return {
        parent: ctx.parent,
        table: (() => {
            let t: TypeCheckCtx['table'] = {};
            for (let c in ctx.table) t[c] = ctx.table[c];
            return t;
        })()
    };
}

export function typeCheckExpr(e: Expr,
                              ctx: TypeCheckCtx,
                              target?: TypeSignature): TypeSignature
{
    if(target === undefined) return typeInferExpr(e, ctx);
    else return typeCheckExprWithTarget(e, ctx, target);
}

function typeInferExpr(e: Expr, ctx: TypeCheckCtx): TypeSignature
{
    // console.log(JSON.stringify(ctx, undefined, 2));
    // console.log('------- ^^ ctx ^^ -------');
    switch(e.kind){
        case 'intLit':
            return TypeName('Int');
        case 'boolLit':
            return TypeName('Bool');
        case 'stringLit':
            return TypeName('String');
        case 'identifier':
            if (e.name in ctx.table) {
                return ctx.table[e.name];
            }
            if (ctx.parent !== null)
                return typeInferExpr(e, ctx.parent);
            throw new Error(unknownIdentifier(e, e.name));
        case 'funcall': 
            const funType = typeInferExpr(e.fun, ctx);
            assert(funType.kind === 'functionType',
                   'trying to call something that is not a function');
            return typeCheckExprWithTarget(e, ctx, funType.target);
        case 'function':
            // this is not supposed to happen.
            throw new Error("Type inference for functions is not implemented.");
    }
}

export function typeCheckExprWithTarget(
    e: Expr, ctx: TypeCheckCtx, target: TypeSignature): TypeSignature
{
    switch(e.kind){
        case 'intLit':
        case 'stringLit':
        case 'boolLit':
        case 'identifier': {
            let inferred = typeInferExpr(e, ctx);
            if(!typeEqual(inferred, target))
                throw new Error(typeTargetMismatch(e, target));
            return target;
        }
        case 'funcall': {
            let inferred = typeInferExpr(e.fun, ctx);
            assert(inferred.kind === 'functionType',
                   'trying to call something that is not a function');
            assert(typeEqual(inferred.target, target),
                   'wrong return type'
                  );
            assert(inferred.source.length === e.args.length)
            for(let i = 0; i < inferred.source.length; i++){
                const argTarget : TypeSignature = inferred.source[i];
                const arg : Expr = e.args[i];
                typeCheckExprWithTarget(arg, ctx, argTarget);
            }
            return target;
        }
        case 'function':
            if(target.kind !== 'functionType')
                throw new Error(typeTargetMismatch(e, target));
            assert(target.kind === 'functionType');
            if(target.source.length !== e.args.length){
                throw new Error(`wrong number of arguments in ${e}`);
            }
            // for(let i = 0; i < target.source.length; i++){
            //     const argTarget : TypeSignature = target.source[i];
            //     const arg : Expr = e.args[i];
            //     typeCheckExprWithTarget(arg, ctx, argTarget);
            // }
            let newCtx = copyTypeCheckCtx(ctx);
            for(let i = 0; i < target.source.length; i++){
                newCtx.table[e.args[i].name] = target.source[i];
            }
            typeCheckFunctionBody(e.body, newCtx, target.target);
            return target;
    }
}

function typeCheckFunctionBody(body: Program, ctx: TypeCheckCtx,
                               target: TypeSignature): void
{
    const retType = typeCheckProgram(body, ctx)[0];
    if(!typeEqual(retType, target)){
        throw new Error(returnTypeMismatch(body, target, retType));
        
    }
}

export function typeCheckProgram(p: Program, ctx: TypeCheckCtx): TypeSignature[]
{
    let retTypes = [];
    for (let s of p){
        console.log('type checking statement:');
        console.log(s);
        console.log(ctx);
        retTypes.push(...typeCheckStatement(s, ctx));
    }
    // let retTypes = p.flatMap(s => {
    //     console.log('type checking statement:');
    //     console.log(s);
    //     console.log(ctx);
    //     return typeCheckStatement(s, ctx);
    // });
    retTypes = uniqueBy(retTypes, (x, y) => typeEqual(x,y));
    if(retTypes.length > 1)
        throw new Error(multipleReturnTypes(p, retTypes));
    return retTypes;
}

export function typeCheckStatement(s: Statement, ctx: TypeCheckCtx): TypeSignature[]
{
    switch(s.kind){
        case 'declare':
            if (s.target in ctx.table){
                throw new Error(variableAlreadyDeclared(s));
            }
            const typeChecked: TypeSignature =
                typeCheckExprWithTarget(s.val, ctx, s.typeSignature);
            ctx.table[s.target] = typeChecked;
            return [];
        case 'assign':
            if (!(s.target in ctx.table))
                throw new Error(unknownIdentifier(s, s.target));
            const targetType = ctx.table[s.target];
            typeCheckExprWithTarget(s.val, ctx, targetType);
            return [];
        case 'ifStatement':
            typeCheckExprWithTarget(s.condition, ctx, TypeName('Bool'));
            const trueType = typeCheckProgram(s.trueBranch, ctx);
            const falseType = typeCheckProgram(s.falseBranch, ctx);
            return trueType.concat(falseType);
        case 'whileLoop':
            typeCheckExprWithTarget(s.condition, ctx, TypeName('Bool'));
            return typeCheckProgram(s.body, ctx);
        case 'return':
            if(s.val === 'VOID')
                return [TypeName('Void')];
            return [typeInferExpr(s.val, ctx)];
        default:
            typeInferExpr(s, ctx);
            return [];
    }
}

/* TYPE CHECKING ERROR FUNCTIONS
 * The reasond these return strings instead of throwing errors outright,
 * is because the typchecker cannot figure out that that when errors get
 * thrown inside a function call it interrupts program execution.
 * Thus errors need to be thrown where they are intended to interrupt flow.
 */

function typeTargetMismatch(e: Expr, target: TypeSignature): string
{
    const exprStr = JSON.stringify(e, undefined, 2);
    const targetStr = JSON.stringify(target, undefined, 2);
    const errMsg =
        `Expression\n${exprStr}\ndoes not match expected type\n${targetStr}`;
    return errMsg;
}

function variableAlreadyDeclared(s: Declare){
    const sStr = JSON.stringify(s, undefined, 2)
    return `
identifer ${s.target} already declared in variable declaration
${sStr}
`
}

function unknownIdentifier(e: Expr|Statement, id: string): string{
    const eStr = JSON.stringify(e, undefined, 2);
    const errMsg = `
unknow identifier ${id} in the expression
${eStr}
`
    return errMsg;
}

function multipleReturnTypes(p: Program, rt: TypeSignature[]): string{
    const pStr = JSON.stringify(p, undefined, 2);
    const rtStr = JSON.stringify(rt, undefined, 2);
    const errMsg = `
Multiple return types
${rtStr}
in program
${pStr}
`;
    return errMsg;
}

function returnTypeMismatch(p: Program, target: TypeSignature,
                            detected: TypeSignature): string{
    const pStr = JSON.stringify(p, undefined, 2);
    const tStr = JSON.stringify(target, undefined, 2);
    const dStr = JSON.stringify(detected, undefined, 2);
    const errMsg = `
Function has declared return type ${tStr},
but returns ${dStr}.
---- Function ---- 
${pStr}
`
    return errMsg;
}

export function emptyTypeCheckCtx() : TypeCheckCtx {
    return { parent: null, table: {} };
}

export function builtinTypeCheckCtx(): TypeCheckCtx{
    let out = emptyTypeCheckCtx();
    builtinBinOpTypes.forEach(([name, l, r, t]) => {
        let ft : FunctionType = { kind: 'functionType',
                                  source: [l, r],
                                  target: t }
        out.table['operator'+name] = ft;
    })
    return out;
}
