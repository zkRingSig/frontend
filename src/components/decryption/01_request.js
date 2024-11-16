
const { Contract } = require("ethers");
const fs = require("fs");
const path = require("path");
const { signer } = require("../connection.js");
const abi = require("../package/abi/FunctionsConsumer.json");


const Location ={
  Inline: 0,
  Remote: 1,
  DONHosted: 2
};

// sepolia test
const consumerAddress = "0xbc38276Aa222cf14f45449a6A55baeDf164813c7";
const subscriptionId = "1759";


const sendRequest = async () => {
  if (!consumerAddress || !subscriptionId) {
    throw Error("Missing required environment variables.");
  }

  const functionsConsumer = new Contract(consumerAddress, abi, signer);

  const source = fs
    .readFileSync(path.resolve(__dirname, "./source.js"))
    .toString();


  const callbackGasLimit = 300_000;  // 300_000;

  // response: 0x307831393336333033396365306361643636336166633130356532386435643935306632316531356132366637613239616162613532393735656661643236326636307832386363323533353237396364303063393161343465643632623339646663643861626665363562613963353963616665323134343638306430363338363135
  // bytes to string: 0x19363039ce0cad663afc105e28d5d950f21e15a26f7a29aaba52975efad262f60x28cc2535279cd00c91a44ed62b39dfcd8abfe65ba9c59cafe2144680d0638615
  const args = ["0x2d40aebcad9e5d972ebcadbab2986fb550ca2bb846131cfb2f061f19f4a6dd17", "0x0ef2431445ff92190d1115df30c7879746fd8dace6235bb7c3e5612add2b4373"];


  console.log("\n Sending the Request....")
  // const requestTx = await functionsConsumer.sendRequest(
  //   source,
  //   args,
  //   [],
  //   subscriptionId,
  //   callbackGasLimit
  // );



  const encryptedSecretsRef = "0x7383e9ecab75f5b7e21509e90b20ed7a0259489ed4ec0de1aaea6c4d12fd55f40a98b6dc06b51c115ea651fe4a04c82da00f54c75dc44763bde0da4d8ac272c8cf8125833c84c3ef2a38a6e586ccf4d4ed8f41c96c725e00ca240930cb3a1984075d09b9b0c04965330e77a5b9097f928e844b47e65bb137ff77433138d535d198efb402e60ea97c4a33ac14a01168c93d83662b8bbcdcd1e6a560e81092183ab3f6bf15ef33db6fdebf9a6479aa8fc53392f123d2b2ab48ba8a3e7912568f2c4dc64d0cb2ff97381f5d448a26b6b489414d99108c6998581bddc4da6f6c21f60a337930060feb2e7a54d71c1f8203aae0";
  const requestTx = await functionsConsumer.sendRequestWithSecret(
    source,
    Location.Remote, // Location.DONHosted, Location.Remote
    encryptedSecretsRef,
    args,
    [],
    subscriptionId,
    callbackGasLimit
  );

  const txReceipt = await requestTx.wait(1);
 
  console.log(
    `Request made.  TxHash is ${requestTx.hash}`
  );
  
  console.log("");

};

sendRequest().catch(err => {
  console.log("\nError making the Functions Request : ", err);
});

