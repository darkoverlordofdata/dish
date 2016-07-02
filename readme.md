
# d?ish

### dish transpiler for jsasm

JsAsm has 'int-ish' variable typing. 
Why not 'd-ish' language support?

Dish transpiles such code to jsasm.
Dish uses the *.d extension to leverage ide syntax hghlighting. 
Dish is not intended to transpile arbitrary d to js.

Dish is a hack.

Dish is written in coffee-script, and is based on the recursive descent parser at http://lisperator.net/pltut/

Status - just starting. Generates module header, nothing else.	
### example

```d
import std.Math.exp;
import std.Math.log;
import foreign.now;
//
//
//  comment
//
double logSum(int start, int end) {
	...
}


export double geometricMean(int start, int end) {

    double t1 = 0.0;
    double t2 = 0.0;

    t1 = now();
    exp(logSum(start, end));
    t2 = now();
    return t2 - t1;


}

```

### steps 

	emit module header
	generate var assignment from stdlib or usrlib for imports
	generate heap arrays
	emit global scope variable defs
	process each function
		emit parameter type anotations
		emit variable type anotations
		emit each line with type anotations
		emit return with type anotations
	emit export object
	emit module end


