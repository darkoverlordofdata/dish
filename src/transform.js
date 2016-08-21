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

function code(packge, moduleName, str) {

    const esprima = require('esprima')
    const escodegen = require('escodegen')
    const estraverse = require('estraverse')
    const factory = require('./asmfactory')
    const meta = require('../dish.json')

    const symtbl = meta[packge][moduleName].symtbl
    const fields = meta[packge][moduleName].data
    const startPos = str.indexOf('const ') /** skip over import/export */
    const ast = esprima.parse(str.substr(startPos))    
    const mem = {
        byte:   {size: 0, width: 1, heap: 'HEAPU8',   name: 'HEAPU8'},
        char:   {size: 1, width: 2, heap: 'HEAPI16',  name: 'HEAPI16'},
        bool:   {size: 2, width: 4, heap: 'HEAPI32',  name: 'HEAPI32'},
        int:    {size: 2, width: 4, heap: 'HEAPI32',  name: 'HEAPI32'},
        uint:   {size: 2, width: 4, heap: 'HEAPU32',  name: 'HEAPU32'},
        object: {size: 2, width: 4, heap: 'HEAPI32',  name: 'HEAPU32'},
        float:  {size: 2, width: 4, heap: 'HEAPF32',  name: 'HEAPF32'},
        double: {size: 3, width: 8, heap: 'HEAPF64',  name: 'HEAPF64'}
    }

    /**
     * Transform Code
     */
    const body = ast.body[0].declarations[0].init.callee.body.body;
    const lines = []

    /**
     * 0 - ExpressionStatement  'use asm'
     * 1 - VariableDeclaration  - imports
     * i - FunctionDeclaration  - functions
     * n - ReturnStatement      - exports
     */
    for (let l in body) {
        if (body[l].type === 'FunctionDeclaration') {
            const func = body[l]

            for (let k = func.params.length; k<func.body.body.length; k++) {
                estraverse.replace(func.body.body[k], {
                    enter: function(node, parent) {

                        if (node.type === 'CallExpression' 
                            && node.callee.type === 'MemberExpression' &&  !node.callee.computed) {
                            /**
                             *  self.hasComponent(...) => Klass_hasComponent(...)
                             */

                            const object = symtbl[func.id.name][node.callee.object.name]
                            const name = object.type === moduleName
                                        ? node.callee.property.name
                                        : object.type+'_'+node.callee.property.name
                            node.arguments.unshift({ type: 'Identifier', name: object.name })

                            //console.log(JSON.stringify(parent, null, 2))//.type)
                            if (parent.type === 'AssignmentExpression') {
                                // right hand side should be coerced
                            }

                            return factory.ObjectMethod(name, node.arguments)
                            
                        }

                        if (node.type === 'MemberExpression' && !node.computed) {
                            /**
                             *  self.x => HEAP[self+x>>size]
                             */

                            if (parent.type === 'MemberExpression') return 
                            // self.components[index] => HEAP[self+components+(index<<size)>>size]

                            const object = symtbl[func.id.name][node.object.name]
                            const member = getField(node.property.name, meta[packge][object.type].data)
                            if (member) {
                                const heap = mem[member.type].heap
                                const size = mem[member.type].size
                                const offset = member.offset
                                
                                // console.log(JSON.stringify(parent, null, 2))//.type)
                                if (parent.type === 'AssignmentExpression') {
                                    // right hand side should be coerced
                                }
                                return factory.ObjectMember(node.object.name, offset, heap, size)
                            }                        
                        }

                        if (node.type === 'MemberExpression' && !!node.computed) {
                            if (node.object.type === 'MemberExpression' ) {
                                /**
                                 *  self.components[index] => HEAP[self+components+(index<<size)>>size]
                                 */
                                //console.log(node)
                                
                                return factory.ObjectArray()
                            } else {
                                /**
                                 *  indices[index] => HEAP[indices+(index<<size)>>size]
                                 */
                                // console.log(node)
                                return factory.LocalArray()
                            }

                        }
                    }
                })
            }
        }
    }
    

    const out = str.substr(0, startPos)+escodegen.generate(ast)
    return out

    function getField(name, fields) {
        for (let f in fields) {
            if (fields[f].name === name) {
                return fields[f]
            }
        }
    }
}