/*
 * AsmFactory
 * 
 *  Create asm.js with ast structures 
 */
"use strict"
const Token = require('./classes/Token')

module.exports = {
    ObjectMember: ObjectMember,
    ObjectMethod: ObjectMethod,
    ObjectArray: ObjectArray,
    LocalArray: LocalArray
    
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function ObjectArray(name, index, offset, heap, size) {
    return {
        "type": "MemberExpression",
        "computed": true,
        "object": {
            "type": "Identifier",
            "name": heap
        },
        "property": {
            "type": "BinaryExpression",
            "operator": ">>",
            "left": {
                "type": "BinaryExpression",
                "operator": "+",
                "left": {
                    "type": "BinaryExpression",
                    "operator": "+",
                    "left": {
                        "type": "Identifier",
                        "name": name
                    },
                    "right": {
                        "type": "Identifier",
                        "name": offset
                    }
                },
                "right": {
                    "type": "BinaryExpression",
                    "operator": "<<",
                    "left": {
                        "type": "Identifier",
                        "name": index
                    },
                    "right": {
                        "type": "Identifier",
                        "name": size
                    }
                }
            },
            "right": {
                "type": "Identifier",
                "name": size
            }
        }
    }

}

function LocalArray(name, index, heap, size) {
    return {
        "type": "MemberExpression",
        "computed": true,
        "object": {
            "type": "Identifier",
            "name": heap
        },
        "property": {
            "type": "BinaryExpression",
            "operator": ">>",
            "left": {
                "type": "BinaryExpression",
                "operator": "+",
                "left": {
                    "type": "Identifier",
                    "name": name
                },
                "right": {
                    "type": "BinaryExpression",
                    "operator": "<<",
                    "left": {
                        "type": "Identifier",
                        "name": index
                    },
                    "right": {
                        "type": "Identifier",
                        "name": size
                    }
                }
            },
            "right": {
                "type": "Identifier",
                "name": size
            }
        }
    }
}

function ObjectMethod(name, args) {
    return {
        "type": "CallExpression",
        "callee": {
            "type": "Identifier",
            "name": name
        },
        "arguments": args
    }
}

function ObjectMember(name, offset, heap, size) {
    return {
        type: 'MemberExpression',
        computed: true,
        object: {
            type: 'Identifier',
            name: heap
        },
        property: {
            type: 'BinaryExpression',
            operator: '>>',
            left: {
                type: 'BinaryExpression',
                operator: '+',
                left: {
                    type: 'Identifier',
                    name: name
                },
                right: {
                    type: 'Literal',
                    value: offset
                }
            },
            right: {
                type: 'Literal',
                value: size
            }
        }
    }
}



