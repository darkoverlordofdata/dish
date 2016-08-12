#bin/dish example/entity.d --package entitas --template example/asm.tpl.js  --output out/entity.js
#bin/dish example/pool.d --package entitas --template example/asm.tpl.js --output out/pool.js
#tsc -p ./jsconfig.json

CC := bin/dish # This is the main compiler
SRCDIR := example
SRCEXT := d
FLAGS=--mangle
SOURCES=example/entity.d,example/pool.d
TMP=--template example/asm.tpl.js

default: $(BIN)/index
$(BIN)/index: $(SOURCES) 
  rm -rf $(BIN)/*.*
  -mkdir -p $(BIN)
  $(CC) $(FLAGS) $(LIB) $(SOURCES) -o $(BIN)/index.html $(RES)

