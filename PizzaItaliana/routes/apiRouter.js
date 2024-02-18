const express = require('express')
const router = express.Router()
const path = require("path");

router.get('/data', (req, res) => {
    let filePath = path.join(process.cwd(), 'data_dir', 'data.json');
    res.sendFile(filePath);
});

module.exports = router;