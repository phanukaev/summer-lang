import { lex_test1 } from './test/lexer_tests.js';
import { lexStream } from './lexer.js';
import { lexAndParse, Program } from './parser.js';
import { logObject } from './logger.js';
import { typeCheckProgram, builtinTypeCheckCtx } from './typechecker.js';


let parseTree: Program = lexAndParse(lex_test1);
// logObject(parseTree);

typeCheckProgram(parseTree, builtinTypeCheckCtx());
