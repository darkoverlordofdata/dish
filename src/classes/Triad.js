'use strict'

/**
 * Triad
 * 
 * Three Address Code (TAC) 
 * 
 *  rhs = left operator right
 *  rhs = lhs
 * 
 * @param name lhs variable name
 * @param type lhs variable type
 * @param left
 * @param op
 * @param right
 */
class Triad {
    constructor(name, type, left, op, right) {
        this.name = name
        this.type = type
        this.left = left
        this.op = op
        this.right = right
        switch(op) {
            case undefined:
                this.code = `${this.cast(type, left)}`
                break

            case '^':
            case '|':
            case '&':
            case '>>':
            case '<<':
                if (type === 'int') /** logical operations are already cast to ints */
                    this.code = `${left} ${op} ${right}`
                else
                    this.code = this.cast(type, `${left} ${op} ${right}`)
                break

            default:
                this.code = this.cast(type, `${left} ${op} ${right}`)
                break
        }
    }

    cast(type, value) {
        switch (type) {
            case 'bool':    return '(('+value+')|0)'
            case 'uint':    return '(('+value+')|0)'
            case 'int':     return '(('+value+')|0)'
            case 'double':  return '+('+value+')'
            case 'float':   return 'fround('+value+')'
            default:        return value
        }
    }
}

module.exports = Triad