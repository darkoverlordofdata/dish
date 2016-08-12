'use strict'

class Ast {
    constructor(type, value, array) {
        this.type = type
        this.op = value
        this.array = array || false
    }
}

module.exports = Ast