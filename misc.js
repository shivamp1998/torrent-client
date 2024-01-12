import crypto from 'crypto';


let id = null;

export default {
    genId: () => {
        if(!id) {
            id = crypto.randomBytes(20);
            Buffer.from('-AT001-').copy(id, 0)
        }
        return id;
    }
}