import path from 'path';
import crypto from 'crypto';
import multer from 'multer';

const fileDirectory = path.resolve(__dirname, '..', '..', 'tmp');

export default {
    directory: fileDirectory,
    storage: multer.diskStorage({
        destination: fileDirectory,
        filename(request, file, callback) {
            const filehash = crypto.randomBytes(10).toString('hex');
            const filename = `${filehash}-${file.originalname}`;

            return callback(null, filename);
        }
    })
}