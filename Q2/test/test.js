const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
  if (typeof o == "string" && /^[0-9]+$/.test(o)) {
    return BigInt(o);
  } else if (typeof o == "string" && /^0x[0-9a-fA-F]+$/.test(o)) {
    return BigInt(o);
  } else if (Array.isArray(o)) {
    return o.map(unstringifyBigInts);
  } else if (typeof o == "object") {
    if (o === null) return null;
    const res = {};
    const keys = Object.keys(o);
    keys.forEach((k) => {
      res[k] = unstringifyBigInts(o[k]);
    });
    return res;
  } else {
    return o;
  }
}

describe("HelloWorld", function () {
  let Verifier;
  let verifier;

  beforeEach(async function () {
    Verifier = await ethers.getContractFactory("HelloWorldVerifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Should return true for correct proof", async function () {
    //[assignment] Add comments to explain what each line is doing
    //runs HelloWorld contract with inputs equal to 1 and 2
    const { proof, publicSignals } = await groth16.fullProve(
      { a: "1", b: "2" },
      "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm",
      "contracts/circuits/HelloWorld/circuit_final.zkey"
    );

    //prints the publicSignal (the output)
    console.log("1x2 =", publicSignals[0]);

    //converts the output to a string
    const editedPublicSignals = unstringifyBigInts(publicSignals);

    //converts the proof to a string
    const editedProof = unstringifyBigInts(proof);

    //exports calldata of solidity into a variable
    const calldata = await groth16.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    );

    //splits calldata to be managed better later
    const argv = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x) => BigInt(x).toString());

    //recomposes calldata in an input to be read by verifier contract
    const a = [argv[0], argv[1]];
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const Input = argv.slice(8);

    //runs the verifier contract with the inputs and expects the output to be true
    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
  });
  it("Should return false for invalid proof", async function () {
    let a = [0, 0];
    let b = [
      [0, 0],
      [0, 0],
    ];
    let c = [0, 0];
    let d = [0];
    expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
  });
});

describe("Multiplier3 with Groth16", function () {
  let Verifier;
  let verifier;

  beforeEach(async function () {
    //[assignment] insert your script here
    Verifier = await ethers.getContractFactory("Multiplier3Verifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Should return true for correct proof", async function () {
    //[assignment] insert your script here
    const { proof, publicSignals } = await groth16.fullProve(
      { a: "1", b: "2", c: "4" },
      "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm",
      "contracts/circuits/Multiplier3/circuit_final.zkey"
    );

    //prints the publicSignal (the output)
    console.log("1x2 =", publicSignals[0]);
    console.log("1x2x4 =", publicSignals[1]);

    //converts the output to a string
    const editedPublicSignals = unstringifyBigInts(publicSignals);

    //converts the proof to a string
    const editedProof = unstringifyBigInts(proof);

    //exports calldata of solidity into a variable
    const calldata = await groth16.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    );

    //splits calldata to be managed better later
    const argv = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x) => BigInt(x).toString());

    //recomposes calldata in an input to be read by verifier contract
    const a = [argv[0], argv[1]];
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const Input = argv.slice(8);

    //runs the verifier contract with the inputs and expects the output to be true
    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
  });
  it("Should return false for invalid proof", async function () {
    //[assignment] insert your script here
    let a = [0, 0];
    let b = [
      [0, 0],
      [0, 0],
    ];
    let c = [0, 0];
    let d = [0];
    expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
  });
});

describe("Multiplier3 with PLONK", function () {
  let Verifier;
  let verifier;

  beforeEach(async function () {
    //[assignment] insert your script here
    Verifier = await ethers.getContractFactory("PlonkVerifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("Should return true for correct proof", async function () {
    //[assignment] insert your script here
    const { proof, publicSignals } = await plonk.fullProve(
      { a: "1", b: "2", c: "4" },
      "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm",
      "contracts/circuits/Multiplier3_plonk/circuit_final.zkey"
    );

    //prints the publicSignal (the output)
    console.log("1x2 =", publicSignals[0]);
    console.log("1x2x4 =", publicSignals[1]);

    //converts the output to a string
    const editedPublicSignals = unstringifyBigInts(publicSignals);

    //converts the proof to a string
    const editedProof = unstringifyBigInts(proof);

    //exports calldata of solidity into a variable
    const calldata = await plonk.exportSolidityCallData(
      editedProof,
      editedPublicSignals
    );

    //splits calldata to be managed better later
    const argv = calldata.split(",")

    //runs the verifier contract with the inputs and expects the output to be true
    expect(await verifier.verifyProof(argv[0], editedPublicSignals)).to.be.true;
  });
  it("Should return false for invalid proof", async function () {
    //[assignment] insert your script here
      let a = [1, 2];
    let d = [9];
    expect(await verifier.verifyProof(a, d)).to.be.false;
  });
});
