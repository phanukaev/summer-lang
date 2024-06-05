import { lex_test1 } from './test/lexer_tests.js';
import { lexStream } from './lexer.js';
import { lexAndParse } from './parser.js';
import { logTree } from './logger.js';


let parseTree = lexAndParse(lex_test1);

console.log(lexStream(lex_test1));
logTree(parseTree);
