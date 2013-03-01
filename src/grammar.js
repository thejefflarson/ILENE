var Parser = require('jison').Parser,
    fs     = require('fs'),
    path   = require('path');


var lexer = [
  ["\\s+",                  '{ /* skip whitespace */ }'],
  ["[0-9]+(\\.[0-9]+)?\\b", '{ return "NUMBER";      }'],
  ["pls",                   '{ return "PLEASE";      }'],
  ["tku",                   '{ return "THANKYOU";    }'],
  ["addedupon",             '{ return "ADDEDUPON";   }'],
  ["takeaway",              '{ return "TAKEAWAY";    }'],
  ["times",                 '{ return "TIMES";       }'],
  ["sharedamong",           '{ return "SHAREDAMONG"; }'],
  ["remember",              '{ return "REMEMBER";    }'],
  ["do",                    '{ return "DO";          }'],
  ["ok",                    '{ return "OK";          }'],
  ["<<EOF>>",               '{ return "EOF";         }'],
  ["\\(",                   '{ return "("            }'],
  ["\\)",                   '{ return ")"            }'],
  ["(\\w+)?\\b",             '{ return "LABEL";      }']
];

var unwrap = /^function\s*\(\)\s*\{\s*return\s*([\s\S]*);\s*\}/;

// So we can write js in the rules. idea via coffeescript
var g = function(pattern, action){
  var act = action ? unwrap.exec(action)[1] : "$1";
  return [pattern, "$$ = " + act];
};

var global = {};

var grammar = {
  Program: [
    g('Statement',                       function() { return console.log($1); })
  ],

  Statement: [
    g('PLEASE Operation THANKYOU',       function(){ return $2; }),
    g('PLEASE Subroutine THANKYOU',      function(){ return $2; }),
    g('PLEASE LABEL THANKYOU',           function(){ return global[$2]; }),
    g('PLEASE REMEMBER LABEL Operation THANKYOU',  function() { return (global[$3] = $4); }),
    g('PLEASE REMEMBER LABEL Subroutine THANKYOU', function() { return (global[$3] = $4); })
  ],

  Operation: [
    g('Operation ADDEDUPON Operation',   function(){ return $1 + $3; }),
    g('Operation TAKEAWAY Operation',    function(){ return $1 - $3; }),
    g('Operation TIMES Operation',       function(){ return $1 * $3; }),
    g('Operation SHAREDAMONG Operation', function(){ return $1 / $3; }),
    g('( Operation )',                   function(){ return $2; }),
    g('NUMBER',                          function(){ return Number(yytext); })
  ],

  Subroutine: [
    g('DO Operation OK',                 function() { return function() { return $2; }; })
  ]
};

var operators = [
  ['left', 'ADDEDUPON', 'TAKEAWAY'],
  ['left', 'TIMES',     'SHAREDAMONG']
];

var parser = exports.parser = new Parser({
  bnf:       grammar,
  operators: operators,
  lex:       {rules: lexer}
});
