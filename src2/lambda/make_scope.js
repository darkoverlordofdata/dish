"use strict";

var Environment = require('./Environment');

module.exports = 
function make_scope(exp) {
    var global = new Environment();
    exp.env = global;
    (function scope(exp, env) {
        switch (exp.type) {
          case "num":
          case "str":
          case "bool":
          case "raw":
            break;

          case "var":
            var s = env.lookup(exp.value);
            if (!s) {
                exp.env = global;
                global.def(exp.value, { refs: [], assigned: 0 });
            } else {
                exp.env = s;
            }
            var def = exp.env.get(exp.value);
            def.refs.push(exp);
            exp.def = def;
            break;

          case "not":
            scope(exp.body, env);
            break;

          case "assign":
            scope(exp.left, env);
            scope(exp.right, env);
            if (exp.left.type == "var")
                exp.left.def.assigned++;
            break;

          case "binary":
            scope(exp.left, env);
            scope(exp.right, env);
            break;

          case "if":
            scope(exp.cond, env);
            scope(exp.then, env);
            if (exp.else)
                scope(exp.else, env);
            break;

          case "prog":
            exp.prog.forEach(function(exp){
                scope(exp, env);
            });
            break;

          case "call":
            scope(exp.func, env);
            exp.args.forEach(function(exp){
                scope(exp, env);
            });
            break;

          case "lambda":
            exp.env = env = env.extend();
            if (exp.name)
                env.def(exp.name, { refs: [], func: true, assigned: 0 });
            exp.vars.forEach(function(name, i){
                env.def(name, { refs: [], farg: true, assigned: 0, cont: i == 0 });
            });
            if (!exp.locs) exp.locs = [];
            exp.locs.forEach(function(name){
                env.def(name, { refs: [], floc: true, assigned: 0 });
            });
            scope(exp.body, env);
            break;

          default:
            throw new Error("Can't handle node " + JSON.stringify(exp));
        }
    })(exp, global);
    return exp.env;
}
