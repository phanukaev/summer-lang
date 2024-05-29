import { lexStream as lexStream } from "./lexer.js";
import { lex_test1 } from "./test/lexer_tests.js"

let lex = lexStream(lex_test1);

console.log(lex);
