const path = require('path')
const Express = require("express");
const BodyParser = require("body-parser");
const UUID = require("uuid");
const multer = require('multer')
const memoryStorage = require('multer').memoryStorage
const chance = require('chance')
const Campaign = require('../models/campaign')
const googleCloudStorage = require('../storage')

require('dotenv').config({
  path: path.join(__dirname, '/.env')
})

var router = Express.Router()

router.use(BodyParser.json());

router.use(BodyParser.urlencoded({ extended: true }));

const m = multer({
  storage: memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb
  }
});

const bucket = googleCloudStorage.bucket(process.env.GCLOUD_STORAGE_BUCKET);





//try to get campaigns, if you have a token, you'll get campaigns by the token, no token you'll get one
router.get("/campaigns/:token", async(req, res) => {
  
//   if(body.token != req.session.token) {
//     req.session.token = UUID.v4();
//     response.send({ id: req.session.token });
// } else {
//   const campaigns = await Campaign.find({token : req.body.token})
//   //send the campaigns based on the token
// }

const campaigns = await Campaign.find({token : req.params.token})
campaigns.forEach(c => {
  c.createdAt = c.createdAt.toLocaleDateString()
  console.log(c.createdAt.toLocaleDateString());
  
  
})
res.send(campaigns)
});

router.post("/campaigns", m.single("file"), async (req, res, next) => {
  // if(req.body.session != req.session.token) {
  //   return res.status(500).send({ message: "The data in the session does not match!" });
  // }
  let filename  = req.file.originalname.trim().replace(/ /g, '-')
  let token = req.session.token
  const blob = bucket.file(filename);
  console.log({body : req.body},{filename});
  
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    }
  });
  blobStream.on("error", err => {
    next(err);
    return;
  });

  blobStream.on("finish", async() => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

    // Make the image public to the web (since we'll be displaying it in browser)
      const campaign = await Campaign.new(req.body.session, req.body.title, publicUrl)
      res.send(campaign)
  });

  blobStream.end(req.file.buffer);
  // let salt = chance.string({length: 7,
  //   pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'});
});

router.delete('/campaigns/:id', async(req, res)=> {
  await Campaign.findByIdAndRemove(req.params.id)
  res.status(201).send('deleted')
})

module.exports = router