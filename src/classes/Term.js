'use strict'

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

module.exports = Term