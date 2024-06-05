/* simple function to print an entrire parse tree to console
 * x: any is probably a worst practice, but whatever
 */
export function logTree (x: any): void
{
    if (typeof x !== 'object'){
        console.log(x);
        return;
    }
    console.group(x.kind);
    for(let t in x){
        if (t !== 'kind'){ 
            console.group(t);
            logTree(x[t]);
            console.groupEnd();
        }
    }
    console.groupEnd();
}
