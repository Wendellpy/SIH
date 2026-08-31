import { expect } from "chai";
import { ethers } from "hardhat";

describe("LandLedger", function () {
  let landLedger: any;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const LandLedgerFactory = await ethers.getContractFactory("LandLedger");
    landLedger = await LandLedgerFactory.deploy();
    await landLedger.waitForDeployment();
  });

  it("1. should register property successfully via registerProperty()", async function () {
    const ulpin = "MH13BOM04521873";
    const unitId = "A+03-B302";
    const recordHash = "0x4a1f68285a8647e30d mockRecordHash";
    const geometryHash = "0x89b1c738e412f8a9 mockGeomHash";

    await expect(
      landLedger.connect(owner).registerProperty(ulpin, unitId, recordHash, geometryHash)
    ).to.not.be.reverted;
  });

  it("2. should retrieve registered property details via getProperty()", async function () {
    const ulpin = "MH13BOM04521873";
    const unitId = "A+03-B302";
    const recordHash = "0x4a1f68285a8647e30d mockRecordHash";
    const geometryHash = "0x89b1c738e412f8a9 mockGeomHash";

    await landLedger.connect(owner).registerProperty(ulpin, unitId, recordHash, geometryHash);

    const property = await landLedger.getProperty(ulpin, unitId);

    expect(property[0]).to.equal(ulpin);
    expect(property[1]).to.equal(unitId);
    expect(property[2]).to.equal(recordHash);
    expect(property[3]).to.equal(geometryHash);
    expect(property[4]).to.be.gt(0);
    expect(property[5]).to.equal(owner.address);
  });

  it("3. should emit PropertyRegistered event on registration", async function () {
    const ulpin = "MH13BOM04521873";
    const unitId = "A+03-B302";
    const recordHash = "0x4a1f68285a8647e30d mockRecordHash";
    const geometryHash = "0x89b1c738e412f8a9 mockGeomHash";

    await expect(
      landLedger.connect(addr1).registerProperty(ulpin, unitId, recordHash, geometryHash)
    )
      .to.emit(landLedger, "PropertyRegistered")
      .withArgs(ulpin, unitId, recordHash, geometryHash, (val: any) => val > 0, addr1.address);
  });
});
