/**
 * expression.js
 * 
 * - Blit Twiddlefast
 * 
 * parse an expression from given ast fragment
 * return expanded to multiline, TAC style
 */
'use strict'

module.exports = {
    compile: compile
}
class Token {
    constructor(node) {
        this.node = node
    }
    toString() {
        switch (this.node.type) {
            case 'Identifier':  return this.node.name
            case 'Literal':     return this.node.value
            case 'Operator':    return this.node.op
            default:            return ''
        }
    }
}



function compile(tokens) {

    var p = 0
    var out = {}
    var curr = ''
    var prev = ''
    var stack = []
    var nodes = []
    var uniqueId = 1

    traverse(tokens)
    nodes = nodes.reverse()

    while (p<nodes.length) {
        let node = nodes[p]
        switch (node.type) {
            case 'Literal':
            case 'Identifier':
                stack.push(new Token(node))
                break
            case 'Operator':
                createVar()
                let op1 = stack.pop()
                let op2 = stack.pop()
                out[curr] = `${curr} = ${op2.toString()} ${node.op} ${op1.toString()}`
                switch (node.op) {
                    case '|':
                    case '&':
                    case '>>':
                    case '<<':
                    case '^':
                        break
                    default: out[curr] += '|0'

                }
                stack.push(new Token({type: 'Identifier', name: curr})) 
                if (node.array) {
                    createVar()
                    out[curr] = `${curr} = ${prev} << 2`
                    createVar()
                    out[curr] = `${curr} = HEAP[${prev}>>2]|0`
                    stack.pop() //# pop off the prev, replace with curr
                    stack.push(new Token({type: 'Identifier', name: curr})) 
                }
        }
        p++
    }
    let str = ''
    for (var line in out) {
        str += out[line]+'\n'
    }
    
    return str

    function createVar() {
        prev = curr
        curr = `$${uniqueId}`
        curr = curr.length === 2 ? `$0${uniqueId}` : curr
        uniqueId++
        curr
    }
    function traverse(node) {
        switch (node.type) {
            case 'BinaryExpression':
                nodes.push({type: 'Operator', op:node.operator})
                traverse(node.left)
                traverse(node.right)
                break
            case 'MemberExpression':
                nodes.push({type: 'Operator', op:'+', array:true})
                traverse(node.object)
                traverse(node.property)
                break
            case 'Identifier':
            case 'Literal':
                nodes.push(node)
                break
        }
    }

    
}
