"use strict"
const Token = require('./Token')

module.exports = {factory:factory}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj))
}
/**
 * escodegen node factory
 */
function factory() {


    return {
        ImportDeclaration: ImportDeclaration,
        IntDeclaration: IntDeclaration,
        FloatDeclaration: FloatDeclaration,
        DoubleDeclaration: DoubleDeclaration,
        FunctionDeclaration: FunctionDeclaration,
        ExportDeclaration: ExportDeclaration,
        Return: Return

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
    function Return(value, argument) {
        return {
            "type": "ReturnStatement",
            "argument": argument //? Argument(argument) : null
        }
    }

    function Argument(token) {
        if (token.type === Token.Identifier) {
            return {
                "type": "Identifier",
                "name": token.value
            }
        } else return {
            "type": "Literal",
            "value": token.value,
            "raw": '"'+token.value+'"'
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