var express = require('express');
var router = express.Router();

var accessKey = 'Azure_Blob_Storage_AccessKey'; //azure blob 스토리지 접근 키
var storageAccount = 'Azure_Blob_Storage_Account'; //azure blob 스토리지 계정이름

var multiparty = require('multiparty');
var bodyParser = require('body-parser');
var azure = require('azure-storage');
var request = require('request');
var blobService = azure.createBlobService(storageAccount, accessKey);

/*
  Azure_Blob_Storage_AccessKey, Azure_Blob_Storage_Account, Azure_Blob_Storage_container 설정해주세요.
*/

router.post('/findCelebrity', function (req, res) {
  var filetype;
  var blobName;
  var form = new multiparty.Form();
  form.on('part', function(part){
    if(part.filename && Number(part.byteCount) < 2048000){
      blobName =  part.filename;
      filetype = getExtensionOfFilename(part.filename);
      blobService.createBlockBlobFromStream('Azure_Blob_Storage_container', blobName, part, part.byteCount, function(error, result, response){
        if(error){
          throw error;
        }
        else{
          res.redirect('/result?filetype='+ filetype +'&filename='+ blobName +'');
        }
      });
    } else{
      part.resume();
      res.send('에러 발생 - 사진 용량/형식을 확인하세요.');
    }
  });

  form.parse(req);

});

function getExtensionOfFilename(filename) {
	var _fileLen = filename.length;
    /**
	  * lastIndexOf('.')
	  * 뒤에서부터 '.'의 위치를 찾기위한 함수
	  * 검색 문자의 위치를 반환한다.
	  * 파일 이름에 '.'이 포함되는 경우가 있기 때문에 lastIndexOf() 사용
	  */
	var _lastDot = filename.lastIndexOf('.')+1;
	// 확장자 명만 추출한 후 소문자로 변경
	var _fileExt = filename.substring(_lastDot, _fileLen).toLowerCase();
	return _fileExt;
}
module.exports = router;
