// const { ethers } = require("hardhat");
const ethers = require("ethers");
const { signer } = require("../connection.js");
const abi= require("../package/abi/FunctionsConsumer.json");

// sepolia testnet
const consumerAddress = "0xbc38276Aa222cf14f45449a6A55baeDf164813c7";

const readResponse = async() => {
  
  const functionsConsumer =  new ethers.Contract(consumerAddress, abi, signer); 
  
  const s_lastRequestId = await functionsConsumer.s_lastRequestId();
  const s_lastResponse = await functionsConsumer.s_lastResponse();
  const s_lastError = await functionsConsumer.s_lastError();
  
  console.log("s_lastRequestId: ", s_lastRequestId);
  console.log("s_lastResponse: ", s_lastResponse);
  console.log("s_lastError: ", s_lastError);
  

  console.log("");
  
};

readResponse().catch(err => {
  console.log("Error reading response: ", err);
});
