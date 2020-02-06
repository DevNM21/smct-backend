const Storage = require("@google-cloud/storage").Storage
const path = require('path')
require('dotenv').config({
  path: path.join(__dirname, '/.env')
})
const googleCloudStorage = new Storage({
  projectId: process.env.GCLOUD_STORAGE_BUCKET,
  keyFilename: process.env.GCLOUD_KEY_FILE
});

module.exports = googleCloudStorage