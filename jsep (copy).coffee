#!/usr/bin/env coffee

jsep = require 'jsep'
# ast = jsep('(1812433253 * (mt[mti-1] ^ (mt[mti-1] >> 30)) + mti)')
# ast = jsep('mt[mti] & 4294967295')
# ast = jsep('(mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK)')
# ast = jsep('mt[kk+M-N] ^ (y >> 1) ^ mag01[y & 1]')

class Token
    constructor:(@node) ->
    toString: ->
        switch @node.type
            when 'Identifier'   then @node.name 
            when 'Literal'      then @node.value
            when 'Operator'     then @node.op
            else ''


nodes = []
traverse = (node) ->
    switch node.type
        when 'BinaryExpression'
            nodes.push type: 'Operator', op:node.operator
            traverse(node.left)
            traverse(node.right)
        when 'MemberExpression'
            nodes.push type: 'Operator', op:'+', array:true
            traverse(node.object)
            traverse(node.property)
        when 'Identifier' 
            nodes.push node
        when 'Literal'
            nodes.push node

curr = ''
prev = ''

createVar = () ->
    prev = curr
    curr = "$#{uniqueId}"
    curr = if curr.length is 2 then "$0#{uniqueId}" else curr
    uniqueId++
    curr


traverse(jsep('mt[kk+M-N] ^ (y >> 1) ^ mag01[y & 1]'))
nodes = nodes.reverse()

p = 0
out = {}
uniqueId = 1
stack = []
while p<nodes.length
    node = nodes[p]
    switch node.type
        when 'Literal', 'Identifier'
            stack.push new Token(node)
        when 'Operator'
            createVar()
            op1 = stack.pop()
            op2 = stack.pop()
            out[curr] = "#{curr} = #{op2.toString()} #{node.op} #{op1.toString()}"
            switch node.op
                when '|', '&', '>>', '<<', '^'
                else out[curr] += '|0'
            stack.push new Token(type: 'Identifier', name: curr) 
            if node.array
                createVar()
                out[curr] = "#{curr} = #{prev} << 2"
                createVar()
                out[curr] = "#{curr} = HEAP[#{prev}>>2]|0"
                stack.pop() # pop off the prev, replace with curr
                stack.push new Token(type: 'Identifier', name: curr) 
            
    p++

console.log '================='
console.log out
