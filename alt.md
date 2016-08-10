convert to js functions...


parse as now except for statement bodies.
re-wrap the body in a javascript function, matchng args, vars

int => var ...

and parse with esprima

then refactor MemberExpressions.

self.id => HEAD[self+id.offset]

new int[] becomes call malloc(),
convert NewExpression to CallExpression;
convert property to arguments

    "object": {
        "type": "ThisExpression"
    },

    "object": {
        "type": "Identifier",
        "name": "self"
    },
