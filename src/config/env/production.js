const {
  SEEDFI_NODE_ENV,
  SEEDFI_PROD_PORT,
  SEEDFI_PROD_DATABASE_URL
} = process.env;

export default {
  SEEDFI_NODE_ENV,
  SEEDFI_PORT: SEEDFI_PROD_PORT,
  SEEDFI_DATABASE_URL: SEEDFI_PROD_DATABASE_URL
};
