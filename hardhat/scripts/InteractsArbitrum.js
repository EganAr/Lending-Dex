const { Web3 } = require("web3");
const LendingABI = require("../ignition/deployments/chain-421614/artifacts/LendingV7#lendingV7.json");
const DAITokenABI = require("../ignition/deployments/chain-421614/artifacts/LendingV7#lending_DAITokenV7.json");
const CollateralTokenABI = require("../ignition/deployments/chain-421614/artifacts/LendingV7#lending_CollateralTokenV7.json");
const PriceFeedEthABI = require("../ignition/deployments/chain-421614/artifacts/LendingV7#eth_usd_adapterV7.json");
const PriceFeedDaiABI = require("../ignition/deployments/chain-421614/artifacts/LendingV7#dai_usd_adapterV7.json");

const ADDRESSES = {
  PRICEFEED_DAI: "0xCa147482e685FDEE18d311101Bb07828067E7571",
  PRICEFEED_ETH: "0xA8c7096cC11dfA42742B125A5F992b5074533A10",
  COLLATERALTOKEN: "0x6035D21cfd5460774044878F02D787ddA4AFE2Ed",
  DAITOKEN: "0xc755ae92fF404ec06fF5B3E85821f359B9AB56f1",
  LENDING: "0xeD426CBB7D9d805c368Cc1E48A06Da3d414BA29B",
};

const RPC_URL = process.env.ARBITRUM_SEPOLIA_RPC_URL;

async function main() {
  const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));

  const lendingContract = new web3.eth.Contract(
    LendingABI.abi,
    ADDRESSES.LENDING
  );
  const daiToken = new web3.eth.Contract(DAITokenABI.abi, ADDRESSES.DAITOKEN);
  const collateralToken = new web3.eth.Contract(
    CollateralTokenABI.abi,
    ADDRESSES.COLLATERALTOKEN
  );
  const priceFeedEth = new web3.eth.Contract(
    PriceFeedEthABI.abi,
    ADDRESSES.PRICEFEED_ETH
  );
  const priceFeedDai = new web3.eth.Contract(
    PriceFeedDaiABI.abi,
    ADDRESSES.PRICEFEED_DAI
  );

  const privateKey = "0x" + process.env.PRIVATE_KEY;
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);
  const myAddress = account.address;

  try {
    console.log("Checking prices...");
    const ethAnswer = await priceFeedEth.methods.latestRoundData().call();
    const daiAnswer = await priceFeedDai.methods.latestRoundData().call();
    console.log(`ETH Price: ${Number(ethAnswer.answer) / Math.pow(10, 8)} ETH`);
    console.log(`DAI Price: ${Number(daiAnswer.answer) / Math.pow(10, 8)} DAI`);

    console.log("Checking balances...");
    const daiBalance = await daiToken.methods.balanceOf(myAddress).call();
    const collateralBalance = await collateralToken.methods
      .balanceOf(myAddress)
      .call();
    console.log(`DAI Balance: ${web3.utils.fromWei(daiBalance, "ether")} DAI`);
    console.log(
      `Collateral Balance: ${web3.utils.fromWei(
        collateralBalance,
        "ether"
      )} ETH`
    );

    console.log("Approving tokens...");
    const daiAmountFaucet = web3.utils.toWei("100", "ether");
    const approveDai = await daiToken.methods
      .approve(ADDRESSES.LENDING, daiAmountFaucet)
      .send({
        from: myAddress,
      });
    console.log("DAI Approval TX:", approveDai.transactionHash);
    const daiFaucet = await daiToken.methods
      .faucet(myAddress, daiAmountFaucet)
      .send({
        from: myAddress,
      });
    console.log("DAI Faucet TX:", daiFaucet.transactionHash);

    const ethAmountFaucet = web3.utils.toWei("0.1", "ether");
    const approveEth = await collateralToken.methods
      .approve(ADDRESSES.LENDING, ethAmountFaucet)
      .send({
        from: myAddress,
      });
    console.log("ETH Approval TX:", approveEth.transactionHash);
    const ethFaucet = await collateralToken.methods
      .faucet(myAddress, ethAmountFaucet)
      .send({
        from: myAddress,
      });
    console.log("ETH Faucet TX:", ethFaucet.transactionHash);

    const depositAmount = web3.utils.toWei("1", "ether");
    const deposit = await lendingContract.methods.deposit(depositAmount).send({
      from: myAddress,
    });
    console.log("Deposit TX:", deposit.transactionHash);
    console.log("Deposit complete.");

    const depositCollateralAmount = web3.utils.toWei("0.01", "ether");
    const depositCollateral = await lendingContract.methods
      .depositCollateral(depositCollateralAmount)
      .send({
        from: myAddress,
      });
    console.log("Deposit Collateral TX:", depositCollateral.transactionHash);
    console.log("Deposit Collateral complete.");

    const getBorrowLimit = await lendingContract.methods
      .calculateAvailableBorrow(myAddress)
      .call();
    console.log("Borrow Limit:", web3.utils.fromWei(getBorrowLimit, "ether"));

    console.log("\nBorrowing DAI...");
    const borrowAmount = web3.utils.toWei("1", "ether");
    const borrow = await lendingContract.methods.borrow(borrowAmount).send({
      from: myAddress,
      gas: 500000,
    });
    console.log("Borrow TX:", borrow.transactionHash);
    console.log("Borrow complete.");

    const getUserCollateral = await lendingContract.methods
      .getUserCollateral(myAddress, ADDRESSES.COLLATERALTOKEN)
      .call();
    console.log("Collateral:", web3.utils.fromWei(getUserCollateral, "ether"));

    const getUserBorrow = await lendingContract.methods
      .getUserBorrow(myAddress, ADDRESSES.DAITOKEN)
      .call();
    console.log("Borrow:", web3.utils.fromWei(getUserBorrow, "ether"));

    const getCollateralValue = await lendingContract.methods
      .getCollateralValue(myAddress)
      .call();
    console.log(
      "Collateral Value:",
      web3.utils.fromWei(getCollateralValue, "ether")
    );

    const getNetWorth = await lendingContract.methods
      .calculateNetWorth(myAddress)
      .call();
    console.log("Net Worth:", web3.utils.fromWei(getNetWorth, "ether"));
  } catch (error) {
    console.error(error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
