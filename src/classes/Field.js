'use strict'

class Field {
    constructor(_public, _static, _const,  name, type, array, size) {
        switch (type) {
            case 'double': 
                Field.offset = Field.last 
                Field.last += (8*(size||1))
                Field.size = (8*(size||1))
                // console.log(Field.index, name, Field.offset, Field.last, Field.size)
                break
            default: 
                Field.offset = Field.last 
                Field.last += (4*(size||1))
                Field.size = (4*(size||1))
                // console.log(Field.index, name, Field.offset, Field.last, Field.size)
                break
        }
        this.name = name
        this.type = type
        this.array = array
        this.size = size
        this.index = Field.index
        this.offset = Field.offset
        this.public = _public
        this.static = _static
        this.const = _const

        Field.index++
    }

}
Field.offset = 0
Field.index = 0
Field.size = 0
Field.last = 0

module.exports = Field