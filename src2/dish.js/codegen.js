/**
 * codegen.js
 * 
 */
"use strict";
var FALSE = { type: "bool", value: false };
var TRUE = { type: "bool", value: true };

module.exports =
function codegen(exp) {
    return js(exp);

    function js(exp) {
        switch (exp.type) {
          case "num"    :
          case "str"    :
          case "bool"   : return js_atom   (exp);
          case "var"    : return js_var    (exp);
          case "not"    : return js_not    (exp);
          case "binary" : return js_binary (exp);
          case "assign" : return js_assign (exp);
          case "if"     : return js_if     (exp);
          case "prog"   : return js_prog   (exp);
          case "call"   : return js_call   (exp);
          case 'import' : return js_import (exp);
          default:
            throw new Error("Dunno how to make_js for " + JSON.stringify(exp));
        }
    }
    function js_import(exp) {
        return "var " + exp.value + " = stdlib." + exp.value;
    }

    function js_atom(exp) {
        return JSON.stringify(exp.value); // cheating ;-)
    }
    function make_var(name) {
        return name;
    }
    function js_var(exp) {
        return make_var(exp.value);
    }
    function js_not(exp) {
        if (is_bool(exp.body))
            return "!" + js(exp.body);
        return "(" + js(exp.body) + " === false)";
    }
    function js_binary(exp) {
        var left = js(exp.left);
        var right = js(exp.right);
        switch (exp.operator) {
          case "&&":
            if (is_bool(exp.left)) break;
            return "((" + left + " !== false) && " + right + ")";
          case "||":
            if (is_bool(exp.left)) break;
            return "((I2_TMP = " + left + ") !== false ? I2_TMP : " + right + ")";
        }
        return "(" + left + exp.operator + right + ")";
    }
    function js_assign(exp) {
        return js_binary(exp);
    }

    function is_bool(exp) {
        switch (exp.type) {
          case "bool":
          case "not":
            return true;
          case "if":
            return is_bool(exp.then) || (exp.else && is_bool(exp.else));
          case "binary":
            if (",<,<=,==,!=,>=,>,".indexOf("," + exp.operator + ",") >= 0)
                return true;
            if (exp.operator == "&&" || exp.operator == "||")
                return is_bool(exp.left) && is_bool(exp.right);
            break;
        }
        return false;
    }
    function js_if(exp) {
        var cond = js(exp.cond);
        if (!is_bool(exp.cond))
            cond += " !== false";
        return "("
            +      cond
            +      " ? " + js(exp.then)
            +      " : " + js(exp.else || FALSE)
            +  ")";
    }
    function js_prog(exp) {
        return exp.prog.map(js).join(";");
    }

    function js_call(exp) {
        return js(exp.func) + "(" + exp.args.map(js).join(", ") + ")";
    }
}
