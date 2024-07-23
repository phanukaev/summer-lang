export const lex_test1 = String.raw`
let fib: (Int) -> Int = (n) => {
    if(n <= 0){
        return 0;
    } else {
        let lo : Int = 0;
        let hi : Int = 1;
        let i : Int = 0;
        while( i < n ) {
            hi = hi + lo;
            lo = hi - lo;
            i = i + 1;
        }
        return hi;
    }
};
fib(3);`
