/** @type import('hardhat/config').HardhatUserConfig */
require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-web3")

require('dotenv').config()

module.exports = {
  solidity: "0.8.9",
  networks: {
    testnet: {
      url: "https://bsc-testnet.public.blastapi.io",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [process.env.deployer],
    },
  },
};
