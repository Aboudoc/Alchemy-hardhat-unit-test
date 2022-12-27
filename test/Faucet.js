const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Faucet", function () {
  async function deployContractAndSetVariables() {
    const Faucet = await ethers.getContractFactory("Faucet");
    const faucet = await Faucet.deploy();

    const [owner, hacker] = await ethers.getSigners();
    let withdrawAmount = ethers.utils.parseUnits("0.01", "ether");

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
});
