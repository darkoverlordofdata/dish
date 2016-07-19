#!/usr/bin/env node

ex = require('./src/expression.js')
jsep = require('jsep')
esprima = require('esprima')

// ast = jsep('(1812433253 * (mt[mti-1] ^ (mt[mti-1] >> 30)) + mti)')
// ast = jsep('mt[mti] & 4294967295')
// ast = jsep('(mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK)')
// ast = jsep('mt[kk+M-N] ^ (y >> 1) ^ mag01[y & 1]')

// console.log(ex.expression(jsep('mt[mti] & 4294967295')))
// console.log(ex.expression(jsep('(mt[kk]&UPPER_MASK)|(mt[kk+1]&LOWER_MASK)')))
// console.log(ex.expression(jsep('mt[kk+M-N] ^ (y >> 1) ^ mag01[y & 1]')))


var x = ex.compile(jsep('(x & 4294967295) | (y >>1)'))
console.log(x)
// console.log(JSON.stringify(esprima.parse(x), null, 2))