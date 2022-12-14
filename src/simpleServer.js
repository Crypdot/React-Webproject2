require('dotenv').config()
/**
 * simpleServer.js contains the Rest-api, with functionality of adding posts to the server, as well as adding and fetching comments for individual post's contained within the server.
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


var storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, path.resolve(__dirname+'/../public'))
  },
  filename: function (req, file, cb){
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
  }
})
var upload = multer({storage: storage})


const app = new express();
app.use(cors());
app.use(express.json())
app.use(express.static( __dirname +'/public'));
app.use(bodyParser.urlencoded({ extended: true }));

var type = upload.single('file');
var extFile; // Global variable to store extension-name
const mysql = require('mysql');
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "xxxxx",
  database: "webprojekti"
});

conn.connect(function (err) {
  if (err) throw err;
  console.log('Connection established!')
})
var util = require('util');

const secrets = require('../config/secrets.js'); // for async calls
console.log("SHOW"+secrets.jwtSecret)



const query = util.promisify(conn.query).bind(conn);
app.get('/blogSite.html', function (req, res) {
  console.log("Line 55 app get blogsite.html")
  res.sendFile( __dirname + "/" + "blogSite.html" );
})

/**
 * Middleware function to authenticate tokens
 * @param req
 * @param res
 * @param next
 * @returns {this}
 */
function authenticateToken(req, res, next){
  console.log("Got a POST request for the home page")
  const authHeader = req.header('authorization')
  console.log("authHeader -> "+authHeader)
  const token = authHeader && authHeader.split(' ')[1]
  console.log("Token: "+token)
  if(token == null)
    return res.sendStatus(401)

  jwt.verify(token, '$process.env.JWT_SECRET', (err, user) => {
    console.log(err)
    if(err)
      return res.status(403).send("Verification of token fails. Token too old?")

    req.user = user
    console.log("User (decoded) "+JSON.stringify(user))
    next()
  })
}

app.post('/upload-file',authenticateToken, upload.single('dataFile'), (req, res, next)=>{
  const file = req.file

  if(!file){
    return res.status(400).send({message: 'Please upload a file!'})
  }

  (async() => {
    try {
      let username = JSON.stringify(req.user.name.username)
      const results = await query("SELECT * FROM user WHERE username = "+username)
      let userID = results[0].userID
      console.log("Uploader's userID -> "+userID)

      let sql = "INSERT INTO postdata(imagelink, title, description, userID) values(?,?,?,?)"
      const rows = await query(sql, [req.file.filename, req.body.postTitle, req.body.postDescription, userID]);
      console.log("Added rows: "+ JSON.stringify(rows))
    }catch (err) { console.log("Error in database!"+ err); }
    finally {
      console.log("Upload successful!");
      return res.send({message: "File uploaded successfully. ", file})
    }
  })()
})

/**
 * Fetches imagepath, title, description from SQL server and returns JSON.
 */
app.get('/images', function (req, res){
  const sql = "SELECT ID, imagelink, title, description FROM postdata";
  console.log("Got an image request!");
  (async() => {
    try {
      const img = await query(sql);
      res.json(img);
      //decryptImageData(img);

    }catch (err) {
      console.log("Error in database!"+ err);
    }
    finally {
      console.log("Fetch successful!")
    }
  })()
})
/**
 * Gets postID from url and fetches comments that belong to that ID from the database.
 * Date is formatted to YYYY-MM-DD, HH:MM:SS AS time
 */
app.get('/comments', function(req, res){
  const postID = req.query.postID;
  console.log("The post ID number is: "+postID);
  const sql = "SELECT DATE_FORMAT(postcomments.time, \"%Y %M %d %H:%i:%S\") AS time, postcomments.commentdata, user.username \n" +
      "FROM postcomments\n" +
      "INNER JOIN user ON postcomments.userID = user.userID\n" +
      "WHERE postcomments.postdata_ID = ?;";
  (async() => {
    try{
      const comments = await query(sql, [postID]);

      if(comments.length === 0)
        res.status(404).send("No comments found!")

      res.json(comments)
    }catch(err){console.log("Error in database")}
    finally{
      console.log("Fetch successful!")
    }
  })()
})

/**
 * Adds comment to SQL.
 * Gets postID and comment-string from url and sends prepared SQL query to the postcomments table and sends it back so the comment is shown on page right after
 */
app.post('/add-comment', authenticateToken, (req, res) => {
  const postID = req.body.postID;

  (async() =>{
    try{
      let username = JSON.stringify(req.user.name.username)
      const results = await query("SELECT * FROM user WHERE username = "+username)
      let userID = results[0].userID
      console.log("Uploader's userID -> "+userID)

      const sql = "INSERT INTO postcomments (postdata_ID, commentdata, userID) VALUES (?,?,?);";
      const rows = await query(sql, [postID, req.body.commentdata, userID]);
      console.log(rows);
      let string = JSON.stringify(rows);
      return res.json(string);
    }catch(err){console.log("Error in database!"+err)}
    finally{
      console.log("Comment added!")
    }
  })()
})

app.get('/fetch-image', (req, res) => {
  console.log("Got into fetch image!")
  const postID = req.query.postID;
  console.log(postID+"OIASJDOAIJDOI");
  (async() => {
    try{
      const sql = "SELECT imagelink FROM postdata WHERE ID=?"
      let link = await query(sql, [postID])
      console.log(link)

      let postLink = JSON.stringify(link[0].imagelink)
      res.json(postLink)

    }catch(err){console.log("Error -> "+err)}
    finally{
      console.log("Image found!")
    }
  })()
})


var server = app.listen(8081, function (){
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
})

/**
 * validateImage() checks the extension of an uploaded image and checks whether it meets the following criteria for validation:
 * The file must be either a .jpg, .jpeg, .gif or .png
 * @param path - variable is a given path for an image's source.
 * @returns {boolean} - variable is either true - for a valid image, or false, failing validation.
 */
function validateImage(path){
  var fileName = path;
  var id = fileName.lastIndexOf(".")+1;
  extFile = fileName.substr(id, fileName.length).toLowerCase();
  if(extFile==="jpg" || extFile==="jpeg" || extFile==="png" || extFile==="gif"){
    console.log("Valid image!");
    return true;
  }else{
    console.log("Invalid image! Only jpg/jpeg/png/gif-types allowed!");
    return false;
  }
}

/**
 * decryptImageData() is given all the fetched image data from the database, and for each entry it will decrypt both the title and the description of each post
 * @param json - variable is given to function, contains encrypted data
 */
function decryptImageData(json){
  let i;
  for(i in json){
    json[i].title = decrypt(JSON.parse(json[i].title));
    json[i].description = decrypt(JSON.parse(json[i].description));
  }
}
/**
 * decryptComments() is given all the fetched comment data from the database, and for each entry it will decrypt the comments
 * @param json - variable is given to function, contains encrypted data
 */
function decryptComments(json){
  let i;
  for(i in json){
    json[i].commentdata = decrypt(JSON.parse(json[i].commentdata));
  }
}

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

