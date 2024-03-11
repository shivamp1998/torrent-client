import peers from './src/peers.js'
import torrentService from './src/torrentService.js';
const torrent = torrentService.open('./TorrentFiles/newspaper.torrent');


const interval = setInterval(() => {    
    peers.getPeers(torrent,(peers) => {
        console.log('got peers',peers)
        clearInterval(interval)
    })
}, 1000)