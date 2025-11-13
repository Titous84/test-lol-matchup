export default {
  spec_dir: 'src',
  spec_files: ['tests/**/*.spec.ts'],
  helpers: [],
  env: {
    stopSpecOnExpectationFailure: false,
    random: true,
    forbidDuplicateNames: true,
  },
  requires: ['ts-node/register'],
  stopSpecOnExpectationFailure: false,
  random: false,
};
