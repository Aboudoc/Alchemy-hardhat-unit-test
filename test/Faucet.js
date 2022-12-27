const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
// require("@nomiclabs/hardhat-ethers");

describe("Faucet", function () {
  async function deployContractAndSetVariables() {
    let deposit = ethers.utils.parseUnits("1", "ether");
    const Faucet = await ethers.getContractFactory("Faucet");
    const faucet = await Faucet.deploy({ value: deposit });
    // const faucet = await Faucet.deploy();

    const [owner, hacker] = await ethers.getSigners();
    let withdrawAmount = ethers.utils.parseUnits("1", "ether");

    console.log("Signer 1 address: ", owner.address);
    return { faucet, owner, hacker, withdrawAmount };
  }

  it("should deploy and set the owner correctly", async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

    expect(await faucet.owner()).to.equal(owner.address);
  });

  it("should not allow withdrawal above 0.1 ETH", async function () {
    const { faucet, withdrawAmount } = await loadFixture(
      deployContractAndSetVariables
    );

    await expect(faucet.withdraw(withdrawAmount)).to.be.reverted;
  });

  it("only the owner should withdraw all", async function () {
    const { faucet, hacker } = await loadFixture(deployContractAndSetVariables);

    await expect(faucet.connect(hacker).withdrawAll()).to.be.reverted;
  });

  it("only the owner should destroy the faucet", async function () {
    const { faucet, hacker } = await loadFixture(deployContractAndSetVariables);

    await expect(faucet.connect(hacker).destroyFaucet()).to.be.reverted;
  });

  it("destruct the contract when the owner call destroyFaucet", async function () {
    const { faucet } = await loadFixture(deployContractAndSetVariables);

    let provider = ethers.getDefaultProvider();
    await faucet.destroyFaucet();

    expect(await provider.getCode(faucet.address)).to.equal("0x");
  });

  it("should return funds to the owner when selfdestruct is called", async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

    // getBalance is a function of the Ether.js blockchain provider object
    let provider = ethers.getDefaultProvider();
    const balanceBefore = await faucet.provider.getBalance(owner.address);
    const balanceContract = await faucet.provider.getBalance(faucet.address);

    await faucet.destroyFaucet();

    const balanceAfter = await faucet.provider.getBalance(owner.address);

    expect(balanceAfter.toString() > balanceBefore.toString()).to.be.true;
  });
});
