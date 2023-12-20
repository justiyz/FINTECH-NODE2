import {processAnyData, processNoneData, processOneOrNoneData} from "../services/services.db";
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import loanMandateQueries from '../queries/queries.recova';


/**
 * update user device fcm token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the users updated fcm token
 * @memberof RecovaController
 */
export const fetchLoanDueAmount = async (req, res, next) => {
  try {
    const {loanDetails} = req;
    const data = {
      loanReference: loanDetails.loan_id,
      amountDue: loanDetails.total_outstanding_amount
    };
    return ApiResponse.json(res, enums.LOAN_DUE_AMOUNT_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_LOAN_DUE_AMOUNT_CONTROLLER;
    logger.error(`Fetch loan due amount failed::${ enums.FETCH_LOAN_DUE_AMOUNT_CONTROLLER }`, error.message);
    return next(error);
  }
};

/**
 * update user device fcm token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the users updated fcm token
 * @memberof RecovaController
 */
export const handleMandateCreated = async (req, res, next) => {
  try {
    const {body: {institutionCode}, loanDetails} = req;
    const data = [
      loanDetails.loan_id,
      institutionCode
    ];
    await processOneOrNoneData(loanMandateQueries.createLoanMandate, data);
    return ApiResponse.json(res, enums.MANDATE_CREATED_SUCCESSFULLY, enums.HTTP_OK, {});
  } catch (error) {
    error.label = enums.HANDLE_MANDATE_CREATED_CONTROLLER;
    logger.error(`Handle mandate created failed::${ enums.HANDLE_MANDATE_CREATED_CONTROLLER }`, error.message);
    return next(error);
  }
};
