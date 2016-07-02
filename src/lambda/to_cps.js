"use strict";

var has_side_effects = require('./has_side_effects')

var FALSE = { type: "bool", value: false };
var TRUE = { type: "bool", value: true };
var GENSYM = 0;

function gensym(name) {
    if (!name) name = "";
    name = "I2_" + name;
    return name + (++GENSYM);
}

module.exports = 
function to_cps(exp, k) {
    return cps(exp, k);

    function cps(exp, k) {
        switch (exp.type) {
          case "raw"    :
          case "num"    :
          case "str"    :
          case "bool"   : return cps_atom   (exp, k);

          case "assign" :
          case "binary" : return cps_binary (exp, k);

          case "not"    : return cps_not    (exp, k);
          case "var"    : return cps_var    (exp, k);
          case "let"    : return cps_let    (exp, k);
          case "lambda" : return cps_lambda (exp, k);
          case "if"     : return cps_if     (exp, k);
          case "prog"   : return cps_prog   (exp, k);
          case "call"   : return cps_call   (exp, k);
          default:
            throw new Error("Dunno how to CPS " + JSON.stringify(exp));
        }
    }
    function cps_atom(exp, k) {
        return k(exp);
    }
    function cps_not(exp, k) {
        return cps(exp.body, function(body){
            return k({ type: "not", body: body });
        });
    }
    function cps_var(exp, k) {
        return k(exp);
    }
    function cps_binary(exp, k) {
        return cps(exp.left, function(left){
            return cps(exp.right, function(right){
                return k({ type     : exp.type,
                           operator : exp.operator,
                           left     : left,
                           right    : right });
            });
        });
    }
    function cps_let(exp, k) {
        if (exp.vars.length == 0)
            return cps(exp.body, k);
        return cps({
            type: "call",
            args: [ exp.vars[0].def || FALSE ],
            func: {
                type: "lambda",
                vars: [ exp.vars[0].name ],
                body: {
                    type: "let",
                    vars: exp.vars.slice(1),
                    body: exp.body
                }
            }
        }, k);
    }
    function cps_lambda(exp, k) {
        var cont = gensym("K");
        var body = cps(exp.body, function(body){
            return { type: "call",
                     func: { type: "var", value: cont },
                     args: [ body ] };
        });
        return k({ type: "lambda",
                   name: exp.name,
                   vars: [ cont ].concat(exp.vars),
                   body: body });
    }
    function cps_if(exp, k) {
        return cps(exp.cond, function(cond){
            var cvar = gensym("I");
            var cast = make_continuation(k);
            k = function(ifresult) {
                return {
                    type: "call",
                    func: { type: "var", value: cvar },
                    args: [ ifresult ]
                };
            };
            return {
                type: "call",
                func: {
                    type: "lambda",
                    vars: [ cvar ],
                    body: {
                        type: "if",
                        cond: cond,
                        then: cps(exp.then, k),
                        else: cps(exp.else || FALSE, k)
                    }
                },
                args: [ cast ]
            };
        });
    }
    function cps_call(exp, k) {
        return cps(exp.func, function(func){
            return (function loop(args, i){
                if (i == exp.args.length) return {
                    type : "call",
                    func : func,
                    args : args
                };
                return cps(exp.args[i], function(value){
                    args[i + 1] = value;
                    return loop(args, i + 1);
                });
            })([ make_continuation(k) ], 0);
        });
    }
    function make_continuation(k) {
        var cont = gensym("R");
        return { type : "lambda",
                 vars : [ cont ],
                 body : k({ type  : "var",
                            value : cont }) };
    }
    function cps_prog(exp, k) {
        return (function loop(body){
            if (body.length == 0) return k(FALSE);
            if (body.length == 1) return cps(body[0], k);
            if (!has_side_effects(body[0]))
                return loop(body.slice(1));
            return cps(body[0], function(first){
                if (has_side_effects(first)) return {
                    type: "prog",
                    prog: [ first, loop(body.slice(1)) ]
                };
                return loop(body.slice(1));
            });
        })(exp.prog);
    }
}
