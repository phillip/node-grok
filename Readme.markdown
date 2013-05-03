node-grok
====

What is it ?
---

It's a [NodeJS](http://nodejs.org) implementation of [ruby-grok](https://github.com/jordansissel/ruby-grok).

Requires `libgrok` to be installed.

Usage
---

### Installing libgrok
 
Mac OS: `brew install grok`

Debian unstable: `apt-get install libgrok1 libgrok-dev`

Please refer to the [Grok Homepage](https://code.google.com/p/semicomplete/wiki/Grok) for further instructions


### Basic Usage

```javascript
var grok = require('node-grok'); // or require('./lib/grok.js')
matcher = grok.create()
matcher.addPatternsFromFile('./patterns/base')

matcher.compile("%{IP:ip_address} %{WORD:text}")
res = matcher.match("does not match") // false
res = matcher.match("127.0.0.1 home")

res.captures()
{ ip_address: [ '127.0.0.1' ],
  text: [ 'home' ] }
```