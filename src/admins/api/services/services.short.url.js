const axios = require('axios');
import config from '../../../users/config';
const apiKey = config.SEEDFI_FIREBASE_DYNAMIC_LINK_PRIVATE_KEY;

export const createShortLink = async(data) => {
  const clusterId = data.cluster_id;
  const referralCode = data.admin_id;
  const uniqueClusterCode = data.unique_code;

  const link = `${config.SEEDFI_DOMAIN_URL_PREFIX}/?id=${clusterId}&ref=${referralCode}&code=${uniqueClusterCode}`; 

  const payload = {
    dynamicLinkInfo: {
      domainUriPrefix: config.SEEDFI_DOMAIN_URL_PREFIX,
      link: link,
      androidInfo: {
        androidPackageName: config.SEEDFI_ANDROID_PACKAGE_NAME
      },
      iosInfo: {
        iosBundleId: config.SEEDFI_IOS_BUNDLE_ID
      }
    }
  };
  try {
    const response = await axios.post(`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${apiKey}`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data.shortLink;
  } catch (error) {
    logger.error('Error: ', error.message);
  }
};
