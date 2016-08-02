/*
 * Factory
 * 
 *  Create constructs as ast structures 
 */
"use strict"
const Token = require('./Token')

module.exports = {
    ImportDeclaration: ImportDeclaration,
    ExportDeclaration: ExportDeclaration,
    BoolDeclaration: BoolDeclaration,
    IntDeclaration: IntDeclaration,
    FloatDeclaration: FloatDeclaration,
    DoubleDeclaration: DoubleDeclaration,
    IntParameter: IntParameter,
    FloatParameter: FloatParameter,
    DoubleParameter: DoubleParameter,
    FunctionDeclaration: FunctionDeclaration,
    AssignmentStatement: AssignmentStatement,
    CallExpression: CallExpression,
    BreakStatement: BreakStatement,
    ContinueStatement: ContinueStatement,
    WhileStatement: WhileStatement,
    DoWhileStatement: DoWhileStatement,
    IfStatement: IfStatement,
    SwitchStatement: SwitchStatement,
    ForStatement: ForStatement,
    SequenceExpression: SequenceExpression,
    AssignmentExpression: AssignmentExpression,
    Return: Return,
    Print: Print,
    New: New
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function Print(args) {
    return {
        "type": "ExpressionStatement",
        "expression": {
            "type": "CallExpression",
            "callee": {
                "type": "MemberExpression",
                "computed": false,
                "object": {
                    "type": "Identifier",
                    "name": "console"
                },
                "property": {
                    "type": "Identifier",
                    "name": "log"
                }
            },
            "arguments": args
        }        
    }
}


// function New(name, size, type, id) {
function New(name, size, alloc) {
    return {
        "type": "ExpressionStatement",
        "expression": {
            "type": "AssignmentExpression",
            "operator": "=",
            "left": {
                "type": "Identifier",
                "name": name
            },
            "right": {
                "type": "BinaryExpression",
                "operator": ">>",
                "left": {
                    "type": "BinaryExpression",
                    "operator": "|",
                    "left": {
                        "type": "CallExpression",
                        "callee": {
                            "type": "Identifier",
                            "name": "malloc"
                        },
                        "arguments": [
                            {
                                "type": "BinaryExpression",
                                "operator": "<<",
                                "left": alloc,
                                "right": {
                                    "type": "Literal",
                                    "value": size,
                                    "raw": ""+size
                                }
                            }
                        ]
                    },
                    "right": {
                        "type": "Literal",
                        "value": 0,
                        "raw": "0"
                    }
                },
                "right": {
                    "type": "Literal",
                    "value": size,
                    "raw": ""+size
                }
            }
        }
    }
}

/** the init of a for statement */
function SequenceExpression(assignmentExpressions) {
    return {
        "type": "SequenceExpression",
        "expressions": assignmentExpressions || []
    }
}

function ForStatement(init, test, update, body) {
    return {
        "type": "ForStatement",
        "init": init,
        "test": test,
        "update": update,
        "body": {
            "type": "BlockStatement",
            "body": body
        }          
    }
}

function SwitchStatement(discriminant, cases) {
    return {
        "type": "SwitchStatement",
        "discriminant": discriminant,
        "cases": cases
    }
}
function IfStatement(test, consequent, alternate) {
    return {
        "type": "IfStatement",
        "test": test,
        "consequent": consequent,
        "alternate": alternate
    }
}

function DoWhileStatement(cond, body) {
    return {
        "type": "DoWhileStatement",
        "test": cond,
        "body": {
            "type": "BlockStatement",
            "body": body
        }
    }
}

function WhileStatement(cond, body) {
    return {
        "type": "WhileStatement",
        "test": cond,
        "body": {
            "type": "BlockStatement",
            "body": body
        }
    }
}

function ContinueStatement() {
    return {
        "type": "ContinueStatement",
        "label": null
    }
}
function BreakStatement() {
    return {
        "type": "BreakStatement",
        "label": null
    }
}

function CallExpression(name, args) {
    return {
        "type": "ExpressionStatement",
        "expression": {
            "type": "CallExpression",
            "callee": {
                "type": "Identifier",
                "name": name.value
            },
            "arguments": args || []
        }
    }
}

function AssignmentStatement(names, expressions) {
    
    if (Array.isArray(names)) {
        if (names.length === 1) return AssignmentExpression(names[0], expressions[0])
        else return {
            "type": "ExpressionStatement",
            "expression": {
                "type": "SequenceExpression",
                "expressions": (function(seq) {
                    for (let i=0; i<names.length; i++) {
                        seq.push(AssignmentExpression(names[i], expressions[i]))
                    }
                    return seq
                }([]))
            }
        }
    } else  {
        return {
            "type": "ExpressionStatement",
            "expression": AssignmentExpression(names, expressions)
        }
    }
}

function AssignmentExpression(name, expression) {
    return {
        "type": "AssignmentExpression",
        "operator": "=",
        "left": {
            "type": "Identifier",
            "name": name
        },
        "right": expression
    }
}


function FunctionDeclaration(name, args, body) {

    const params = []
    for (let i in args) {
        params.push({"type": "Identifier", "name": args[i].name.value})
    }

    return {
        "type": "FunctionDeclaration",
        "id": {
            "type": "Identifier",
            "name": name.value
        },
        "params": params,
        "defaults": [],
        "body": {
            "type": "BlockStatement",
            "body": clone(body)
        },
        "generator": false,
        "expression": false
    }


}
function Return(expression) {
    return {
        "type": "ReturnStatement",
        "argument": expression
    }
}



function DoubleParameter(name) {
    return {
        "type": "ExpressionStatement",
        "expression": {
            "type": "AssignmentExpression",
            "operator": "=",
            "left": {
                "type": "Identifier",
                "name": name.value
            },
            "right": {
                "type": "UnaryExpression",
                "operator": "+",
                "argument": {
                    "type": "Identifier",
                    "name": name.value
                },
                "prefix": true
            }
        }
    }
}
/**
 * double <name>; 
 * 
 * <|> var <name> = 0.0;
 */
function DoubleDeclaration(name, init) {
    return {
        "type": "VariableDeclaration",
        "declarations": [
            {
                "type": "VariableDeclarator",
                "id": {
                    "type": "Identifier",
                    "name": name
                },
                "init": init || {
                    "type": "Literal",
                    "value": 0,
                    "raw": "0.0",
                    "verbatim": "'0.0'"
                }
            }
        ],
        "kind": "var"
    }
}

function IntParameter(name) {
    return {
        "type": "ExpressionStatement",
        "expression": {
            "type": "AssignmentExpression",
            "operator": "=",
            "left": {
                "type": "Identifier",
                "name": name.value
            },
            "right": {
                "type": "BinaryExpression",
                "operator": "|",
                "left": {
                    "type": "Identifier",
                    "name": name.value
                },
                "right": {
                    "type": "Literal",
                    "value": 0,
                    "raw": "0"
                }
            }
        }
    }
}
/**
 * int <name>;
 * 
 * <|> var <name> = 0;
 */
function BoolDeclaration(name, init) {
    return {
        "type": "VariableDeclaration",
        "declarations": [
            {
                "type": "VariableDeclarator",
                "id": {
                    "type": "Identifier",
                    "name": name
                },
                "init": init || {
                    "type": "Literal",
                    "value": 0,
                    "raw": "0"
                }
            }
        ],
        "kind": "var"
    }
}

/**
 * int <name>;
 * 
 * <|> var <name> = 0;
 */
function IntDeclaration(name, init) {
    return {
        "type": "VariableDeclaration",
        "declarations": [
            {
                "type": "VariableDeclarator",
                "id": {
                    "type": "Identifier",
                    "name": name
                },
                "init": init || {
                    "type": "Literal",
                    "value": 0,
                    "raw": "0"
                }
            }
        ],
        "kind": "var"
    }
}

function FloatParameter(name) {
    return {
        "type": "ExpressionStatement",
        "expression": {
            "type": "AssignmentExpression",
            "operator": "=",
            "left": {
                "type": "Identifier",
                "name": name.value
            },
            "right": {
                "type": "CallExpression",
                "callee": {
                    "type": "Identifier",
                    "name": "fround"
                },
                "arguments": [
                    {
                        "type": "Identifier",
                        "name": name.value
                    }
                ]
            }
        }
    }
}

function FloatDeclaration(name, init) {
    return {
        "type": "VariableDeclaration",
        "declarations": [
            {
                "type": "VariableDeclarator",
                "id": {
                    "type": "Identifier",
                    "name": name
                },
                "init": init || {
                    "type": "CallExpression",
                    "callee": {
                        "type": "Identifier",
                        "name": "fround"
                    },
                    "arguments": [
                        {
                            "type": "Literal",
                            "value": 0,
                            "raw": "0"
                        }
                    ]
                }
            }
        ],
        "kind": "var"
    }
}
    
/**
 * import <name> from <libname.source>;
 * 
 * <|> var <name> = stdlib.libname.source;
 */
function ImportDeclaration(libname, name) {
    return {
        "type": "VariableDeclaration",
        "declarations": [
            {
                "type": "VariableDeclarator",
                "id": {
                    "type": "Identifier",
                    "name": name
                },
                "init": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                        "type": "Identifier",
                        "name": libname,
                    },
                    "property": {
                        "type": "Identifier",
                        "name": name
                    }
                }
            }
        ],
        "kind": "var"
    }
}

function ExportDeclaration(exporting) {
    return {
        "type": "ReturnStatement",
        "argument": {
            "type": "ObjectExpression",
            "properties": _exportValues(exporting)
        }
    }


}

function _exportValues(exporting) {
    let properties = []
    for (let i in exporting) {
        let name = exporting[i]
        properties.push({
            "type": "Property",
            "key": {
                "type": "Identifier",
                "name": name
            },
            "computed": false,
            "value": {
                "type": "Identifier",
                "name": name
            },
            "kind": "init",
            "method": false,
            "shorthand": false
        })
    }
}

