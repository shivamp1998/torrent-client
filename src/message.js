import { Buffer } from 'Buffer'
import torrentService from './torrentService'
import util from './misc'

export const handleHandshake = (torrent) => {
    const buf = Buffer.alloc(68);
    buf.writeUInt8(19,0);
    buf.write('BitTorrent protocol',1);
    buf.writeUINT32BE(0, 20);
    buf.writeUINT32BE(0,24);
    torrentService.infoHash(torrent).copy(buf, 28);
    buf.write(util.genId());
    return buf;
}


export const buildKeepAlive = () => Buffer.alloc(4);

export const buildChoke = () => {
    const buf = Buffer.alloc(5);
    buf.writeUInt32BE(1, 0);
    buf.writeUInt8(0, 4);
    return buf;
  };

