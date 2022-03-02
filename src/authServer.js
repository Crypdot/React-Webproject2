require('dotenv').config()
/**
 * CURRENT ISSUES -> Currently, the usernames and emails aren't stored very securely. They're just plain text, but that's just a matter of implementing it, honestly.
 * authServer.js contains an API-interface that allows users to sign up and log in as needed to access various services.
 * @authors Jarno Kaikkonen & Alexander San Miguel
 */

const jwt = require('jsonwebtoken')
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const url = require('url');
const bodyParser = require('body-parser');
const multer  = require('multer');
const path = require('path');
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = "hxvywuahdjrduhwjgdmraykjfhzqoihk";
const iv = crypto.randomBytes(16);
var upload = multer({dest:'public/'});
const app = new express();
app.use(cors());
app.use(express.json())
app.use(express.static( __dirname +'/public'));
app.use(bodyParser.urlencoded({ extended: true }));

var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // for reading JSON

app.use(function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
})

const mysql = require('mysql');
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "xxxxx",
  database: "webprojekti"
});

conn.connect(function (err) {
  if (err) throw err;
  console.log('AUTHSERVER - > Connection established!')
})

var util = require('util');
const bcrypt = require('bcrypt'); // for async calls
const query = util.promisify(conn.query).bind(conn);
app.get('/blogSite.html', function (req, res) {
  console.log("Line 55 app get blogsite.html")
  res.sendFile( __dirname + "/" + "blogSite.html" );
})

app.post('/signup', urlencodedParser, (req, res) =>{
  let email, password, username
  console.log("Got this email -> "+req.body.email+" and this password -> "+req.body.password);

  (async() =>{
    try{
      email = req.body.email
      username = req.body.username
      const hashedPassword = await bcrypt.hash(req.body.password, 10)

      let sql = "SELECT * FROM user WHERE email = ?"
      let result = await query(sql, [email])

      if(result.length !== 0){
        console.log("Email exists already!")
        res.sendStatus(202)
      }else{
        console.log("Email doesn't exist, adding user!")
        password = hashedPassword//Is there a point to doing it like this or am I just really tired?
        console.log("Hashed: ", password)

        sql = "INSERT INTO user (email, username, password) VALUES (?, ?, ?)"
        result = await query(sql, [email, username, password])
        res.status(201).send("User added: "+username)
      }
    }catch(e){
      console.log("Error in SIGNUP -> "+e)
    }
  })()
})

app.post('/login', (req, res) =>{
  let username = req.body.username;

  (async() => {
    try{
      let sql = "SELECT * FROM user WHERE username = ?"
      let result = await query(sql, [username])

      if(result.length === 0){res.status(404).send("Username not found!")}

      console.log("Username: "+req.body.username+" found, checking for a match now, against the password: "+req.body.password)
      let foundHashed = (result[0].password).toString()
      console.log("foundHashed: "+foundHashed)
      const match = await bcrypt.compare(req.body.password, result[0].password)

      if(match){
        console.log("Login OK, generating access token!")
        let user = {
          username: req.body.username,
          password: foundHashed
        }
        const accessToken = generateAccessToken(user)
        res.json({accessToken: accessToken})
      }else{ res.send("Password incorrect") }
    }catch(e){
      console.log("Error in LOGIN -> "+e)
    }
  })()
})

function generateAccessToken(user){
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10m" })
}

var server = app.listen(8082, function (){
  var host = server.address().address;
  var port = server.address().port;
  console.log("Authentication server listening at http://%s:%s", host, port);
})


/**
 * encrypt() is given any string to encrypt. It will create an iv (initialization vector) to initialize the state of the encrypted data, before applying the cipher to the string
 * @param text - variable is given, to be encrypted
 * @returns {iv: string, encryptedData: string} - JSON that contains the iv and the encrypted data
 */
function encrypt(text) {
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

/**
 * decrypt() is given any encrypted text in a JSON format. These must contain the variables for the data's IV, as well as the data itself, to be successfully decrypted
 * @param text - variable is given, to be decrypted
 * @returns decrypted - a string variable, decrypted form of the text variable
 */
function decrypt(text) {
  let iv = Buffer.from(text.iv, 'hex');
  let encryptedText = Buffer.from(text.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}