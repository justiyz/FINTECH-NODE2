import 'dotenv/config';
import config from '../../config';

import { v2 as cloudinary } from 'cloudinary';
const { SEEDFI_CLOUDINARY_API_SECRET, SEEDFI_CLOUDINARY_CLOUD_NAME, SEEDFI_CLOUDINARY_API_KEY} = config;

cloudinary.config({
    cloud_name: SEEDFI_CLOUDINARY_CLOUD_NAME,
    api_key: SEEDFI_CLOUDINARY_API_KEY,
    api_secret: SEEDFI_CLOUDINARY_API_SECRET
});

export { cloudinary }
