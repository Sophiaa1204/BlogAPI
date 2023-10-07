const NodeRSA = require('node-rsa')
const fs = require('fs')
const path = require('path')
const privateKey = new NodeRSA(fs.readFileSync(path.join(
  __dirname,
  '../config/privateKey.txt',
), 'utf-8'))

const publicKey = new NodeRSA(fs.readFileSync(path.join(
  __dirname,
  '../public/publicKey.txt',
), 'utf-8'))

console.log(publicKey.encrypt('123456', 'base64'))
