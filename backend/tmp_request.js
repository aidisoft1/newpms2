const http = require('http');
http.get('http://127.0.0.1:4000/health', res => {
  let d=''; res.on('data', c => d += c);
  res.on('end', () => { console.log('STATUS', res.statusCode); console.log(d) })
}).on('error', e => { console.error('ERR', e.message); process.exit(1) })
