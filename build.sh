bin/dish example/entity.d --package entitas --template example/asm.tpl.js  --output out/entity.js
bin/dish example/pool.d --package entitas --template example/asm.tpl.js --output out/pool.js
tsc -p ./jsconfig.json



src/dish.coffee example/entity.d,example/pool.d --package entitas --template example/asm.tpl.js  --output out/entity.js



    "_vscode_build": "coffee -bc ./src/dish.coffee && coffee -bc ./example && node ./src/dish.js example/entity.d --package entitas --template example/asm.tpl.js  --output example/entity.js && node ./src/dish.js example/pool.d --package entitas --template example/asm.tpl.js --output example/pool.js && tsc -p ./jsconfig.json",
