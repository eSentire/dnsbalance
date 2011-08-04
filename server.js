/*
Copyright 2011 Timothy J Fontaine <tjfontaine@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN

*/

var dnode = require('dnode')
var fs = require('fs')
var path = require('path')
var util = require('util')
var winston = require('winston')

winston.remove(winston.transports.Console)
winston.add(winston.transports.Console, { colorize: true })

var dnsbalance = require('./lib/dnsbalance')

var srv = new dnsbalance.DNSBalance(5353)
srv.loadZones("./zones")

var rpc = new dnode({
  setLoad: function(domain, resource, node, load) {
    wintston.info('set load: ' + [domain, resource, node, load].join(', '))
    srv.getZone(domain).getResource(resource).getNode(node).load = load
  },
  setTTL: function(domain, resource, ttl) {
    winston.info('set ttl: ' + [domain, resource, ttl].join(', '))
    srv.getZone(domain).getResource(resource)['ttl'] = ttl
  },
})
rpc.listen(5454)

srv.on('zoneChanged', function(zone) {
  winston.info('serailizing zone: ' + zone.name)
  var o = zone.toObject()
  //winston.info(util.inspect(o))
  fs.writeFile(
    path.join('./zones', zone.name),
    JSON.stringify(o, null, 2)
  )
})
