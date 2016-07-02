"use strict";

function has_side_effects(exp) {
    switch (exp.type) {
      case "call":
      case "assign":
      case "raw":
        return true;

      case "num":
      case "str":
      case "bool":
      case "var":
      case "lambda":
        return false;

      case "binary":
        return has_side_effects(exp.left)
            || has_side_effects(exp.right);

      case "if":
        return has_side_effects(exp.cond)
            || has_side_effects(exp.then)
            || (exp.else && has_side_effects(exp.else));

      case "let":
        for (var i = 0; i < exp.vars.length; ++i) {
            var v = exp.vars[i];
            if (v.def && has_side_effects(v.def))
                return true;
        }
        return has_side_effects(exp.body);

      case "prog":
        for (var i = 0; i < exp.prog.length; ++i)
            if (has_side_effects(exp.prog[i]))
                return true;
        return false;
    }
    return true;
}

module.exports = has_side_effects
