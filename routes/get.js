var express = require('express');
var fs = require('fs');
var request = require('request');
var azure = require('azure-storage');
var urlencode = require('urlencode');
var client_id = 'Naver_Clinet_ID'; //네이버 개발자 센터에서 등록한 애플리케이션의 클라이언트 ID
var client_secret = 'Naver_Client_Secret'; //네이버 개발자 센터에서 등록한 애플리케이션의 클라이언트 비밀번호
var accessKey = 'Azure_Blob_Storage_AccessKey'; //azure blob 스토리지 접근 키
var storageAccount = 'Azure_Blob_Storage_Account'; //azure blob 스토리지 계정이름
var blobService = azure.createBlobService(storageAccount, accessKey);
var router = express.Router();

/*
  Naver_Clinet_ID, Naver_Client_Secret, Azure_Blob_Storage_AccessKey, Azure_Blob_Storage_Account, Azure_Blob_Storage_container 설정해주세요.
*/

router.get('/', function (req, res) {
  res.render('index');
});

router.get('/result', function (req, res) {
  var tmp;
  var seleb, encodeSeleb, confidence;
  if(req.query.filetype == 'jpeg'){
    tmp = 'a.jpeg';
  } else if(req.query.filetype == 'JPG'){
    tmp = 'b.JPG';
  } else if(req.query.filetype == 'jpg'){
    tmp = 'c.jpg';
  } else if(req.query.filetype == 'png'){
    tmp = 'd.png';
  } else{
    return res.send('Error발생 - 업로드하신 파일 확장자를 확인하세요.');
  }
  var api_url = 'https://openapi.naver.com/v1/vision/celebrity'; //닮은 연예인 찾아주는 api주소
  //var api_url = 'https://openapi.naver.com/v1/vision/face'; //얼굴감지 및 분석 api주소
  blobService.getBlobToStream('Azure_Blob_Storage_container', req.query.filename, fs.createWriteStream(tmp), function(error, result, response){
    if(!error){

      var _formData = {
        image:'image',
        image: fs.createReadStream(tmp)
      };
      request.post({url:api_url, formData:_formData, headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}}, function optionalCallback(err, httpResponse, body) {
        if (!error && httpResponse.statusCode == 200) {
          var dataStr = JSON.parse(body);
          if(dataStr.info.faceCount == 0){
            seleb =  null;
            encodeSeleb = null;
            confidence = null;
          } else{
            seleb =  dataStr.faces[0].celebrity.value;
            encodeSeleb = urlencode(dataStr.faces[0].celebrity.value);
            confidence = 100*Number(dataStr.faces[0].celebrity.confidence);
          }
          res.render('result',{ howMany: dataStr.info.faceCount, who: seleb, encodeWho: encodeSeleb, confidence: confidence, src: req.query.filename,});
        } else{
          return res.send('Error발생 - 잠시후 다시 시도해 주세요.');
        }
      });
    }
  });
});


module.exports = router;
