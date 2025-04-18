import { db } from '../../config/db';

/**
 * Process db.any calls to the database
 * @param {String} query - The request from the endpoint.
 * @param {Array} payload - The response returned by the method.
 * @returns { Promise<JSON> } - A Promise response with the queried data or no data
 * @memberof UserPostgresDbService
 */
export const processAnyData = (query, payload) =>  db.any(query, payload);

/**
 * Process db.oneOrNone calls to the database
 * @param {String} query - The request from the endpoint.
 * @returns { Promise<JSON> } - A Promise response with the queried data or no data
 * @memberof UserPostgresDbService
 */
export const processOneOrNoneData = (query, payload) => db.oneOrNone(query, payload);

/**
 * Process db.none calls to the database
 * @param {String} query - The request from the endpoint.
 * @param {Array} payload - The response returned by the method.
 * @returns { Promise<JSON> } - no queried value
 * @memberof UserPostgresDbService
 */
export const processNoneData = (query, payload) => db.none(query, payload);
