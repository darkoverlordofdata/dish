/*
 * Factory
 * 
 *  Create output ast structures to be consumed by escodegen
 */
"use strict"
const Token = require('./Token')

module.exports = {factory:factory}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj))
}
function factory() {
    /**
     * escodegen node factory api:
     */
    return {
        ImportDeclaration: ImportDeclaration,
        ExportDeclaration: ExportDeclaration,
        IntDeclaration: IntDeclaration,
        FloatDeclaration: FloatDeclaration,
        DoubleDeclaration: DoubleDeclaration,
        IntParameter: IntParameter,
        FloatParameter: FloatParameter,
        DoubleParameter: DoubleParameter,
        FunctionDeclaration: FunctionDeclaration,
        AssignmentStatement: AssignmentStatement,
        CallExpression: CallExpression,
        Return: Return

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

    function AssignmentStatement(name, expression) {
        return {
            "type": "ExpressionStatement",
            "expression": {
                "type": "AssignmentExpression",
                "operator": "=",
                "left": {
                    "type": "Identifier",
                    "name": name.value
                },
                "right": expression
            }
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
    function ImportDeclaration(libname, source, name) {
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
                            "type": "MemberExpression",
                            "computed": false,
                            "object": {
                                "type": "Identifier",
                                "name": libname
                            },
                            "property": {
                                "type": "Identifier",
                                "name": source
                            }
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

}