
console.log('succesfully copiled and running');

function fib(n : number): number {
    let [a, b] = [0, 1]
    for (let i = 0; i < n; i++){
        [a, b] = [b, a + b];
    }
    return a;
}

console.log('the 20th fibonacci number is ' + fib(20));
