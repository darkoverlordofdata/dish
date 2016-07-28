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
class Node {
    constructor(node) {
        this.node = node
    }
    toString() {
        switch (this.node.type) {
            case 'Identifier':  return this.node.name
            case 'Literal':     return this.node.value
            case 'Operator':    return this.node.op
            case 'CallExpression': 
                const args = []
                const argz = this.node.arguments
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

class Codegen {
    constructor(name, type, left, op, right) {
        this.name = name
        this.type = type
        this.left = left
        this.op = op
        this.right = right
        if (this.op) {
            this.code = this.cast(`${this.left} ${this.op} ${this.right}`)
        } else {
            this.code = `${this.cast(this.left)}`
        }
    }

    cast(value) {
        switch (this.type) {
            case 'int':     return '(('+value+')|0)'
            case 'double':  return '+('+value+')'
            case 'float':   return 'fround('+value+')'
            default:        return value
        }
    }
}
var uniqueId = 1

function reset() {
    uniqueId = 1
}

/**
 * transpile an expression
 * 
 * @param tokens input ast
 * @param symbol lhs symbol being assigned to
 * @param index optional ast of index for lhs
 * @returns array of output lines
 */
function transpile(tokens, symbol, index) {

    let ptr = 0
    let curr = ''
    let prev = ''
    let stack = []
    let nodes = []
    const code = []

    let name = symbol.name
    const heap = symbol.heap
    const size = symbol.size
    const type = symbol.type
    if (index != null) {
        switch (index.type) {
            case 'Literal':
                createVar()
                code.push(new Codegen(curr, type, name, '+', index.value))
                createVar()
                code.push(new Codegen(curr, type, prev, '<<', size))
                break
            case 'Identifier':
                createVar()
                code.push(new Codegen(curr, type, name, '+', index.name))
                createVar()
                code.push(new Codegen(curr, type, prev, '<<', size))
                break
            case 'BinaryExpression':
                traverse(index)
                nodes = nodes.reverse()
                resolve()
                createVar()
                code.push(new Codegen(curr, type, name, '+', prev))
                createVar()
                code.push(new Codegen(curr, type, prev, '<<', size))
                break

        }
        name = `${heap}[${curr}>>${size}]`
    }

    ptr = 0
    nodes = []
    stack = []
    traverse(tokens)
    nodes = nodes.reverse()
    resolve()
    if (index == null) {
        code[code.length-1].name = name
    } else {
        code.push(new Codegen(name, type, curr))
    }

    return code

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
            case 'CallExpression':
                // console.log('CallExpression', node)
                nodes.push(node)
                break
        }
    }

    function resolve() {
        while (ptr<nodes.length) {
            const node = nodes[ptr]
            switch (node.type) {
                case 'Literal':
                case 'Identifier':
                case 'CallExpression':
                    stack.push(new Node(node))
                    break
                case 'Operator':
                    createVar()
                    const op1 = stack.pop()
                    const op2 = stack.pop()
                    code.push(new Codegen(curr, type, op1.toString(), node.op, op2.toString()))
                    stack.push(new Node({type: 'Identifier', name: curr})) 
                    if (node.array) {
                        createVar()
                        code.push(new Codegen(curr, type, prev, '<<', 2))
                        createVar()
                        code.push(new Codegen(curr, type, `${heap}[${prev}>>2]`))
                        stack.pop() //# pop off the prev, replace with curr
                        stack.push(new Node({type: 'Identifier', name: curr})) 
                    }
            }
            ptr++
        }

    }
}
