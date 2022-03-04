require('dotenv').config()
/**
 * CURRENT ISSUES -> Currently, the usernames and emails aren't stored very securely. They're just plain text, but that's just a matter of implementing it, honestly.
 * authServer.js contains an API-interface that allows users to sign up and log in as needed to access various services.
 * @author Alexander San Miguel
 */
const jwt = require('jsonwebtoken')
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer  = require('multer');
const crypto = require('crypto');
const key = "hxvywuahdjrduhwjgdmraykjfhzqoihk";
const iv = crypto.randomBytes(16);
const secrets = require('../config/secrets.js')
console.log('show='+secrets.jwtSecret)
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
const bcrypt = require('bcrypt');


const query = util.promisify(conn.query).bind(conn);
app.get('/blogSite.html', function (req, res) {
  console.log("Line 55 app get blogsite.html")
  res.sendFile( __dirname + "/" + "blogSite.html" );
})

//Currently doesn't check if the user name already exists. Should probably convert username to lowercase and compare it against all the ones found in the database. Already dies this for emails so it shouldn't be difficult.
app.post('/signup', urlencodedParser, (req, res) =>{
  let email, password, username

  console.log("Got this email -> "+req.body.email+" and this password -> "+req.body.password+" and this username -> "+req.body.username);

  if(req.body.username.length===0 || req.body.email.length===0 || req.body.password.length ===0){
    return res.status(408).send("One or more empty fields!")
  }

  (async() =>{
    try{
      email = req.body.email
      username = req.body.username
      const hashedPassword = await bcrypt.hash(req.body.password, 10)

      let sqlTest = "SELECT username, email FROM user"
      let testResult = await query(sqlTest)
      console.log("The test gave us -> "+testResult[0].email.toLowerCase())

      if(!checkUserValidity(testResult, email, username)){
        console.log("Invalid username!")
        return res.status(203).send("Duplicate entry!")
      }

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
        res.status(201).send("User added: "+username).send("User added!")
      }
    }catch(e){
      console.log("Error in SIGNUP -> "+e)
    }
  })()
})

function checkUserValidity(result, email, username){
  let comparableName = username.toLowerCase();
  let comparableEmail = email.toLowerCase();

  (async() =>{
    try{
      let sql = "SELECT username, email from user"
      let result = await query(sql)
      console.log(result)

      for(let i = 0; i < result.length; i++){
        console.log("Comparing "+comparableName+" to "+result[i].username.toLowerCase()+" and "+comparableEmail+" to "+result[i].email.toLowerCase())
        if(comparableName === result[i].username.toLowerCase() || comparableEmail === result[i].email.toLowerCase()){
          console.log("This already exists!")
          return false;
        }
      }
      return true
    }catch(e){
      console.log("Something went wrong -> "+e)
    }
  })()
}


function checkUsername(username) {
  let comparable = username.toLowerCase();
  (async() =>{
    try{
      let sql = "SELECT username, email from user"
      let result = await query(sql)
      console.log(result)

      for(let i = 0; i < result.length; i++){
        console.log("Comparing "+comparable+" to "+result[i].username.toLowerCase())
        if(comparable === result[i].username.toLowerCase()){
          console.log("This already exists!")
          return false;
        }
      }
      return true
    }catch(e){
      console.log("Something went wrong -> "+e)
    }
  })()
}


app.post('/login', (req, res) =>{
  console.log("Username given to auth server -> "+req.body.username+" and password given to auth server - >"+req.body.password);
  (async() => {
    try{
      let sql = "SELECT * FROM user WHERE username = ?"
      let result = await query(sql, [req.body.username])

      if(result.length === 0){
        console.log("Username not found")
        return res.status(402).send("Username not found!")}

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
        const accessToken = jwt.sign({name: user}, '$process.env.JWT_SECRET', {
          expiresIn: "30m"
        })
        res.status(202).json({accessToken: accessToken})
        //res.json({accessToken: accessToken})
      }else{
        console.log("Password was incorrect!")
        return res.status(401).send("Password incorrect") }
    }catch(e){
      console.log("Error in LOGIN -> "+e)
    }
  })()
})

function generateAccessToken(user){
  console.log("FUNCTION generateAccessToken")
  return jwt.sign({name: user}, secrets.jwtSecret, { expiresIn: "30m" })
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