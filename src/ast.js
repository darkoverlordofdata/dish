"use strict";

class Program {
    constructor() {
        console.log('Program')
    }
}

class Header {
    constructor($1, $2) {
        console.log('Header', $1, $2)
    }

}

class Function {
    constructor($1, $2) {
        console.log('Function', $1, $2)
    }

}

class Expression {
    constructor($1, $2) {
        console.log('Expression', $1, $2)
    }

}

module.exports = {
    Program: Program,
    Header: Header,
    Function: Function,
    Expression: Expression
}