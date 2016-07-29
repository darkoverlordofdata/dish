// Generated by CoffeeScript 1.10.0

/*
 * dē-ish compiler
 * 
 * usage:
 *      node ./src/dish.js test/test.d -m -w --output test/test.js
 *
 */
'use strict';
var args, code, codegen, esmangle, flags, fs, hdr, lexer, liquid, mangle, manifest, out, output, parsed, parser, path, ref, source, template, tpl, usage, util, whitespace;

fs = require('fs');

path = require('path');

util = require("util");

ref = require('./args'), args = ref.args, flags = ref.flags;

lexer = require('./lexer');

parser = require('./parser');

codegen = require('escodegen');

esmangle = require('esmangle');

liquid = require('liquid.coffee');

manifest = require('../package.json');

usage = "Usage: dish <filename>\n    -o --output        output file name\n    -t --template      template file name\n    -m --mangle        mangle output\n    -w --whitespace    remove whitespace";

if (args.count < 3) {
  console.log(usage);
  process.exit(1);
}

source = args();

template = args('-t', '--template', './src/asm.tpl.js');

output = args('-o', '--output');

mangle = flags('-m', '--mangle');

whitespace = flags('-w', '--whitespace');

console.log("*** dish " + manifest.version + " ***");

console.log("*** " + source + " ***");

parsed = parser.parse(lexer(fs.readFileSync(source, 'utf8')), mangle);

tpl = liquid.Template.parse(fs.readFileSync(template, 'utf8'));

if (mangle) {
  code = codegen.generate(esmangle.mangle(parsed.ast), {
    verbatim: 'verbatim',
    format: {
      compact: whitespace
    }
  });
} else {
  code = codegen.generate(parsed.ast, {
    verbatim: 'verbatim',
    format: {
      compact: whitespace
    }
  }).replace(/\('0.0'\)/g, '0.0');
}

out = tpl.render({
  name: parsed.name,
  version: manifest.version,
  source: source,
  code: code,
  heapsize: 0x4000,
  exports: parsed.exports,
  float: parsed.float,
  heapi8: parsed.heapi8,
  heapu8: parsed.heapu8,
  heapi16: parsed.heapi16,
  heapu16: parsed.heapu16,
  heapi32: parsed.heapi32,
  heapu32: parsed.heapu32,
  heapf32: parsed.heapf32,
  heapf64: parsed.heapf64,
  malloc: parsed.malloc
});


/*
 * Fix Ups
 */

while (/\n\n/.test(out)) {
  out = out.replace(/\n\n/mg, '\n');
}

out = out.replace(/__double__/mg, '+');

out = out.replace(/__int__/mg, '~~');

hdr = "// Generated by Dish " + manifest.version + "\n";

if (output) {
  fs.writeFileSync(output, hdr + out);
} else {
  console.log(out);
}
