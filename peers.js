import dgram from 'dgram';
import { Buffer } from 'buffer';
import { parse as urlParse } from 'url';
import crypto from 'crypto';
import bencode from 'bencode';
import torrentService from './torrentService.js'
import misc from './misc.js'
const sendMessageUDP = (socket, message, rawUrl, callback = () => {}) => {
    const url = urlParse(rawUrl)
    socket.send(message, 0, message.length, url.port, url.host.split(':')[0], callback)
    console.log('message sent')
}

const buildConnRequest = () => {
    const buff = Buffer.alloc(16);
    buff.writeUInt32BE(0x417, 0);
    buff.writeUInt32BE(0x27101980, 4);
    buff.writeUInt32BE(0, 8);
    crypto.randomBytes(4).copy(buff,12);
    return buff;
}

const buildAnnounceRequest = (connId, torrent, port = 6881) => {
    const buff = Buffer.allocUnsafe(98);
    connId.copy(buff, 0);
    buff.writeUInt32BE(1, 8);
    crypto.randomBytes(4).copy(buff, 12);
    torrentService.infoHash(torrent).copy(buf, 16);
    misc.genId().copy(buff, 36);
    Buffer.alloc(8).copy(buff, 56);
    torrentService.size(torrent).copy(buff, 64);
    Buffer.alloc(8).copy(buff, 72);
    buff.writeUInt32BE(0, 80);
    buff.writeUInt32BE(0, 80);
    crypto.randomBytes(4).copy(buff, 88);
    buff.writeInt32BE(-1, 92);
    buff.writeInt16BE(port, 96);
    return buff;    
}

const responseType = (response) => {
    const action = response.readUInt32BE(0);
    if(action === 0) return 'connect';
    if(action === 1) return 'announce'
}

const parseConnectionResponse = (response) => {
    return {
        action: response.readUInt32BE(0),
        transactionId: response.readUInt32BE(4),
        connectionId: response.slice(8)
    }
}




export default {
    getPeers: (torrent, callback) => {
        const socket = dgram.createSocket('udp4');
        sendMessageUDP(socket, buildConnRequest(), torrent.announce.toString('utf-8'));
        socket.on('message', response => {
            console.log('any response came', responseType(response))
            if(responseType(response) === 'connect') {
                const connResponse = parseConnectionResponse(response);
                
            }else if(responseType(response) === 'announce') {
                const announceResponse = parseAnnouncementResponse(response);
                callback(announceResponse.peers)
            }        
        })
        socket.on('error', (error) => {
            console.log("some error occurred", error)
        })
    }
}

