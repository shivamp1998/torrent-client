import bencode from 'bencode';
import fs from 'fs';
import crypto from 'crypto';

const conv = num => [
    (num >> 24) & 255,
    (num >> 16) & 255,
    (num >> 8) & 255,
    num & 255,
];


export default {
    open: (filePath) => {
        return bencode.decode(fs.readFileSync(filePath), 'Uint8Array')
    },
    infoHash: (torrent) => {   
        const info = bencode.encode(torrent.info);
        return crypto.createHash('sha1').update(info).digest()
    },
    size: (torrent) => {
        const size = torrent.info.files ? torrent.info.files.reduce((size, curr) => size + curr.length) : torrent.info.length;
        return Buffer.from(conv(size));
    }
}