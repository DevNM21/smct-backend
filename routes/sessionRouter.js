const Express = require("express");
const UUID = require("uuid");
var router = Express.Router();


router.get("/session", (req, res, next) => {
  const sess =req.session 
  sess.token = UUID.v4();
  console.log(11, sess);
  
  res.send({ id: sess.token });
});


module.exports = router