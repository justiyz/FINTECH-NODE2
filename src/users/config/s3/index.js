import AWS from 'aws-sdk';
import config from '../index';

AWS.config.update({
  region: config.SEEDFI_AMAZON_S3_BUCKET_REGION,
  accessKeyId: config.SEEDFI_AMAZON_S3_ACCESS_KEY_ID,
  secretAccessKey: config.SEEDFI_AMAZON_S3_SECRET_ACCESS_KEY,
  signatureVersion: 'v4'
});

export default AWS;
