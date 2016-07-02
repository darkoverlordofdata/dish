###*
# codegen.js
# 
###

'use strict'

module.exports = (ast) ->

  FALSE = type: 'bool', value: false
  TRUE = type: 'bool', value: true

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
        else throw new Error("CodeGen: unknown ast type: " + JSON.stringify(ast))


  js_import = (ast) -> "var #{ast.value} = stdlib.#{ast.value}"

  js_atom = (ast) -> JSON.stringify ast.value

  make_var = (name) -> name

  js_var = (ast) -> make_var ast.value

  js_not = (ast) -> if is_bool(ast.body) then "!#{js(ast.body)}" else "(#{js(ast.body)} === false)"

  js_assign = (ast) -> js_binary ast

  js_prog = (ast) -> ast.prog.map(js).join ';'

  js_call = (ast) -> "#{js(ast.func)}(#{ast.args.map(js).join(', ')})"

  js_binary = (ast) ->
    left = js(ast.left)
    right = js(ast.right)
    switch ast.operator
      when '&&'
        if is_bool(ast.left)
          break
        return "((#{left} !== false) && #{right})"
      when "||"
        if is_bool(ast.left)
          break
        return "((I2_TMP = #{left}) !== false ? I2_TMP : #{right})"
    "(#{left}#{ast.operator}#{right})"

  is_bool = (ast) ->
    switch ast.type
      when 'bool', 'not'
        return true
      when 'if'
        return is_bool(ast.then) or ast.else and is_bool(ast.else)
      when 'binary'
        if ',<,<=,==,!=,>=,>,'.indexOf(',' + ast.operator + ',') >= 0
          return true
        if ast.operator == '&&' or ast.operator == '||'
          return is_bool(ast.left) and is_bool(ast.right)
    false

  js_if = (ast) ->
    cond = js(ast.cond)
    cond += " !== false" if !is_bool(ast.cond)
    "(#{cond} ? #{js(ast.then)} : #{js(ast.else or FALSE)})"

  js ast
