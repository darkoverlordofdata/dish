
module.exports = function(input) {

    const esprima = require('esprima')
    const Token = require('./Token')

    return {
        parseExpression:parseExpression
    }
    /**
     * test if the token is a delimiter  
     */
    function match(ch) {
        const tok = input.peek()
        return tok.type === Token.Delimiter && tok.value === ch
    }

    /**
     * test if the token is a keyword  
     */
    function matchKeyword(kw) {
        const tok = input.peek()
        return tok.type === Token.Keyword && tok.value === kw
    }

    /**
     * Token MUST match the delimiter
     */
    function expect(ch) {
        if (match(ch)) input.next()
        else input.raise(`Expecting delimiter: [${ch}]`)
    }

    /**
     * Token MUST match the keyword
     */
    function expectKeyword(kw) {
        if (matchKeyword(kw)) input.next()
        else input.raise(`Expecting keyword: [${kw}]`)
    }

    function parseExpression(body) {
        input.mark()
        const tokens = []
        while (!match(';')) {
            tokens.push(input.next().value)
        }

        const ast = esprima.parse(tokens.join(' ')).body[0].expression
        // console.log(JSON.stringify(ast))
        // console.log('=======================')

        if (ast.type === "AssignmentExpression") {
            switch (ast.right.type) {
                case "BinaryExpression":
                    console.log(JSON.stringify(ast))
                    console.log('=======================')
                    break
                case "NewExpression":
                    if (ast.right.callee.computed === true) {
                        return {
                            "type": "AssignmentExpression",
                            "operator": "=",
                            "left": {
                                "type": "Identifier",
                                "name": ast.left.name
                            },
                            "right": {
                                "type": "CallExpression",
                                "callee": {
                                    "type": "Identifier",
                                    "name": "malloc"
                                },
                                "arguments": [
                                    {
                                        "type": "BinaryExpression",
                                        "operator": ">>",
                                        "left": {
                                            "type": "BinaryExpression",
                                            "operator": "<<",
                                            "left": {
                                                "type": "Identifier",
                                                "name": ast.right.callee.property.name
                                            },
                                            "right": {
                                                "type": "Literal",
                                                "value": 2,
                                                "raw": "2"
                                            }
                                        },
                                        "right": {
                                            "type": "Literal",
                                            "value": 2,
                                            "raw": "2"
                                        }
                                    }
                                ]
                            }
                        }
                    }
                    break
                case "MemberExpression":
                    break
                case "CallExpression":
                    break
            }

        } else if (ast.type === "CallExpression") {

        }
        input.restore()
    }
}