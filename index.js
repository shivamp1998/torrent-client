import peers from "./src/peers.js";
import torrentService from "./src/torrentService.js";
import download from "./src/download.js";
const torrent = torrentService.open("./TorrentFiles/check.torrent");

download(torrent);
