const { bytecode } = require("../artifacts/contracts/Forwarder.sol/Forwarder.json")

const main = async () => {
  const total = 50
  const wallet = "0x06f1a5BC43C563c5E899EF2f20275131a38f16D3"
  const initCodeHash = ethers.utils.keccak256(bytecode)
  const signer = process.env.founder1
  let accounts = new Array()
  for (let idx = 0; idx < total; idx++) {
    let salt = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["address", "uint256"], [signer, idx]))
    let forwarderAddr = ethers.utils.getCreate2Address(wallet, salt, initCodeHash)
    accounts.push(forwarderAddr)
  }
  let obj = new Object()
  obj.Accounts = accounts
  let str = JSON.stringify(obj)
  console.log(str)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })