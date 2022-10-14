const fs = require('fs');
// eslint-disable-next-line import/no-extraneous-dependencies
require('@nomiclabs/hardhat-waffle');

//const privatekey = fs.readFileSync('.secret').toString().trim();

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },

  },
  solidity: '0.8.4',
};

