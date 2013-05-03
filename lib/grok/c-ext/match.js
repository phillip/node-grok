var ffi = require('ffi'),
    grok = require('../../grok.js'),
    ref = require('ref'),
    Struct = require('ref-struct');

var GrokMatch_t = Struct({
  'grok': 'pointer',
  'subject': 'string',
  'start': 'int',
  'end': 'int'
});
var GrokMatch_tPtr = ref.refType(GrokMatch_t);

var intPtr = ref.refType(ref.types.int);
var stringPtr = ref.refType(ref.types.CString);

var libgrok = ffi.Library('libgrok', {
  'grok_match_get_named_substring': [ 'pointer', [ 'pointer', 'pointer' ] ],
  'grok_match_walk_init': [ 'void', [ 'pointer' ] ],
  'grok_match_walk_next': [ 'int', [ 'pointer', stringPtr, intPtr, stringPtr, intPtr ] ],
  'grok_match_walk_end': [ 'void', [ 'pointer' ] ]
});

function GrokMatch() {
  this._captures = null;
  this.grokMatch = new GrokMatch_t();
}

GrokMatch.prototype.eachCapture = function() {
  var arr = [];
  this._captures = {};
  libgrok.grok_match_walk_init(this.grokMatch.ref());
  var name_ptr = ref.alloc(ref.types.CString);
  var name_len_ptr = ref.alloc(ref.types.int);
  var data_ptr = ref.alloc(ref.types.CString);
  var data_len_ptr = ref.alloc(ref.types.int);
  while(libgrok.grok_match_walk_next(this.grokMatch.ref(), name_ptr, name_len_ptr, data_ptr, data_len_ptr) == grok.status.GROK_OK) {
    var name = name_ptr.deref();
    var nameLen = name_len_ptr.deref();
    var data = data_ptr.deref();
    var dataLen = data_len_ptr.deref();
    arr.push([name.slice(0,nameLen), data.slice(0,dataLen)]);
  }
  libgrok.grok_match_walk_end(this.grokMatch.ref());
  return arr;
}

GrokMatch.prototype.captures = function() {
  if(this._captures == null) {
    this._captures = {};
    var capArr = this.eachCapture();
    for(var capIdx in capArr) {
      var cap = capArr[capIdx];
      var key = cap[0], val = cap[1];
      if(this._captures[key] === undefined) {
        this._captures[key] = [];
      }
      this._captures[key].push(val);
    }
  }
  return this._captures;
}

GrokMatch.prototype.start = function() {
  return this.grokMatch.start;
}

GrokMatch.prototype.end = function() {
  return this.grokMatch.end;
}

GrokMatch.prototype.subject = function() {
  return this.grokMatch.subject;
}

exports.create = function() {
  return new GrokMatch();
}
