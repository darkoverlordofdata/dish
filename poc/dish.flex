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

%%
"//"[^\n]*    { /* Discard comments. */ }
[ \t\n]+      { /* Ignore whitespace */ }

"{"           { return 'OPEN_BRACE'; }
"}"           { return 'CLOSE_BRACE'; }
"("           { return '('; }
")"           { return ')'; }
";"           { return ';'; }
[0-9]+        { return 'NUMBER'; }
"return"      { return 'RETURN'; }

"int"         { return 'TYPE'; }
"main"        { return 'IDENTIFIER'; }

%%

