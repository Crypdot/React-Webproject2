/**
 * simpleServer.js contains the Rest-api, with functionality of adding posts to the server, as well as adding and fetching comments for individual post's contained within the server.
 * @authors Jarno Kaikkonen & Alexander San Miguel
 */

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
app.use(express.static( __dirname +'/public'));
app.use(bodyParser.urlencoded({ extended: true }));
var type = upload.single('recfile');
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
var util = require('util'); // for async calls
const query = util.promisify(conn.query).bind(conn);
app.get('/blogSite.html', function (req, res) {
  res.sendFile( __dirname + "/" + "blogSite.html" );
})

/**
 * Uploads a post's data to the SQL server. The data includes the title, description and image-data, and is stored with a prepared SQL query for added security.
 * Multer also changes the file name automatically to be different from the uploaded file's name, so this will only add the extension to the randomized name generated by multer initially.
 * The image itself is stored on the server, under the public-folder, while the sent data includes only the path of the image.
 */
app.post('/upload', type, function(req, res){
  console.log("Got an upload request!")
  if(validateImage(req.file.originalname) !== true){target_path="public/InvalidImage.jpg"}
  var tmp_path = req.file.path;
  var target_path = tmp_path+"."+extFile;
  var src = fs.createReadStream(tmp_path);
  var dest = fs.createWriteStream(target_path);
  src.pipe(dest);
  fs.unlink(tmp_path, function(){ console.log("Temp path unlinked!")});
  src.on('end', function(){ console.log("Success!")});
  src.on('error', function(err) { console.log("Failure!")});
  const sql = "INSERT INTO postdata (imagelink, title, description) VALUES(?,?,?)";
  const imglink = target_path;
  const imgtitle = JSON.stringify(encrypt(req.body.postTitle));
  const imgdesc = JSON.stringify(encrypt(req.body.postDescription));

  (async() => {
    try {
      const rows = await query(sql, [imglink, imgtitle, imgdesc]);
      console.log(rows)
    }catch (err) {
      console.log("Error in database!"+ err);
    }
    finally {
      console.log("Upload successful!");
    }
  })()
  res.send("We done!");
})
/**
 * Fetches imagepath, title, description from SQL server and returns JSON.
 */
app.get('/images', function (req, res){
  const sql = "SELECT ID,imagelink, title, description FROM postdata";
  console.log("Got an image request!");
  (async() => {
    try {
      const img = await query(sql);
      decryptImageData(img);
      res.json(img);
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
  const sql = "SELECT DATE_FORMAT(time, \"%Y %M %d %H:%i:%S\") AS time, commentdata from postcomments where postID =?;";
  (async() => {
    try{
      const comments = await query(sql, [postID]);
      decryptComments(comments);
      let string = JSON.stringify(comments);
      res.json(string);
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
app.post('/addcomment', function(req, res){
  const postID = req.query.postID;
  const commentData = JSON.stringify(encrypt(req.query.commentField));
  const sql = "INSERT INTO postcomments (postid, commentdata) VALUES (?,?);";
  (async() =>{
    try{
      const rows = await query(sql, [postID, commentData]);
      console.log(rows);
      let string = JSON.stringify(rows);
      res.json(string);
    }catch(err){console.log("Error in database!"+err)}
    finally{
      console.log("Comment added!")
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
    console.log("Invalid image!");
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