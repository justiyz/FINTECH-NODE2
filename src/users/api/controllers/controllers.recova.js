import {processAnyData, processNoneData} from "../services/services.db";
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';


/**
 * update user device fcm token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the users updated fcm token
 * @memberof UserController
 */
export const fetchLoanDueAmount = async (req, res, next) => {
  try {
    const { params: {loan_reference}, loanDetails} = req;
    const data = {
      loanReference: loan_reference,
      amountDue: loanDetails.total_outstanding_amount
    };
    return ApiResponse.json(res, enums.LOAN_DUE_AMOUNT_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_LOAN_DUE_AMOUNT_CONTROLLER;
    logger.error(`Fetch loan due amount failed::${ enums.UPDATE_USER_FCM_TOKEN_CONTROLLER }`, error.message);
    return next(error);
  }
};
