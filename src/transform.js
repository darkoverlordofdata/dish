/**
 * transform.js
 * 
 * Phase II
 * 
 * Recursive Descent Parser for D`ish
 *  
 * Refactor expressions with thunking for heap access
 * Add type info annotations as required by asm.js
 * 
 */
'use strict'

module.exports = {
    code: code
}

function code(packge, moduleName, ast) {

    const esprima = require('esprima')
    const escodegen = require('escodegen')
    const estraverse = require('estraverse')
    const factory = require('./asmfactory')
    const meta = require('../dish.json')

    /** get the phase I scanned meta data */
    const symtbl = meta[packge][moduleName].symtbl
    const fields = meta[packge][moduleName].data

    const mem = {   /** memory parameters */
        byte:   {size: 0, width: 1, heap: 'HEAPU8'},
        char:   {size: 1, width: 2, heap: 'HEAPI16'},
        bool:   {size: 2, width: 4, heap: 'HEAPI32'},
        int:    {size: 2, width: 4, heap: 'HEAPI32'},
        uint:   {size: 2, width: 4, heap: 'HEAPU32'},
        object: {size: 2, width: 4, heap: 'HEAPI32'},
        float:  {size: 2, width: 4, heap: 'HEAPF32'},
        double: {size: 3, width: 8, heap: 'HEAPF64'}
    }

    /**
     * Transform Code
     */
    const body = ast.body
    const lines = []

    /**
     * Do the MemberExpression thunks
     * 
     * 0 - ExpressionStatement  'use asm'
     * 1 - VariableDeclaration  - imports
     * i - FunctionDeclaration  - functions
     * n - ReturnStatement      - exports
     */
    for (let each in body) {
        if (body[each].type === 'FunctionDeclaration') {
            const func = body[each]

            for (let k = func.params.length; k<func.body.body.length; k++) {
                estraverse.replace(func.body.body[k], {
                    enter: function(node, parent) {

                        if (node.type === 'CallExpression' 
                            && node.callee.type === 'MemberExpression' &&  !node.callee.computed) {
                            /**
                             *  self.hasComponent(...) 
                             *      => 
                             *  Klass_hasComponent(...)
                             */

                            const object = symtbl[func.id.name][node.callee.object.name]
                            const name = object.type === moduleName
                                        ? node.callee.property.name
                                        : object.type+'_'+node.callee.property.name
                            node.arguments.unshift({ type: 'Identifier', name: object.name })

                            return factory.ObjectMethod(name, node.arguments)
                            
                        }

                        if (node.type === 'MemberExpression' && !node.computed
                            && parent.type !== 'MemberExpression') {
                            /**
                             *  self.x 
                             *      => 
                             *  HEAP[self+x>>size]
                             */
                            const object = symtbl[func.id.name][node.object.name]
                            const member = getField(node.property.name, meta[packge][object.type].data)
                            if (member) {
                                const heap = mem[member.type].heap
                                const size = mem[member.type].size
                                const offset = member.offset
                                
                                return factory.ObjectMember(node.object.name, offset, heap, size)
                            }                        
                        }

                        if (node.type === 'MemberExpression' && node.computed) {
                            if (node.object.type === 'MemberExpression' ) {
                                /**
                                 *  self.components[index] 
                                 *      => 
                                 *  HEAP[self+components+(index<<size)>>size]
                                 */
                                const object = symtbl[func.id.name][node.object.object.name]
                                const member = getField(node.object.property.name, meta[packge][object.type].data)
                                if (member) {
                                    const heap = mem[member.type].heap
                                    const size = mem[member.type].size
                                    const offset = member.offset
                                    return factory.ObjectArray(node.object.object.name, node.object.property.name, offset, heap, size)
                                }                        
                                
                            } else {
                                /**
                                 *  indices[index] 
                                 *      => 
                                 *  HEAP[indices+(index<<size)>>size]
                                 */
                                const object = symtbl[func.id.name][node.object.name]
                                const index = symtbl[func.id.name][node.property.name]
                                const heap = mem[object.type].heap
                                const size = mem[object.type].size
                                return factory.LocalArray(object.name, index.name, heap, size)
                            }

                        }
                    }
                })
            }

            /**
             * Ensure the RHS is coerced
             */
            for (let k = func.params.length; k<func.body.body.length; k++) {
                estraverse.replace(func.body.body[k], {
                    enter: function(node, parent) {
                        // if (node.type === 'AssignmentExpression') {
                            //BinaryExpression
                            //ReturnStatement
                            console.log(JSON.stringify(node, null, 2))
                            console.log('-------------------------------------')
                            // right hand side should be coerced
                        // }

                    }
                })
            }
            
        }
    }
    

    //const out = str.substr(0, startPos)+escodegen.generate(ast)
    const out = escodegen.generate(ast)
    return out

    function getField(name, fields) {
        for (let f in fields) {
            if (fields[f].name === name) {
                return fields[f]
            }
        }
    }
}