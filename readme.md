
# d?ish

### dish transpiler for jsasm

JsAsm has 'int-ish' variable typing. 
Why not 'd-ish' language support?

Dish transpiles such code to jsasm.
Dish uses the *.d extension to leverage ide syntax hghlighting. 
Dish is not intended to transpile arbitrary d to js.

Dish is a hack.

Status - just starting. Generates module header, nothing else.

After days of trying to write my own parser, I used Jison. Later the same day, I have a working poc. 
Using escodegen to create output.

The goal of dish is to insulate me from the twiddly syntax of jsasm. 

* use the type information to add type coercions to generated code.
* generate import/export bindings.
* generate the module header
* add sugar for heap managemenr and pointer types
* no SSA or TCA or other low level optimization - that is done by OdinMonkey/TurboFan


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


