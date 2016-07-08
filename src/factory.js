"use strict"
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
        DoubleDeclaration: DoubleDeclaration,
        FunctionDeclaration: FunctionDeclaration,
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
    function Return() {
        return {
            "type": "ReturnStatement",
            "argument": null
        }
    }

    /**
     * double <name>; 
     * 
     * |> var <name> = 0.0;
     */
    function DoubleDeclaration(name) {
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
     * |> var <name> = 0;
     */
    function IntDeclaration(name) {
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
                        "type": "Literal",
                        "value": 0,
                        "raw": "0",
                        "verbatim": "'0'"
                    }
                }
            ],
            "kind": "var"
        }
    }

        
    /**
     * import <name> from <libname.source>;
     * 
     * |> var <name> = stdlib.libname.source;
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

}