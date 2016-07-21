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
    transpile: transpile,
    reset: reset
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
            case 'CallExpression': 
                let args = []
                let argz = this.node.arguments
                for (let arg in argz) {
                    switch(argz[arg].type) {
                        case 'CallExpression':      console.log('Not Supported'); process.exit(0) 
                        case 'BinaryExpression':    console.log('Not Supported'); process.exit(0) 
                        case 'Literal':             args.push(argz[arg].value); break
                        case 'Identifier':          args.push(argz[arg].name); break
                    }
                }
                return this.node.callee.name+'('+args.join(',')+')'

            default:            return ''
        }
    }
}


var uniqueId = 1

function reset() {
    uniqueId = 1
}

function transpile(tokens) {

    var p = 0
    var out = {}
    var curr = ''
    var prev = ''
    var stack = []
    var nodes = []

    traverse(tokens)
    nodes = nodes.reverse()

    while (p<nodes.length) {
        let node = nodes[p]
        switch (node.type) {
            case 'Literal':
            case 'Identifier':
            case 'CallExpression':
                stack.push(new Token(node))
                break
            case 'Operator':
                createVar()
                let op1 = stack.pop()
                let op2 = stack.pop()
                out[curr] = `${op2.toString()} ${node.op} ${op1.toString()}`
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
                    out[curr] = `${prev} << 2`
                    createVar()
                    out[curr] = `HEAP[${prev}>>2]|0`
                    stack.pop() //# pop off the prev, replace with curr
                    stack.push(new Token({type: 'Identifier', name: curr})) 
                }
        }
        p++
    }
    return out

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
            case 'CallExpression':
                nodes.push(node)
                break
        }
    }

    
}
