###
 * codegen.js
 * 
###
"use strict"
FALSE = type: "bool", value: false
TRUE = type: "bool", value: true


js = (ast) ->
    switch (ast.type) 
        when "num"    then js_atom   (ast)
        when "bool"   then js_atom   (ast)
        when "str"    then js_atom   (ast)
        when "var"    then js_var    (ast)
        when "not"    then js_not    (ast)
        when "binary" then js_binary (ast)
        when "assign" then js_assign (ast)
        when "if"     then js_if     (ast)
        when "prog"   then js_prog   (ast)
        when "call"   then js_call   (ast)
        when 'import' then js_import (ast)
        else throw new Error("Dunno how to make_js for " + JSON.stringify(ast))

make_var = (name) -> name

js_import = (ast) -> "var #{ast.value} = stdlib.#{ast.value}"

js_atom = (ast) -> JSON.stringify(ast.value) 

js_var = (ast) -> make_var(ast.value)

js_not = (ast) -> if is_bool(ast.body) then "!#{js(ast.body)}" else "(#{js(ast.body)} === false)"

js_assign = (ast) -> js_binary(ast)

js_prog = (ast) -> ast.prog.map(js).join("")

js_call = (ast) -> js(ast.func) + "(#{ast.args.map(js).join(", ")})"

js_binary = (ast) ->
    left = js(ast.left)
    right = js(ast.right)
    switch (ast.operator) 
        when "&&"
            break if (is_bool(ast.left))
            return "((#{left} !== false) && #{right})"
        when "||"
            break if (is_bool(ast.left))
            return "((I2_TMP = #{left}) !== false ? I2_TMP : #{right})"
    
    "(#{left}#{ast.operator}#{right})"

is_bool = (ast) ->
    switch (ast.type) 
        when "bool" then return true
        when "not" then return true
        when "if" then return is_bool(ast.then) || (ast.else && is_bool(ast.else))
        when "binary"
            if ",<,<=,==,!=,>=,>,".indexOf(",#{ast.operator},") >= 0
                return true
            if (ast.operator == "&&" || ast.operator == "||")
                return is_bool(ast.left) && is_bool(ast.right)
    false

js_if = (ast) ->
    cond = js(ast.cond)
    if !is_bool(ast.cond) then cond += " !== false"
    "(#{cond} ? #{js(ast.then)} : #{js(ast.else || FALSE)}"



codegen = module.exports = (ast) -> js(ast)
