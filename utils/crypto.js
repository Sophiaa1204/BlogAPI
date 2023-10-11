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

module.exports = {
  encryptByPublicKey: (str) => publicKey.encrypt(str, 'base64'),
  isSame: (strA, strB) => {
    return privateKey.decrypt(
      strA,
      'base64',
    ) === privateKey.decrypt(strB, 'base64')
  },
}
