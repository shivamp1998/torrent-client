import bencode from 'bencode';
import fs from 'fs';
import url from 'url';
import dgram from 'dgram';
import peers from './peers.js'
import torrentService from './torrentService.js';
const torrent = torrentService.open('./TorrentFiles/newspaper.torrent');

console.log(torrentService.size(torrent))


setInterval(() => {    
    peers.getPeers(torrent, () => {
        console.log('got peers')
    })
}, 1000)