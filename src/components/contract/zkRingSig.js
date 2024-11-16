import * as snarkjs from "snarkjs";
import { utils } from "ffjavascript";
import { buildBabyjub, buildPedersenHash } from "circomlibjs";
import merkleTree from "fixed-merkle-tree";
import { utf8ArrayToStr } from "./functions";

const MERKLE_TREE_HEIGHT = 10;
const NUM = 32;
const wasmFile_deposit = "./src/components/zk/deposit.wasm";
const zkeyFile_deposit = "./src/components/zk/deposit.zkey";
const wasmFile_withdraw = "./src/components/zk/withdraw.wasm";
const zkeyFile_withdraw = "./src/components/zk/withdraw.zkey";



// bytes 0x010f20(input as string "0x010f20") => Uint8Array(3) [ 1, 15, 32 ]
function byteStrToUint8Array (str) {
  str = str.replaceAll("0x", "");
  let length = str.length;
  if (length % 2 == 1) throw Error("Invalid string input1");
  /*
  0:48
  9:57

  A:65
  F:70

  a:97
  f:102

  */
  for (let i = 0; i < length; i++) {
    let num = str[i].charCodeAt();
    if (num < 48 || num > 57 && num < 65 || num > 70 && num < 97 || num > 102) throw Error("Invalid string input2");
  }

  let uint8Array = new Uint8Array(length / 2);

  let j = 0;
  for (let i = 0; i < length; i = i + 2) {
    let subStr = str.slice(i, i + 2);
    uint8Array[j++] = parseInt(subStr, 16);
  }
  return uint8Array;
}


// Uint8Array([ 1, 15, 32 ]) => bytes 0x010f20(output as string "0x010f20")
var uint8ArrayToByteStr = function (uint8Array) {
  let str = "";
  for (let i = 0; i < uint8Array.length; i++) {
    let _hex;
    if (uint8Array[i] <= 15) {
      _hex = "0" + uint8Array[i].toString(16);
    } else {
      _hex = uint8Array[i].toString(16);
    }
    str = str + _hex;

  }
  return "0x" + str;
}


// x % p
function bigIntMod (x, p) {
  if (p == 0n) {
    // console.log(p);
    throw Error("bigIntMod error");
  }
  if (p > 0n) {
    if (x < 0n) x = x + (-x * p);
    return x % p;
  }
  if (p < 0n) {
    if (x > 0n) x = x - (-x * p);
    return x % p;
  }
}

// x / p
function bigIntDiv (x, p) {
  if (p == 0n) throw Error("bigIntDiv error");
  if (p > 0n) {
    if (x < 0n) {
      let y = bigIntMod(x, p);
      x = x - y;
    };
    return x / p;
  }
  if (p < 0n) {
    if (x > 0n) {
      let y = bigIntMod(x, p);
      x = x - y;
    };
    return x / p;
  }
}

function extendedEuclideanAlgorithm (a, b) {
  /*
  Returns a three-tuple (gcd, x, y) such that
  a * x + b * y == gcd, where gcd is the greatest
  common divisor of a and b.
 
  This function implements the extended Euclidean
  algorithm and runs in O(log b) in the worst case.
  */
  let [s, old_s] = [0n, 1n];
  let [t, old_t] = [1n, 0n];
  let [r, old_r] = [b, a];

  while (r != 0n) {
    // let quotient = old_r / r;  // BigInt的整除
    let quotient = bigIntDiv(old_r, r);  // BigInt的整除
    [old_r, r] = [r, old_r - quotient * r];
    [old_s, s] = [s, old_s - quotient * s];
    [old_t, t] = [t, old_t - quotient * t];
  }

  return [old_r, old_s, old_t];
}

// console.log(extendedEuclideanAlgorithm(1234n, 1234567n));  // [ 1n, -37017n, 37n ]
// console.log(1234n - 1234567n);


function inverseOf (n, p) {
  /*
  Returns the multiplicative inverse of
  n modulo p.
 
  This function returns an integer m such that
  (n * m) % p == 1.
 
  */

  let [gcd, x, y] = extendedEuclideanAlgorithm(n, p);

  // assert (n * x + p * y) % p == gcd
  // if((n * x + p * y) % p !== gcd) throw Error("gcd error");
  if (bigIntMod((n * x + p * y), p) !== gcd) throw Error("gcd error");

  if (gcd !== 1n) {
    // # Either n is 0, or p is not a prime number.
    // raise ValueError(
    //     '{} has no multiplicative inverse '
    //     'modulo {}'.format(n, p))
    throw Error("no multiplicative inverse");
  } else {
    return bigIntMod(x, p);
  }
}
// console.log(inverseOf(1234n, 1234567n));  // 1197550n



function gcd (a, b) {
  if (b == 0n) return a;
  else {
    return gcd(b, bigIntMod(a, b));
  }
}

// console.log(gcd(-8n, 6n))


class CurveBabyJubJub {
  constructor() {
    // Curve parameters
    // E: 168700x^2 + y^2 = 1 + 168696x^2y^2
    this.A = 168700n;
    this.D = 168696n;
    this.Q = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
    this.Base = [995203441582195749578291179787384436505546430278305826713579947235728471134n, 5472060717959818805561601436314318772137091100104008585924551046643952123905n];
    this.Base8 = [5299619240641551281634865583518297030282874472190772894086521144482721001553n, 16950150798460657717958625567821834550301663161624707787222815936182638968203n];
  }

  check_on_curve (point) {
    /**
     * Check if a given point is on the curve
     * (168700x^2 + y^2) - (1 + 168696x^2y^2) == 0
     */
    // if (bigIntMod((point[0] ** 3n + this.a * point[0] + this.b - point[1] ** 2n), this.p) === 0n) return true;
    // else return false;
    let _x = point[0];
    let _y = point[1];
    let xSq = bigIntMod(_x * _x, this.Q);
    let ySq = bigIntMod(_y * _y, this.Q);
    let lhs = bigIntMod(this.A * xSq + ySq, this.Q);
    let rhs = bigIntMod(1n + this.D * xSq * ySq, this.Q);
    return bigIntMod(lhs - rhs, this.Q) == 0n;
  }

  scalarMulFixBASE8 (n) {
    let _x1 = 5299619240641551281634865583518297030282874472190772894086521144482721001553n;
    let _y1 = 16950150798460657717958625567821834550301663161624707787222815936182638968203n;
    return this.scalarMulAny(n, [_x1, _y1]);
  }

  scalarMulAny (n, P) {
    if (this.check_on_curve(P) === false) throw Error("scalarMulAny Error");

    let _x1 = P[0];
    let _y1 = P[1];

    let remaining = n;

    let px = _x1;
    let py = _y1;
    let ax = 0n;
    let ay = 0n;

    while (remaining != 0n) {
      if ((remaining & 1n) != 0n) {
        // Binary digit is 1 so add
        [ax, ay] = this.add([ax, ay], [px, py]);
      }

      [px, py] = this.add([px, py], [px, py]);

      remaining = remaining / 2n;
    }

    return [ax, ay];
  }


  add (P1, P2) {
    let _x1 = P1[0];
    let _y1 = P1[1];
    let _x2 = P2[0];
    let _y2 = P2[1];

    if (_x1 == 0 && _y1 == 0) {
      return [_x2, _y2];
    }

    if (_x2 == 0 && _y1 == 0) {
      return [_x1, _y1];
    }

    let x1x2 = bigIntMod(_x1 * _x2, this.Q);
    let y1y2 = bigIntMod(_y1 * _y2, this.Q);
    let dx1x2y1y2 = bigIntMod(this.D * x1x2 * y1y2, this.Q);
    let x3Num = bigIntMod(_x1 * _y2 + _y1 * _x2, this.Q);
    let y3Num = bigIntMod(y1y2 - this.A * x1x2, this.Q);

    let x3 = bigIntMod(x3Num * inverseOf(1n + dx1x2y1y2, this.Q), this.Q);
    let y3 = bigIntMod(y3Num * inverseOf(1n - dx1x2y1y2, this.Q), this.Q);
    return [x3, y3];
  }


}












function generateRandomHexBytes (length = 32) {
  const randomBytes = new Uint8Array(length);
  window.crypto.getRandomValues(randomBytes);
  return randomBytes;
}

const rbigint = (nbytes) => utils.leBuff2int(generateRandomHexBytes(nbytes));

const perdersenHash = async (data) => {
  const babyJup = await buildBabyjub();
  const perdersen = await buildPedersenHash();
  return babyJup.F.toObject(babyJup.unpackPoint(perdersen.hash(data))[0]);
};

const toHex = (number, length = 32) =>
  "0x" +
  (number instanceof Buffer
    ? number.toString("hex")
    : BigInt(number).toString(16)
  ).padStart(length * 2, "0");






async function generateMerkleProof (contract, deposit, commitments) {
  // get constract state
  // const eventFilter = contract.filters.Deposit();
  // let events = await contract.queryFilter(eventFilter, -100, "latest");
  // // console.log(events);
  // // create merkle tree
  // const leaves = events
  //   .sort((a, b) => a.args.leafIndex - b.args.leafIndex)
  //   .map((e) => e.args.commitment);
  const leaves = commitments;

  const tree = new merkleTree(MERKLE_TREE_HEIGHT, leaves);
  // generate path
  // let depositEvent = events.find(
  //   (e) => e.args.commitment === toHex(deposit.commitment)
  // );
  // let leafIndex = depositEvent ? depositEvent.args.leafIndex : -1;

  let leafIndex = -1;
  for (let i = 0; i < commitments.length; i++) {
    // console.log(commitments[i]);
    // console.log(toHex(deposit.commitment));
    if (commitments[i] == toHex(deposit.commitment)) leafIndex = i;
  }

  if (leafIndex == -1) {
    alert("The deposit is not found in the tree");
  }

  const { pathElements, pathIndices } = tree.path(leafIndex);
  return { pathElements, pathIndices, root: tree.root() };
}




function toSolidityProof (proof) {
  const flatProof = utils.unstringifyBigInts([
    proof.pi_a[0],
    proof.pi_a[1],
    proof.pi_b[0][1],
    proof.pi_b[0][0],
    proof.pi_b[1][1],
    proof.pi_b[1][0],
    proof.pi_c[0],
    proof.pi_c[1],
  ]);
  const result = {
    proof: "0x" + flatProof.map((x) => toHex(x, 32).slice(2, 66)).join(""),
  };
  return result;
}



async function generateSnarkProof_deposit (deposit) {

  // groth16
  const inputs = {
    // public signals
    // unkown privatekey point H
    S: [BigInt("11956206273172976588849604143238823558114836218641936603514727596464677556633"), BigInt("11560884593607702626218260308732086781907519001377422958857365922539830828295")],

    // private signals
    secret: deposit.secret
  };

  console.log("inputs", inputs);

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inputs,
    wasmFile_deposit,
    zkeyFile_deposit
  );

  console.log("proof");
  console.log(proof);
  // console.log("publicSignals");
  // console.log(publicSignals);

  // console.log(toHex(inputs.S[0]), toHex(inputs.S[1]))

  const proofData = toSolidityProof(proof)
  const args = [
    toHex(BigInt(publicSignals[0])),  // kG_Hash
    [toHex(BigInt(publicSignals[1])), toHex(BigInt(publicSignals[2]))],  // kS
    [toHex(BigInt(publicSignals[3])), toHex(BigInt(publicSignals[4]))]   // S
    // ["0x07fe3752ea61492f9ed97c4093e43e8a0d8b930d772b0d8e3bccdedb366c195d", "0x11d46139c8fe80275d778be081996118d436d304c194d7a2b2a886570a18c20c"]
  ]
  return { proof: proofData.proof, args }
}


async function generateSnarkProof_withdraw (contract, deposit, recipient, commitments) {
  // geneate merkle proof
  const { pathElements, pathIndices, root } = await generateMerkleProof(
    contract,
    deposit,
    commitments
  );

  // console.log("root", root);
  // console.log("root", toHex(root));

  // rootlist,  only for test
  let rootList = [];
  rootList.push(root);
  for (let i = 1; i < NUM; i++) {
    rootList.push(root);
  }
  // console.log(rootList.length);

  // console.log("rootList", rootList);
  // console.log("pathElements", pathElements);

  // groth16
  const inputs = {
    // public signals
    rootList: rootList,
    // multi-sig supervisor address base point G
    E: [BigInt("14231464567587334110725661069232030606644409982773819778672427387682249660806"), BigInt("21471194291989132796077342379631293078979938952276276785637382826166545872378")],
    recipient: BigInt(recipient),
    relayer: BigInt(recipient) - 1n,
    fee: 2n,
    refund: 1n,

    // private signals
    root: root,
    rootPowerIndex: 2n ** 0n,
    secret: deposit.secret,
    pathElements: pathElements,
    pathIndices: pathIndices
  };

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inputs,
    wasmFile_withdraw,
    zkeyFile_withdraw
  );

  // console.log("proof");
  // console.log(proof);
  // console.log("publicSignals");
  // console.log(publicSignals);
  // console.log(typeof(publicSignals[0]));  // string

  // console.log(toHex(inputs.S[0]), toHex(inputs.S[1]))

  /*
    kH_Hash:    publicSignals[0]
    kE:         publicSignals[1], publicSignals[2]
    rootList:   publicSignals[3]~[66]
    E:          publicSignals[67], publicSignals[68]
    recipient:  publicSignals[69]
    relayer:    publicSignals[70]
    fee:        publicSignals[71]
    refund:     publicSignals[72]
  */

  let publicSignals_uint = [];
  for (let i = 0; i < 41; i++) {
    publicSignals_uint.push(BigInt(publicSignals[i]));
  }

  const proofData = toSolidityProof(proof)
  const args = publicSignals_uint;
  return { proof: proofData.proof, args }
}







async function createDepost (secret) {
  // geneate commitment and nullifierhash
  let deposit = { secret };

  let myCurve = new CurveBabyJubJub();
  let publicKey = myCurve.scalarMulFixBASE8(secret);

  console.log(secret);
  console.log(publicKey);

  let publicKey31 = [bigIntMod(publicKey[0], 2n ** 248n), bigIntMod(publicKey[1], 2n ** 248n)];

  // let publicKeyPreimage = Buffer.concat([
  //     utils.leInt2Buff(publicKey31[0], 31),
  //     utils.leInt2Buff(publicKey31[1], 31),
  //     ]);
  // deposit.commitment = perdersenHash(publicKeyPreimage);
  // deposit.preimage = Buffer.concat([
  //     utils.leInt2Buff(deposit.secret, 31)
  //     ]);


  let publicKey31_Hex = toHex(BigInt(uint8ArrayToByteStr(utils.leInt2Buff(publicKey31[0], 31))), 31)
    + toHex(BigInt(uint8ArrayToByteStr(utils.leInt2Buff(publicKey31[1], 31))), 31).replaceAll("0x", "");
  let uint8Array = byteStrToUint8Array(publicKey31_Hex);
  deposit.commitment = await perdersenHash(uint8Array);

  // console.log("perdersenHash Buffer.concat");
  // console.log(perdersenHash(Buffer.concat([
  //       utils.leInt2Buff(publicKey31[0], 31),
  //       utils.leInt2Buff(publicKey31[1], 31),
  //       ])));
  // console.log("perdersenHash(uint8Array)", perdersenHash(uint8Array));




  deposit.preimage = toHex(deposit.secret, 31);

  console.log("createDepost deposit.secret", toHex(deposit.secret, 31));
  console.log("createDepost deposit.commitment", toHex(deposit.commitment, 31));
  console.log("createDepost deposit.secret", deposit.secret);
  console.log("createDepost deposit.commitment", deposit.commitment);

  return deposit;
}





// Deposit
export async function deposit () {

  let deposit = await createDepost(rbigint(31));
  // // send tx
  // const tx = await contract.deposit(toHex(deposit.commitment), {
  //   value: ethers.utils.parseUnits("1", "ether"),
  // });

  // await tx.wait();
  // console.log(`tx hash ${tx.hash}`);

  // generate proof
  const { proof, args } = await generateSnarkProof_deposit(deposit);
  const note = `zkRingSig-eth-0.001-31337-${toHex(deposit.preimage, 31)}`;
  return { note, proof, args };

  // send deposit tx
  // console.log("...args", ...args)
  // const tx = await contract.deposit(proof, ...args, {
  //   value: ethers.utils.parseUnits("0.001", "ether")
  // });
  // await tx.wait();
  // console.log(`tx hash ${tx.hash}`)


  // return note;

  // // parse note
  // let deposit = parseNote(note);
  // console.log(toHex(deposit.commitment));
  // // generate proof
  // const {proof, args} = await generateSnarkProof(deposit, recipient);
  // // send withdraw tx
  // const tx = await contract.withdraw(proof, ...args);
  // await tx.wait();
  // console.log(`tx hash ${tx.hash}`)




  // let deposit = await createDepost(rbigint(31), rbigint(31));
  // const note = `zkRingSig-eth-1-1-${toHex(deposit.preimage, 62)}`;
  // return { note, commitment: toHex(deposit.commitment) };
}





// Withdraw

async function parseNote (noteString) {
  const noteRegex =
    /zkRingSig-eth-0.001-(?<chainId>\d+)-0x(?<note>[0-9a-fA-F]{62})/g;
  const match = noteRegex.exec(noteString);

  // const buf = Buffer.from(match.groups.note, "hex");
  // const secret = utils.leBuff2int(buf.slice(0, 31));

  const secret = BigInt("0x" + match.groups.note);
  return await createDepost(secret);
}



async function check_kH_Hash (secret) {
  console.log();
  console.log("check_kH_Hash");
  let myCurve = new CurveBabyJubJub();
  let H = [6735765341259699143139827009349789187539604393960868243100492584654517940357n, 1445652303469103813662583567528138751416053152308969014699137575678043505465n];
  let publicKey = myCurve.scalarMulAny(secret, H);

  console.log("publicKey", publicKey);

  let publicKey31 = [bigIntMod(publicKey[0], 2n ** 248n), bigIntMod(publicKey[1], 2n ** 248n)];

  console.log("publicKey31", publicKey31);

  // let publicKeyPreimage = Buffer.concat([
  //     utils.leInt2Buff(publicKey31[0], 31),
  //     utils.leInt2Buff(publicKey31[1], 31),
  //     ]);
  // let kH_Hash = perdersenHash(publicKeyPreimage);


  let publicKey31_Hex = toHex(BigInt(uint8ArrayToByteStr(utils.leInt2Buff(publicKey31[0], 31))), 31)
    + toHex(BigInt(uint8ArrayToByteStr(utils.leInt2Buff(publicKey31[1], 31))), 31).replaceAll("0x", "");
  let uint8Array = byteStrToUint8Array(publicKey31_Hex);
  let kH_Hash = perdersenHash(uint8Array);


  console.log("kH_Hash", kH_Hash);
}













export async function withdraw (contract, note, recipient) {

  // parse note
  let deposit = await parseNote(note);
  // console.log(toHex(deposit.secret));
  const commitments = await contract.getCommitments();
  // generate proof
  const { proof, args } = await generateSnarkProof_withdraw(contract, deposit, recipient, commitments);
  // send withdraw tx
  // const tx = await contract.withdraw(proof, args);
  // await tx.wait();
  // console.log(`tx hash ${tx.hash}`)
  // check_kH_Hash(deposit.secret);

  let H = [6735765341259699143139827009349789187539604393960868243100492584654517940357n, 1445652303469103813662583567528138751416053152308969014699137575678043505465n];  // unkown privkey


  let myCurve = new CurveBabyJubJub();
  let kH = myCurve.scalarMulAny(deposit.secret, H);
  let kH_str = toHex(kH[0], 32) + toHex(kH[1], 32);
  return { proof, args,  kH_str };




  // parse note
  // let deposit = await parseNote(note);
  // console.log(toHex(deposit.commitment));
  // generate proof
  // const { proof, args } = await generateSnarkProof(
  //   contract,
  //   deposit,
  //   recipient
  // );
  // return { proof, args };
}
