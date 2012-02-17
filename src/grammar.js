var Parser = require('jison').Parser,
    fs     = require('fs')
    path   = require('path');

var unwrap = /^function\s*\(\)\s*\{\s*return\s*([\s\S]*);\s*\}/;

// So we can write js in the rules. idea via coffeescript
var g = function(pattern, action, options){
  var act = action ? unwrap.exec(action)[1] : "$1";
  return [pattern, "$$ = " + act, options];
};

// So we can write js in the lexer
var l = function(pattern, action) {
  return [pattern, unwrap.exec(action)[1]];
}

var lexer = [
  [/\s+/,                   "/* skip whitespace */"],
  l(/[0-9]+("."[0-9]+)?\b/, function(){ return "NUMBER";      }),
  l("pls",                  function(){ return "PLEASE";      }),
  l("tku",                  function(){ return "THANKYOU";    }),
  l("addedupon",            function(){ return "ADDEDUPON";   }),
  l("takeaway",             function(){ return "TAKEAWAY";    }),
  l("times",                function(){ return "TIMES";       }),
  l("sharedamong",          function(){ return "SHAREDAMONG"; })
];

var grammar = {
  Program: [
    g('Statement')
  ],

  Statement: [
    g('PLEASE Operation THANKYOU')
  ],

  Operation: [
    g('Operation ADDEDUPON Operation',   function(){ return $1 + $3; }),
    g('Operation TAKEAWAY Operation',    function(){ return $1 - $3; }),
    g('Operation TIMES Operation',       function(){ return $1 * $3; }),
    g('Operation SHAREDAMONG Operation', function(){ return $1 / $3; }),
    g('( Operation )',                   function(){ return $2; }),
    g('NUMBER',                          function(){ return +(yytext); })
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
