'use strict'

class Symbol {
    constructor(name, type, func, init, array, immutable) {
        this.name = name
        this.type = type
        this.func = func || false
        this.init = init || ''
        this.array = array || false
        this.immutable = immutable || false
        switch(type) {
            case 'bool': this.size = 2; break
            case 'uint': this.size = 2; break
            case 'int': this.size = 2; break
            case 'float': this.size = 2; break
            case 'double': this.size = 3; break
            default: this.size = 2; break
        }
        switch(type) {
            case 'bool': this.heap = 'HEAPI32'; break
            case 'uint': this.heap = 'HEAPU32'; break
            case 'int': this.heap = 'HEAPI32'; break
            case 'float': this.heap = 'HEAPF32'; break
            case 'double': this.heap = 'HEAPF64'; break
            default: this.heap = 'HEAPI32'; break
        }
    }
}

module.exports = Symbol