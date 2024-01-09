import bencode from 'bencode';
import fs from 'fs';
import crypto from 'crypto';
export default {
    open: () => {
        return bencode.decode(fs.readFileSync('./TorrentFiles/newspaper.torrent'))
    },
    infoHash: (torrent) => {    
        const info = bencode.decode(torrent.info);
        return crypto.createHash('sha1').update(info).digest()
    },
    size: (torrent) => {

    }
}