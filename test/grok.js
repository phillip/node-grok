var assert = require("assert");

describe("Grok", function(){
  it("readme example works", function(){
    var grok = require("../lib/grok.js");
    matcher = grok.create();
    matcher.addPatternsFromFile('./patterns/base');

    matcher.compile("%{IP:ip_address} %{WORD:text}");
    res = matcher.match("does not match");
    assert.equal(res, false);
    res = matcher.match("127.0.0.1 home");
    assert.deepEqual(res.captures(), { ip_address: [ '127.0.0.1' ], text: [ 'home' ] });
  })
})
