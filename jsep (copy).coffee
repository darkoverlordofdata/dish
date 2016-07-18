#!/usr/bin/env coffee

jsep = require 'jsep'

                

ast = jsep('(mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK)')
ast = jsep('(1812433253 * (mt[mti-1] ^ (mt[mti-1] >> 30)) + mti)')
ast = jsep('mt[mti] & 4294967295')
ast = jsep('mt[kk+M-N] ^ (y >> 1) ^ mag01[y & 1]')
ast = jsep('(mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK)')

#console.log JSON.stringify(ast, null, 2)

stack = []
inArray = false

traverse = (node) ->
    node.array = inArray
    if node.type is 'BinaryExpression'
        stack.push node.operator
        traverse(node.right)
        traverse(node.left)
    else
        switch node.type
            when 'MemberExpression'
                inArray = true
                traverse(node.property)
                node.object.array = true
                node.object.array_name = node.object.name
                stack.push node.object
                inArray = false
            when 'Identifier' 
                stack.push node
            when 'Literal'
                stack.push node

console.log ast
process.exit 0

traverse(ast)
nodes = stack.reverse()
# console.log nodes
# process.exit 0
curr = ''
prev = ''

getName = () ->
    prev = curr
    curr = "$#{uniqueId}"
    curr = if curr.length == 2 then "$0#{uniqueId}" else curr
    uniqueId++
    curr

class Token
    constructor:(@node) ->
    toString: ->
        switch @node.type
            when 'Identifier'   then @node.name 
            when 'Literal'      then @node.value
            else '' 

p = 0
out = {}
arrays = []
prior = array: false
uniqueId = 1
stack = []
operator = ''
while p<nodes.length

    if 'string' is typeof nodes[p] 
        if 'string' is typeof prior
            node = arrays.pop()
            getName()
            out[curr] = "#{curr} = #{prev} + #{node.name}|0"
            getName()
            out[curr] = "#{curr} = #{prev} << 2"
            getName()
            out[curr] = "#{curr} = HEAP[#{prev}>>2]|0"
            stack.push curr
        
        getName()
        op1 = stack.pop()
        op2 = stack.pop()
        operator = nodes[p]
        out[curr] = "#{curr} = #{op2.toString()} #{operator} #{op1.toString()}"
        switch operator
            when '|', '&', '>>', '<<', '^'
            else out[curr] += '|0'
        stack.push new Token(type: 'Identifier', name: curr)
    else
        switch nodes[p].type
            when 'Identifier'
                if nodes[p].array_name
                    console.log 'push |',nodes[p],'|'
                    arrays.push nodes[p]

                else if nodes[p].array
                    stack.push new Token(nodes[p])
                    
                else
                    if prior.array
                        node = arrays.pop()
                        console.log 'pop |', node, '|'
                        getName()
                        out[curr] = "#{curr} = #{prev} + #{node.name}|0"
                        getName()
                        out[curr] = "#{curr} = #{prev} << 2"
                        getName()
                        out[curr] = "#{curr} = HEAP[#{prev}>>2]|0"
                        stack.push curr
                    stack.push new Token(nodes[p])

            when 'Literal'
                stack.push new Token(nodes[p])


    prior = nodes[p]
    p++

console.log out
