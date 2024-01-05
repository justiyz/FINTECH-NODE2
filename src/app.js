import express from 'express';
import 'dotenv/config';
import config from './users/config/index';
import enums from './users/lib/enums/index';
import expressConfig from './users/config/express/index';
import crypto from 'crypto';

const port = config.SEEDFI_PORT || 8080;
const app = express();
expressConfig(app);

// const hash = crypto.createHmac('sha512', 'sk_test_db3c7dc6fdfba13511d5ff95c068ce798066341b').update(JSON.stringify({
//     "event": "transfer.success",
//     "data": {
//       "amount": 10000,
//       "currency": "NGN",
//       "domain": "test",
//       "failures": null,
//       "id": 37272792,
//       "integration": {
//         "id": 463433,
//         "is_live": true,
//         "business_name": "Boom Boom Industries NG"
//       },
//       "reason": "Have fun...",
//       "reference": "0MkT7GRQDzbpKUX2rsA7",
//       "source": "balance",
//       "source_details": null,
//       "status": "success",
//       "titan_code": null,
//       "transfer_code": "TRF_wpl1dem4967avzm",
//       "transferred_at": null,
//       "recipient": {
//         "active": true,
//         "currency": "NGN",
//         "description": "",
//         "domain": "test",
//         "email": null,
//         "id": 8690817,
//         "integration": 463433,
//         "metadata": null,
//         "name": "ELVIS SUNDAY ONOBO",
//         "recipient_code": "RCP_z8yuj7yy8rjghta",
//         "type": "nuban",
//         "is_deleted": false,
//         "details": {
//           "account_number": "0000000000",
//           "account_name": null,
//           "bank_code": "011",
//           "bank_name": "First Bank of Nigeria"
//         },
//         "created_at": "2020-09-03T12:11:25.000Z",
//         "updated_at": "2020-09-03T12:11:25.000Z"
//       },
//       "session": {
//         "provider": null,
//         "id": null
//       },
//       "created_at": "2020-10-26T12:28:57.000Z",
//       "updated_at": "2020-10-26T12:28:57.000Z"
//     }
//   })).digest('hex');
// console.log({ hash })

app.listen(port);
logger.info(`${enums.CURRENT_TIME_STAMP} Application started on port ${port}`);

export default app;
