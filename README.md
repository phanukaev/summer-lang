# summer-lang
Material for a summer course in which I write a compiler from  scratch.

## Building

If you have `npm` make sure you have typescript installed
```
# npm install -g typescript
```
then compile with `make compile` or compile-and-run code with `make run`.

If you prefer to not modify you local system, you can use docker instead.
Running `make docker` will download a docker image with the required dependencies
and place you inside the conatiner, where you can use `make` as above.

## More
I am documenting my process in more detail in the 
[Wiki](https://github.com/phanukaev/summer-lang/wiki).
