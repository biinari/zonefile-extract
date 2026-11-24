// CONFIG BEGIN
var defaultTTL = 14400;
// CONFIG END


var table = document.getElementsByClassName('sg_table');
var rows = table.getElementsByTagName('tr');
var i, len, row;
var hostname, type, priority, ttl, destination;
var output = '';
