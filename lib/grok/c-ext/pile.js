var Grok = require('../../grok.js'),
    fs = require('fs');

// A grok pile is an easy way to have multiple patterns together so
// that you can try to match against each one.
// The API provided should be similar to the normal Grok
// interface, but you can compile multiple patterns and match will
// try each one until a match is found.

function GrokPile() {
  this.groks = [];
  this.patterns = {};
  this.pattern_files = [];
}

// see Grok#add_pattern
GrokPile.prototype.addPattern = function(name, string) {
  this.patterns[name] = string;
}

// see Grok#add_patterns_from_file
GrokPile.prototype.addPatternsFromFile = function(path) {
  if(!fs.existsSync(path)) {
    throw("File does not exist: " + path);
  }
  this.pattern_files.push(path);
}

// see Grok#compile
GrokPile.prototype.compile = function(pattern) {
  var grok = Grok.create();
  for(var name in this.patterns) {
    grok.addPattern(name, this.patterns[name]);
  }
  for(var pathIdx in this.pattern_files) {
    var path = this.pattern_files[pathIdx];
    grok.addPatternsFromFile(path);
  }
  grok.compile(pattern);
  this.groks.push(grok);
}

// Slight difference from Grok#match in that it returns
// the Grok instance that matched successfully in addition
// to the GrokMatch result.
// See also: Grok#match
GrokPile.prototype.match = function(string) {
  for(var grokIdx in this.groks) {
    var grok = this.groks[grokIdx];
    var match = grok.match(string);
    if(match) {
      return [grok, match];
    }
  }
  return false;
}

exports.create = function() {
  return new GrokPile();
}
