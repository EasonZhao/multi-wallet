async function main() {
  const [deployer] = await ethers.getSigners()
  console.log("Deploying contracts with the account:", deployer.address)
  console.log("Account balance:", (await deployer.getBalance()).toString())

  const WalletContract = await ethers.getContractFactory("WalletSimple")
  const wallet = await WalletContract.deploy([process.env.founder1, process.env.founder2, process.env.founder3])
  await wallet.deployed()
  console.log("wallet address:", wallet.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });