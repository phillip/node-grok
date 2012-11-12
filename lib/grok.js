var ffi = require('ffi'),
  GrokPile = require('./grok/c-ext/pile.js'),
  GrokMatch = require('./grok/c-ext/match.js'),
  ref = require('ref'),
  Struct = require('ref-struct');

var Grok_t = Struct({
  'pattern': 'string',
  'pattern_len': 'int',
  'full_pattern': 'string',
   'full_pattern_len': 'int',
   '__patterns': 'pointer', // TCTREE*, technically
   '__re': 'pointer', // pcre*
   '__pcre_capture_vector': 'pointer', // int*
   '__pcre_num_captures': 'int',
   '__captures_by_id': 'pointer', // TCTREE*
   '__captures_by_name': 'pointer', // TCTREE*
   '__captures_by_subname': 'pointer', // TCTREE*
   '__captures_by_capture_number': 'pointer', // TCTREE*
   '__max_capture_num': 'int',
   'pcre_errptr': 'string',
   'pcre_erroffset': 'int',
   'pcre_errno': 'int',
   'logmask': 'uint',
   'logdepth': 'uint',
   'errstr': 'string'
});
var Grok_tPtr = ref.refType(Grok_t);

var libgrok = ffi.Library('libgrok', {
  'grok_new': [ Grok_tPtr, [] ],
  'grok_compilen': [ 'int', [ 'pointer', 'string', 'int' ] ],
  'grok_pattern_add': [ 'int', [ 'pointer', 'string', 'int', 'string', 'int' ] ],
  'grok_patterns_import_from_file': [ 'int', [ 'pointer', 'string' ] ],
  'grok_execn': [ 'int', [ 'pointer', 'string', 'int', 'pointer' ] ]
});

var status = {"GROK_OK": 0, 
              "GROK_ERROR_FILE_NOT_ACCESSIBLE": 1, 
              "GROK_ERROR_PATTERN_NOT_FOUND": 2,
              "GROK_ERROR_UNEXPECTED_READ_SIZE": 3,
              "GROK_ERROR_UNEXPECTED_READ_SIZE": 4,
              "GROK_ERROR_COMPILE_FAILED": 5,
              "GROK_ERROR_UNINITIALIZED": 6,
              "GROK_ERROR_PCRE_ERROR":7,
              "GROK_ERROR_NOMATCH": 8};

function Grok() {
  this.grok = libgrok.grok_new();
}

Grok.prototype.addPattern = function(name, pattern) {
  libgrok.grok_pattern_add(this.grok, name, name.length, pattern, pattern.length)
  return null;
}

Grok.prototype.addPatternsFromFile = function(path) {
  var ret = libgrok.grok_patterns_import_from_file(this.grok, path)
  if(ret != status.GROK_OK) {
    throw(ArgumentError + " Failed to add patterns from file " + path);
  }
  return null;
}

Grok.prototype.pattern = function() {
  return this.grok.pattern;
}

Grok.prototype.expanded_pattern = function() {
  return this.grok.full_pattern;
}

Grok.prototype.compile = function(pattern) {
  var ret = libgrok.grok_compilen(this.grok, pattern, pattern.length)
  if(ret != status.GROK_OK) {
    throw(ArgumentError + " Compile failed: " + this.errstr);
  }
  return ret;
}

Grok.prototype.match = function(text) {
  var match = GrokMatch.create();
  rc = libgrok.grok_execn(this.grok, text, text.length, match.grokMatch.ref());
  switch(rc) {
  case status.GROK_OK:
    return match;
  case status.GROK_ERROR_NOMATCH:
    return false;
  }

  throw(rc + " unknown return from grok_execn: " + rc);
}

exports.create = function() {
  return new Grok();
}

exports.createPile = function() {
  return GrokPile.create();
}

exports.status = status;
