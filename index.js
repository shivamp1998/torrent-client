import bencode from 'bencode';
import fs from 'fs';
import url from 'url';
import dgram from 'dgram';
import peers from './peers.js'
const file = fs.readFileSync('./TorrentFiles/newspaper.torrent')
const torrent = bencode.decode(file, 'Uint8Array');



peers.getPeers(torrent, () => {
    console.log('got peers')
})  