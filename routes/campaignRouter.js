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



router.get("/session", (req, res, next) => {
  const sess =req.session 
  sess.token = UUID.v4();
  console.log(11, sess);
  
  res.send({ id: sess.token });
});


router.post("/session", (request, response, next) => {
  if(request.body.session != request.session.token) {
      return response.status(500).send({ message: "The data in the session does not match!" });
  }
  response.send({ message: "Success!" });
});



//try to get campaigns, if you have a token, you'll get campaigns by the token, no token you'll get one
router.get("/campaigns", async(req, res) => {
  const body = req.body
  if(body.token != req.session.token) {
    req.session.token = UUID.v4();
    response.send({ id: req.session.token });
} else {
  const campaigns = await Campaign.find({token : req.body.token})
  //send the campaigns based on the token
}
});

router.post("/campaigns", m.single("file"), async (req, res, next) => {
  var sess = req.session
  console.log(22, {sess});
  
  console.log(req.body.session, sess.token);
  
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

  blobStream.on("finish", () => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

    // Make the image public to the web (since we'll be displaying it in browser)
    blob.makePublic().then(() => {
      res.status(200).send(`Success!\n Image uploaded to ${publicUrl}`);
    });
  });

  const campaign = await Campaign.new(req.body.session || 'no', req.body.title, filename)
  blobStream.end(req.file.buffer);

  console.log(campaign);
  res.send(campaign)
  

  // let salt = chance.string({length: 7,
  //   pool: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'});
  res.send({ message: "Success!" });
});

module.exports = router