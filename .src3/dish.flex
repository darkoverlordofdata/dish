/**
 *+--------------------------------------------------------------------+
 * dish.flex
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
 *   D?ish JISON Lexer
 *
 *       Maps patterns to tokens
 */
%{

%}
Char                [.\n]
Digit               [0-9]
Letter              [A-Za-z]
AlphaNum            [A-Za-z0-9]

Identifier          {Letter}{AlphaNum}*
Var                 {Identifier}[$%]?
Integer             {Digit}+
/*
Number              {Digit}*"."{Digit}+
*/
Number              {Digit}*"."{Digit}+([eE][-+]?[0-9]+)?
String              \"[^"]*\"

%%
"//"[^\n]*    { /* Discard comments. */ }
[ \t\n]+      { /* Ignore whitespace */ }

"+="		return 'ADD_ASSIGN';
"-="		return 'SUB_ASSIGN';
"*="		return 'MUL_ASSIGN';
"/="		return 'DIV_ASSIGN';
"%="		return 'MOD_ASSIGN';
"&="		return 'AND_ASSIGN';
"^="		return 'XOR_ASSIGN';
"|="		return 'OR_ASSIGN';
">>"		return 'RIGHT_OP';
"<<"		return 'LEFT_OP';
"++"		return 'INC_OP';
"--"		return 'DEC_OP';
"&&"		return 'AND_OP';
"||"		return 'OR_OP';
"<="		return 'LE_OP';
">="		return 'GE_OP';
"=="		return 'EQ_OP';
"!="		return 'NE_OP';
";"			return ';';
"{"         return 'BEGIN';
"}"         return 'END';
","			return ',';
":"			return ':';
"="			return '=';
"["			return '[';
"]"			return ']';
"."			return '.';
"&"			return '&';
"!"			return '!';
"~"			return '~';
"-"			return '-';
"+"			return '+';
"*"			return '*';
"/"			return '/';
"%"			return '%';
"<"			return '<';
">"			return '>';
"^"			return '^';
"|"			return '|';
"?"			return '?';
"("         return '(';
")"         return ')';


"bool"          return 'BOOL';
"break"			return 'BREAK';
"case"			return 'CASE';
"char"			return 'CHAR';
"const"			return 'CONST';
"continue"		return 'CONTINUE';
"default"		return 'DEFAULT';
"do"			return 'DO';
"double"		return 'DOUBLE';
"else"			return 'ELSE';
"enum"			return 'ENUM';
"float"			return 'FLOAT';
"for"			return 'FOR';
"if"			return 'IF';
"int"			return 'INT';
"return"		return 'RETURN';
"sizeof"		return 'SIZEOF';
"switch"		return 'SWITCH';
"void"			return 'VOID';
"while"			return 'WHILE';
"import"		return 'IMPORT';
"export"		return 'EXPORT';
"try"		    return 'TRY';
"catch"		    return 'CATCH';
"finally"		return 'FINALLY';


{Identifier}  return 'IDENTIFIER';
{Integer}     return 'CONSTANT';


