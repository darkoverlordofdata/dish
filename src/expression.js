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

class Ast {
    constructor(type, value, array) {
        this.type = type
        this.op = value
        this.array = array || false
    }
}

/**
 * Term
 * 
 * Wraps a single term, managing the string interpretation
 * 
 * @param node  ast node
 */
class Term {
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
                        case 'CallExpression':      console.log('Not Supported', argz[arg]); process.exit(0) 
                        case 'BinaryExpression':    console.log('Not Supported', argz[arg]); process.exit(0) 
                        case 'Literal':             args.push(argz[arg].value); break
                        case 'Identifier':          args.push(argz[arg].name); break
                    }
                }
                return this.node.callee.name+'('+args.join(',')+')'

            default:            return ''
        }
    }
}

/**
 * Triad
 * 
 * Three Address Code (TAC) 
 * 
 *  rhs = left operator right
 *  rhs = lhs
 * 
 * @param name lhs variable name
 * @param type lhs variable type
 * @param left
 * @param op
 * @param right
 */
class Triad {
    constructor(name, type, left, op, right) {
        this.name = name
        this.type = type
        this.left = left
        this.op = op
        this.right = right
        switch(op) {
            case undefined:
                this.code = `${this.cast(type, left)}`
                break

            case '^':
            case '|':
            case '&':
            case '>>':
            case '<<':
                if (type === 'int') /** logical operations are already cast to ints */
                    this.code = `${left} ${op} ${right}`
                else
                    this.code = this.cast(type, `${left} ${op} ${right}`)
                break

            default:
                this.code = this.cast(type, `${left} ${op} ${right}`)
                break
        }
    }

    cast(type, value) {
        switch (type) {
            case 'bool':    return '(('+value+')|0)'
            case 'uint':    return '(('+value+')|0)'
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
 * 
 * TODO: pass the symtbl, not sym
 *       lookup member, not self
 * 
 * transpile an expression
 * 
 * @param tokens input ast
 * @param symbol lhs symbol being assigned to
 * @param index optional ast of index for lhs
 * @returns array of output lines
 */
function transpile(scope, symbol, tokens, symtbl, index, mangle) {

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
    console.log(scope, name, heap)
    if (index != null) {
        switch (index.type) {
            case 'Literal':
                createVar()
                code.push(new Triad(curr, type, name, '+', index.value))
                createVar()
                code.push(new Triad(curr, type, prev, '<<', size))
                break
            case 'Identifier':
                createVar()
                code.push(new Triad(curr, type, name, '+', index.name))
                createVar()
                code.push(new Triad(curr, type, prev, '<<', size))
                break
            case 'BinaryExpression':
                traverse(index)
                nodes = nodes.reverse()
                codegen()
                createVar()
                code.push(new Triad(curr, type, name, '+', prev))
                createVar()
                code.push(new Triad(curr, type, prev, '<<', size))
                break
        }
        name = `${heap}[${curr} >> ${size}]`
    }

    ptr = 0
    nodes = []
    stack = []
    traverse(tokens)
    nodes = nodes.reverse()
    codegen()
    let result = stack.pop()

    if (index == null) {
        code[code.length-1].name = name
    } else {
        code.push(new Triad(name, type, result.node.name || result.node.value))
    }
    return code

    function createVar() {
        prev = curr
        if (mangle) {
            curr = `$${uniqueId}`
            curr = curr.length === 2 ? `$0${uniqueId}` : curr
        } else {
            curr = `__${uniqueId}__`
            curr = curr.length === 5 ? `__0${uniqueId}__` : curr
        }
        uniqueId++
    }

    /**
     * Put the ast nodes into an ordered list
     */
    function traverse(node) {
        switch (node.type) {
            case 'BinaryExpression':
                nodes.push(new Ast('Operator', node.operator))
                traverse(node.left)
                traverse(node.right)
                break
            case 'MemberExpression':
                nodes.push(new Ast('Operator', '+', true))
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

    /**
     * iterate the ast node list
     */
    function codegen() {
        while (ptr<nodes.length) {
            const node = nodes[ptr]
            switch (node.type) {
                case 'Literal':
                case 'Identifier':
                case 'CallExpression':
                    stack.push(new Term(node))
                    break
                case 'Operator':
                    createVar()
                    const op1 = stack.pop()
                    const op2 = stack.pop()
                    code.push(new Triad(curr, type, op1.toString(), node.op, op2.toString()))
                    stack.push(new Term({type: 'Identifier', name: curr})) 
                    if (node.array) {
                        createVar()
                        code.push(new Triad(curr, type, prev, '<<', 2))
                        createVar()
                        code.push(new Triad(curr, type, `${heap}[${prev} >> 2]`))
                        stack.pop() //# pop off the prev, replace with curr
                        stack.push(new Term({type: 'Identifier', name: curr})) 
                    }
            }
            ptr++
        }

    }
    
}
