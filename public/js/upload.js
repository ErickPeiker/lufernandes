var bucket = 'lufernandes';
var acceptFileType = /.*/i;
var maxFileSize = 1000000;
var credentialsUrl = '/info-s3';

window.initS3FileUpload = function($fileInput) {
  $fileInput.fileupload({
    acceptFileTypes: acceptFileType,
    maxFileSize: maxFileSize,
    url: 'https://' + bucket + '.s3.amazonaws.com',
    paramName: 'file',
    add: s3add,
    dataType: 'xml',
    done: onS3Done
  });
};

function s3add(e, data) {
  var filename = data.files[0].name;
  var params = [];
  $.ajax({
    url: credentialsUrl,
    type: 'GET',
    dataType: 'json',
    data: {
      filename: filename
    },
    success: function(s3Data) {
      data.formData = s3Data.params;
      data.submit();
    }
  });
  return params;
};

function onS3Done(e, data) {
  var s3Url = $(data.jqXHR.responseXML).find('Location').text();
  var s3Key = $(data.jqXHR.responseXML).find('Key').text();
  console.log(s3Url);
  console.log(s3Key);
};