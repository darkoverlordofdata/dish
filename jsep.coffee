#!/usr/bin/env coffee

jsep = require 'jsep'

nodes = []
inArray = false
traverse = (node) ->
    node.array = inArray
    if node.type is 'BinaryExpression'
        nodes.push type: 'Operator', op:node.operator, array: inArray
        traverse(node.right)
        traverse(node.left)
    else
        switch node.type
            when 'MemberExpression'
                inArray = true
                node.object.array = true
                node.object.array_name = node.object.name
                # add the array base address to the indexing
                nodes.push type: 'Operator', op:'+', array: inArray
                nodes.push node.object
                traverse(node.property)
                inArray = false
            when 'Identifier' 
                nodes.push node
            when 'Literal'
                nodes.push node

# ast = jsep('(mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK)')
# ast = jsep('(1812433253 * (mt[mti-1] ^ (mt[mti-1] >> 30)) + mti)')
# ast = jsep('mt[mti] & 4294967295')
# ast = jsep('mt[kk+M-N] ^ (y >> 1) ^ mag01[y & 1]')
ast = jsep('(mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK)')
ast = jsep('mt[kk+M-N] ^ (y >> 1) ^ mag01[y & 1]')

#console.log ast
traverse(ast)

nodes = nodes.reverse()
#console.log nodes
#process.exit 0

###
===================================================================
###
class Token
    constructor:(@node) ->
    toString: ->
        switch @node.type
            when 'Identifier'   then @node.name 
            when 'Literal'      then @node.value
            when 'Operator'     then @node.op
            else ''


curr = ''
prev = ''

getName = () ->
    prev = curr
    curr = "$#{uniqueId}"
    curr = if curr.length == 2 then "$0#{uniqueId}" else curr
    uniqueId++
    curr


outputArray = () ->
    getName()
    out[curr] = "#{curr} = #{prev} << 2"
    getName()
    out[curr] = "#{curr} = HEAP[#{prev}>>2]|0"
    stack.push curr

p = 0
out = {}
prior = array: false
uniqueId = 1
stack = []
operator = ''
while p<nodes.length
    node = nodes[p]
    if prior.array is true and node.array is false then outputArray()
    switch node.type
        when 'Literal'
            stack.push new Token(node)

        when 'Identifier'
            stack.push new Token(node)
                
        when 'Operator'
            getName()
            op1 = stack.pop()
            if prior.array then if prior.type is 'Operator' then stack.pop()
            op2 = stack.pop()
            operator = node.op
            out[curr] = "#{curr} = #{op2.toString()} #{operator} #{op1.toString()}"
            switch operator
                when '|', '&', '>>', '<<', '^'
                else out[curr] += '|0'
            stack.push new Token(type: 'Identifier', name: curr) 


    prior = node
    p++

console.log stack
console.log '================='
console.log out
