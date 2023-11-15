import dayjs from 'dayjs';
import shopQueries from '../queries/queries.shop';
import { processAnyData } from '../services/services.db';
import enums from '../../lib/enums';
import ApiResponse from '../../lib/http/lib.http.responses';
export const checkIfShopCategoryExists = async(req, res, next) => {
  const { params: body, user} = req;
  try {
    const [ existingCategory ] = await processAnyData(shopQueries.getShopDetails, [ body.shop_category_id?.trim().toLowerCase() ]);
    logger.info(`${enums.CURRENT_TIME_STAMP} ${body.shop_category_id}:::Info: checked if shop exists in the db getShopDetails.shopMiddlewares.shop.js`);
    if (existingCategory) {
      return ApiResponse.success(res, enums.SHOP_CATEGORY_EXIST(body.shop_category_name));
    }

  } catch (error) {

  }
};
