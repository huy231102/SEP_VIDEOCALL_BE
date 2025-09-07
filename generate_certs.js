// Node script tự tạo SSL self-signed certs bằng package 'selfsigned'
const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

// Thư mục lưu certs
const certDir = path.join(__dirname, 'certs');
if (!fs.existsSync(certDir)) fs.mkdirSync(certDir);

// Tạo chứng chỉ
const attrs = [{ name: 'commonName', value: 'localhost' }];
// Tạo self-signed certificate với key RSA 4096-bit và subjectAltName gồm localhost và IP cục bộ
const pems = selfsigned.generate(attrs, {
  days: 365,
  keySize: 4096,
  algorithm: 'sha256',
  extensions: [{ name: 'basicConstraints', cA: true }],
  // subjectAltName: DNS và IP cho FE connect qua hostname hoặc IP
  altNames: [
    { type: 2, value: 'localhost' },
    { type: 7, ip: '127.0.0.1' },
    { type: 7, ip: '192.168.0.104' }
  ]
});

// Ghi file
fs.writeFileSync(path.join(certDir, 'key.pem'), pems.private);
fs.writeFileSync(path.join(certDir, 'cert.pem'), pems.cert);

console.log('Đã tạo SSL key và cert tại:');
console.log(' -', path.join(certDir, 'key.pem'));
console.log(' -', path.join(certDir, 'cert.pem'));
