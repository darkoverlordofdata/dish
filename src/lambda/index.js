"use strict";

var parse = require('./parse');
var InputStream = require('./InputStream');
var TokenStream = require('./TokenStream');
var make_js = require('./make_js');
var make_scope = require('./make_scope');
var optimize = require('./optimize');
var to_cps = require('./to_cps')
var u2 = require("uglify-js");
var util = require("util");

function readStdin(callback) {
    var text = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("readable", function(){
        var chunk = process.stdin.read();
        if (chunk) text += chunk;
    });
    process.stdin.on("end", function(){
        callback(text);
    });
}
readStdin(function(code){
    var ast = parse(TokenStream(InputStream(code)));
    var cps = to_cps(ast, function(x){
        return {
            type: "call",
            func: { type: "var", value: "I2_TOPLEVEL" },
            args: [ x ]
        };
    });

    //console.log(util.inspect(cps, { depth: null }));

    var opt = optimize(cps);
    //var opt = cps; make_scope(opt);
    var jsc = make_js(opt);

    jsc = "var I2_TMP;\n\n" + jsc;

    if (opt.env) {
        var vars = Object.keys(opt.env.vars);
        if (vars.length > 0) {
            jsc = "var " + vars.map(function(name){
                return make_js({
                    type: "var",
                    value: name
                });
            }).join(", ") + ";\n\n" + jsc;
        }
    }

    jsc = '"use strict";\n\n' + jsc;

    try {
        console.log(u2.parse(jsc).print_to_string({
            beautify: true,
            indent_level: 2
        }));
    } catch(ex) {
        console.log(ex);
        throw(ex);
    }


});
