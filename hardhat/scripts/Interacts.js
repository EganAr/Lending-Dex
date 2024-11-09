const { Web3 } = require("web3");
const fs = require("fs");

const CollateralTokenAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
const DAITokenAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
const OracleLibAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
const PriceFeedAddress = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
const LendingBorrowingAddress = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";

async function main() {
  const web3 = new Web3("http://127.0.0.1:8545");

  const LendingBorrowing = JSON.parse(
    fs.readFileSync(
      "./artifacts/contracts/LendingBorrowing.sol/LendingBorrowing.json"
    )
  );
  const ERC20Mock = JSON.parse(
    fs.readFileSync("./artifacts/contracts/mocks/ERC20Mock.sol/ERC20Mock.json")
  );
  const PriceFeed = JSON.parse(
    fs.readFileSync(
      "./artifacts/contracts/mocks/MockV3Aggregator.sol/MockV3Aggregator.json"
    )
  );
  const OracleLib = JSON.parse(
    fs.readFileSync(
      "./artifacts/contracts/libraries/OracleLib.sol/OracleLib.json"
    )
  );

  const lendingBorrowingContract = new web3.eth.Contract(
    LendingBorrowing.abi,
    LendingBorrowingAddress
  );
  const daiTokenContract = new web3.eth.Contract(
    ERC20Mock.abi,
    DAITokenAddress
  );
  const collateralTokenContract = new web3.eth.Contract(
    ERC20Mock.abi,
    CollateralTokenAddress
  );
  const priceFeedContract = new web3.eth.Contract(
    PriceFeed.abi,
    PriceFeedAddress
  );
  const OracleLibContract = new web3.eth.Contract(
    OracleLib.abi,
    OracleLibAddress
  );

  const accounts = await web3.eth.getAccounts();
  const userAccount = accounts[0];

  const amount = web3.utils.toWei("100", "ether");
  await daiTokenContract.methods
    .approve(LendingBorrowingAddress, amount)
    .send({ from: userAccount });
  console.log("Approved tokens");

  await daiTokenContract.methods
    .faucet(userAccount, amount)
    .send({ from: userAccount });

  const depositAmount = web3.utils.toWei("10", "ether");
  await lendingBorrowingContract.methods
    .deposit(depositAmount)
    .send({ from: userAccount });
  console.log("Deposited tokens");

  const balance = await lendingBorrowingContract.methods
    .getUserDeposit(userAccount, DAITokenAddress)
    .call();
  console.log(
    "User deposit balance:",
    web3.utils.fromWei(balance, "ether"),
    "DAI"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
