var express = require('express');
var fs = require('fs');
var multer  = require('multer');
var util = require('util');
var AWS = require('aws-sdk');
var app = express();
var util = require('util');

var port = process.env.PORT || 8081 ;

app.use(express.static('public'));

AWS.config.loadFromPath('./config.json');
var bucketPath = 'elasticbeanstalk-us-west-2-053008413216';
 AWS.config.update({
 region: "us-west-2"
 });


var pictures = new AWS.S3({params: {Bucket: bucketPath}});
var upload = multer().single('file');

app.post('/data',upload, function(req,res){
  var key = 'data/' + req.file.originalname.toString();
  pictures.upload({
            ACL: 'public-read', 
            Body: req.file.buffer, 
            Key: key,
            ContentType: 'application/octet-stream' // force download if it's accessed as a top location
        }).send(function(err,data) {      
      if(err) {
        return res.end(err);
      }
      res.end('<html><body align="center" bgcolor="#66CEFF"><h1> Good job!</h1><img src="http://m.memegen.com/mlysve.jpg"/></body></html>');
    });
});


app.get('/',function(req,res){
  var stringBuilder = fs.readFileSync(__dirname + "/index.html", 'utf8');
  var thumbnailsBuilder = '';

  pictures.listObjects({Prefix: 'thumbnails/'}, function(err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      for (var i=1; i<data.Contents.length; i++) {
        var thumbnailPath = 'https://s3-us-west-2.amazonaws.com/elasticbeanstalk-us-west-2-053008413216/' + data.Contents[i].Key;
        thumbnailsBuilder += '<img src="' + thumbnailPath + '"/>'
      }
      stringBuilder = stringBuilder.replace('REPLACE-IMAGES',thumbnailsBuilder);
      res.end(stringBuilder);
    }
  });
});


app.listen(port, function () {
  console.log('Listening on port ' + port);
});
