import { devEnv, prodEnv, testEnv } from './env/index';

const { SEEDFI_NODE_ENV } = process.env;

const config = SEEDFI_NODE_ENV === 'development' ? devEnv
  : SEEDFI_NODE_ENV === 'production' ? prodEnv
    : testEnv;

export default config;
