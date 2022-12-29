// test/RiskControl.test.js
// Load dependencies
const { expect, util } = require('chai')
const eth_util = require('ethereumjs-util')
const {keccak256} = require('@ethersproject/keccak256')

describe('WalletSimple', function () {
  let deployer
  let signer1
  let signer2
  let signer3
  let user
  let test
  let usdt
  let wallet
  const USDTDecimals = 6
  let mintAmount
  let ForwarderContract

  beforeEach(async function () {
    [deployer, signer1, signer2, signer3, user, test] = await ethers.getSigners()

    const ERC20Contract = await ethers.getContractFactory("TestToken")
    usdt = await ERC20Contract.deploy("USDT", "usdt", USDTDecimals)
    await usdt.deployed()
    mintAmount = ethers.utils.parseUnits('100000000', USDTDecimals)
    await usdt.mint(user.address, mintAmount)

    const WalletSimpleContract = await ethers.getContractFactory("WalletSimple")
    wallet = await WalletSimpleContract.deploy([signer1.address, signer2.address, signer3.address])
    await wallet.deployed()

    ForwarderContract = await ethers.getContractFactory("Forwarder")
  })

  describe('public member variables', function () {
    it('immutable', async function () {
      expect(await usdt.decimals()).to.equal(USDTDecimals)
      expect(await usdt.balanceOf(user.address)).to.equal(mintAmount)
    })
  })

  describe('flushForwarderTokens ( address, address )', function () {
    it('success', async function () {
      let idx = 0
      let tx = await wallet.connect(signer1).createForwarder(idx)
      const receipt = await tx.wait();
      const evt = receipt.events[receipt.events.length - 1];
      
      let forwarderAddr = evt.args[0]
      let amount = ethers.utils.parseUnits('999', USDTDecimals)
      tx = await usdt.connect(user).transfer(forwarderAddr, amount)
      tx.wait()

      tx = await wallet.connect(signer1).flushForwarderTokens(forwarderAddr, usdt.address)
      tx.wait()
      expect(await usdt.balanceOf(wallet.address)).to.equal(amount)
    })
  })

  describe('sendMultiSigToken(address, uint, address, bytes calldata, uint, uint, bytes calldata)', function () {
    it('success', async function () {
      let amount = ethers.utils.parseUnits('999', USDTDecimals)
      let tx = await usdt.connect(user).transfer(wallet.address, amount)
      tx.wait()
      expect(await usdt.balanceOf(wallet.address)).to.equal(amount)

      tx = await wallet.connect(signer1).activateSafeMode()
      tx.wait()

      const bestBlock = await ethers.provider.getBlock()
      let tokenPrefix = 'ERC20'
      let expireTime = bestBlock.timestamp + 60
      let sequenceId = await wallet.getNextSequenceId()
      let toAddress = signer3.address
      const operationHash = ethers.utils.solidityKeccak256(['string', 'address', 'uint', 'address', 'uint', 'uint'], [tokenPrefix, toAddress, amount, usdt.address, expireTime, sequenceId]) 

      let flatSig = await signer2.signMessage(ethers.utils.arrayify(operationHash))
      let sig = ethers.utils.arrayify(flatSig)

      await wallet.connect(signer1).sendMultiSigToken(toAddress, amount, usdt.address, expireTime, sequenceId, sig)
      expect(await usdt.balanceOf(toAddress)).to.equal(amount)
    })
  })

  // describe('createForwarder ( uint256 )', function () {
  //   it('success', async function () {
  //     let forwarderAddr = "0x0ecb65994620b246ea9C9E41378A615ef63FeAC5"
  //     let idx = 0
  //     await expect(
  //       wallet.connect(signer1).createForwarder(idx)
  //     ).to.emit(wallet, 'CreateForwarder')
  //       .withArgs(forwarderAddr, signer1.address, idx)
  //   })
  // })
})
