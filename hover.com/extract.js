// CONFIG BEGIN
var defaultTTL = 14400;
// CONFIG END

var table = document.getElementsByClassName('table-body')[0];
var rows = table.getElementsByClassName('table-row');
var i, len, row;
var hostname, type, priority, ttl, destination;
var output = '';

output += '$TTL ' + defaultTTL + '\n'; // start with default TTL

for (i = 0, len = rows.length; i < len; i++) {
  row = rows[i];
  hostname = row.getElementsByClassName('name')[0].innerText;
  type = row.getElementsByClassName('type')[0].innerText;
  ttl = row.getElementsByClassName('ttl')[0].innerText;
  destination = row.getElementsByClassName('content')[0].innerText;
  
  // convert TTL minutes to regular seconds
  ttl = ttl.replace ( /[^\d.]/g, '' );
  ttl = ttl * 60;

  output += [hostname, ttl, 'IN', type, destination].join(' ') + '\n';
}

console.log(output);
