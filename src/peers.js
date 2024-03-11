import dgram from 'dgram';
import { Buffer } from 'buffer';
import { parse as urlParse } from 'url';
import crypto from 'crypto';
import bencode from 'bencode';
import torrentService from './torrentService.js'
import misc from './misc.js'

//reference - https://web.archive.org/web/20170101194115/http://bittorrent.org/beps/bep_0015.html

const sendMessageUDP = (socket, message, rawUrl, callback = () => {}) => {
    const url = urlParse(rawUrl)
    socket.send(message, 0, message.length, url.port, url.host.split(':')[0], callback)
    socket.on("message", (msg) => {
        return msg;
    })
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
    torrentService.infoHash(torrent).copy(buff, 16);
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

const group = (iterable, groupSize) => {
    let groups = [];
    for(let i=0; i<iterable.length; i+=groupSize) {
        groups.push(iterable.slice(i, i+groupSize));
    }
    return groups;
}


const parseAnnouncementResponse = (response) => {
    return {
        action: response.readUInt32BE(0),
        transactionId: response.readUInt32BE(4),
        leechers: response.readUInt32BE(8),
        seeders: response.readUInt32BE(12),
        peers: group(response.slice(20), 6).map(address => {
          return {
            ip: address.slice(0, 4).join('.'),
            port: address.readUInt16BE(4)
          }
        })
      }
}




export default {
    getPeers: (torrent,callback) => {
        const socket = dgram.createSocket('udp4');
        sendMessageUDP(socket, buildConnRequest(), torrent.announce.toString('utf-8'));
        socket.on('message', response => {
            console.log(responseType(response), 'response')
            if(responseType(response) === 'connect') {
                const connResponse = parseConnectionResponse(response);
                if(connResponse.transactionId) {
                    const announcementReq = buildAnnounceRequest(connResponse.connectionId, torrent);
                    sendMessageUDP(socket, announcementReq, torrent.announce.toString('utf-8'))
                }
            }else if(responseType(response) === 'announce') {
                const announceResponse = parseAnnouncementResponse(response);
                callback(announceResponse)
            }        
        })
        socket.on('error', (error) => {
            console.log("some error occurred", error)
        })
    }
}

