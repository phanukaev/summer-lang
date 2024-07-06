export const lex_test1 =
    String.raw`
let x : Int = 3 + 5 * 7;
let y : Int = 2 * x + x;
let z: Bool = ! false;
if(x == y) {
    x = - 5 - ( - 10 );
    z = z || !z;
} else {
    z = !z;
}
let s : Str = "this is a \"test string";`
