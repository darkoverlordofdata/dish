/**
 *+--------------------------------------------------------------------+
 * dish.bison
 *+--------------------------------------------------------------------+
 * Copyright DarkOverlordOfData (c) 2016
 *+--------------------------------------------------------------------+
 *
 * This file is a part of D?ish
 *
 * D?ish is free software; you can copy, modify, and distribute
 * it under the terms of the MIT License
 *
 *+--------------------------------------------------------------------+
 *
 *   D?ish JISON Grammar
 *
 *       Maps grammar rules to the runtime ast
 *
 * jison src/dish.bison src/dish.flex --outfile src/dish.js && node src/dish.js src/test.d
 */
%{
ast = require('./ast');
%}
%start translation_unit
// %start program
%token BEGIN END

%token IDENTIFIER 
%token NUMBER
%token INC_OP DEC_OP LEFT_OP RIGHT_OP LE_OP GE_OP EQ_OP NE_OP
%token AND_OP OR_OP MUL_ASSIGN DIV_ASSIGN MOD_ASSIGN ADD_ASSIGN
%token SUB_ASSIGN LEFT_ASSIGN RIGHT_ASSIGN AND_ASSIGN
%token XOR_ASSIGN OR_ASSIGN 

%token CHAR INT FLOAT DOUBLE CONST VOID
%token BOOL
%token ENUM

%token CASE DEFAULT IF ELSE SWITCH WHILE DO FOR CONTINUE BREAK RETURN IMPORT EXPORT TRY CATCH FINALLY

%%
//+--------------------------------------------------------------------+
//      Rule                            AST Node
//+--------------------------------------------------------------------+

//program
translation_unit
        :function                { ast.done();}
        ;


function
        :INT IDENTIFIER '(' ')' BEGIN expression END  { ast.FunctionDeclaration($1, $2); }
        ;

expression
        :RETURN primary_expression ';'      { ast.ReturnStatement($1, $2); }        
        ;

////////////////////////////////////////////////////////////////////////        

primary_expression
	: IDENTIFIER
	| CONSTANT
	;

%%
