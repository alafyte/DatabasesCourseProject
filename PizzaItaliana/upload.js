const multer = require('multer');
const path = require("path");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const storage_disk = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public', 'images'))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + file.originalname;
        cb(null, uniqueSuffix)
    }
})

const upload_disk = multer({ storage: storage_disk })

exports.upload = upload;
exports.upload_disk = upload_disk;
exports.upload_path =  path.join('/', 'images');