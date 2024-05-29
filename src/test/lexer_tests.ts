export const lex_test1 =
    String.raw`
let x : Int = 3 + 5 * 7;
let y : Int = 2 * x;
let z: Bool = false;
if(x == y) {
    z = !z;
} else {
    x = x >>= 3;
}
let s : String = "this is a \"test string";`
