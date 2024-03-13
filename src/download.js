import net from 'net';
import { Buffer } from 'buffer'
import tracker from './peers.js'

const download = torrent => {
    tracker.getPeers(torrent, peers => {
        console.log(peers)
        peers.forEach((peer) => downloadFromPeers(peer))
    })
}


const downloadFromPeers = (peer) => {
    const socket = net.Socket();
    socket.on('error', (err) => {
        console.log('this error occurring',err)
    });
    socket.connect(peer.port, peer.ip, () => {
        console.log('socket connected')
    })
    socket.on('data', data => {
        console.log(data)
    })
}


export default download

