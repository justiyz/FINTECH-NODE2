import AWS from '../../../users/config/s3';
import config from '../../../users/config';

const options = {
  signatureVersion: 'v4',
  maxRetries: 3,
  paramValidation: true
};

const S3 = new AWS.S3(options);

export const uploadFile = (Key, Body, type) => {
  const params = {
    Bucket: `${config.SEEDFI_AMAZON_S3_BUCKET}`,
    Key,
    Body,
    ACL: 'public-read',
    ContentType: type
  };
  const upload = S3.upload(params);
  return upload.promise();
};

export const uploadImage = (Key, Body, type) => {
  const params = {
    Bucket: 'your-bucket-name',
    Key: 'path-to-your-image.jpg',
    ACL: 'public-read'
  };
  S3.putObjectAcl(params, (err, data) => {
    if (err) {
      console.log('Error setting object ACL:', err);
    } else {
      console.log('Object ACL set to public-read');
    }
  });
};
