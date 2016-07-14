escodegen = require('escodegen')
node = null;
nodes = [];
root = {type: "Program", body: []};

function done() {
    console.log(escodegen.generate(root))
	// console.log(JSON.stringify(root, null, 2))
}

function clone(o) {
    return JSON.parse(JSON.stringify(o));
}


function FunctionDeclaration($1, $2) {
    var node = {  
        type: "FunctionDeclaration", 
        id: {
            type: "Identifier",
            name: $2
        },
        params: [],
        defaults: [],
        body: {
            type: "BlockStatement",
            body: clone(nodes),
        },
        generator: false,
        expression: false
    };
    nodes = [];
    root.body.push(node) 
    return node;
}


function ReturnStatement($1, $2) {
    var node = {  
        type: "ReturnStatement", 
        argument: {
            type: "Literal",
            value: parseInt($2),
            raw: $2
        }
    }; 
    nodes.push(node); 
    return node;
}

module.exports = {
    done: done,
    FunctionDeclaration: FunctionDeclaration,
    ReturnStatement: ReturnStatement    
}