/**
 *+--------------------------------------------------------------------+
 * dish.bison
 *+--------------------------------------------------------------------+
 * Copyright DarkOverlordOfData (c) 2016
 *+--------------------------------------------------------------------+
 *
 * This file is a part of D?ish
 *
 * D?ish is free software; you can copy, modify, and distribute
 * it under the terms of the MIT License
 *
 *+--------------------------------------------------------------------+
 *
 *   D?ish JISON Grammar
 *
 *       Maps grammar rules to the runtime ast
 *
 * jison src/dish.bison src/dish.flex --outfile src/dish.js && node src/dish.js src/test.d
 */
%{

    ast = require('./ast');
    escodegen = require('escodegen')
    node = null;
    nodes = [];
    root = {type: "Program", body: []};
    function done() {
        //console.log(JSON.stringify(root, null, 2));
        console.log(escodegen.generate(root))
    }

%}
%start program
%token TYPE IDENTIFIER RETURN NUMBER
%token OPEN_BRACE CLOSE_BRACE

%%
//+--------------------------------------------------------------------+
//      Rule                            AST Node
//+--------------------------------------------------------------------+

program
        :function                
        { 
                $$ = root; 
                done(); 
        }
        ;


function
        :TYPE IDENTIFIER '(' ')' OPEN_BRACE expression CLOSE_BRACE
        { 
                $$ = {  type: "FunctionDeclaration", 
                        id: {
                                type: "Identifier",
                                name: $2
                        },
                        params: [],
                        defaults: [],
                        body: {
                                type: "BlockStatement",
                                body: nodes,
                        },
                        generator: false,
                        expression: false
                };
                root.body.push($$) 
        }
        ;

expression
        :RETURN NUMBER ';'              
        { 
                $$ = {  type: "ReturnStatement", 
                        argument: {
                            type: "Literal",
                            value: parseInt($2),
                            raw: $2
                        }
                }; 
                nodes.push($$); 
        }
        ;

