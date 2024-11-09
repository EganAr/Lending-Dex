const { Web3 } = require("web3");
// const OracleLibABI = require("../ignition/deployments/chain-421614/artifacts/DexV2#OracleLibV2.json");
const DLPTokenABI = require("../ignition/deployments/chain-421614/artifacts/DexV4#dex_DLPTokenV3.json");
const DaiTokenABI = require("../ignition/deployments/chain-421614/artifacts/DexV4#dex_daiTokenV4.json");
const EthTokenABI = require("../ignition/deployments/chain-421614/artifacts/DexV4#dex_ethTokenV4.json");
const PriceFeedEthABI = require("../ignition/deployments/chain-421614/artifacts/DexV4#dex_firstPriceFeedV4.json");
const PriceFeedDaiABI = require("../ignition/deployments/chain-421614/artifacts/DexV4#dex_secondPriceFeedV4.json");
const DexABI = require("../ignition/deployments/chain-421614/artifacts/DexV4#dexV4.json");

const ADDRESSES = {
  DLPTOKEN: "0xcfa9F6B846d0DaA2686c90a70392aeAd8cb0Fb47",
  DAITOKEN: "0xc755ae92fF404ec06fF5B3E85821f359B9AB56f1",
  ETHTOKEN: "0x6035D21cfd5460774044878F02D787ddA4AFE2Ed",
  PRICEFEED_ETH: "0xA8c7096cC11dfA42742B125A5F992b5074533A10",
  PRICEFEED_DAI: "0xCa147482e685FDEE18d311101Bb07828067E7571",
  DEX: "0x89706Bad1a2b655fc42e4652d441865e9eF3208A",
};

const RPC_URL = process.env.ARBITRUM_SEPOLIA_RPC_URL;

async function main() {
  const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));

  const DexContract = new web3.eth.Contract(DexABI.abi, ADDRESSES.DEX);
  const daiToken = new web3.eth.Contract(DaiTokenABI.abi, ADDRESSES.DAITOKEN);
  const ethToken = new web3.eth.Contract(EthTokenABI.abi, ADDRESSES.ETHTOKEN);
  const dlpToken = new web3.eth.Contract(DLPTokenABI.abi, ADDRESSES.DLPTOKEN);
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

    console.log("Checking prices From DexContract...");
    const price = await DexContract.methods.getPrice().call();
    console.log("eth Price", price[0]);
    console.log("dai Price", price[1]);

    console.log("\nChecking balances...");
    const daiBalance = await daiToken.methods.balanceOf(myAddress).call();
    const ethBalance = await ethToken.methods.balanceOf(myAddress).call();
    console.log(`DAI Balance: ${web3.utils.fromWei(daiBalance, "ether")} DAI`);
    console.log(`Eth Balance: ${web3.utils.fromWei(ethBalance, "ether")} ETH`);

    console.log("\nApproving Tokens...");
    const daiAmountFaucet = web3.utils.toWei("3000", "ether");
    const ethAmountFaucet = web3.utils.toWei("1", "ether");

    const daiApprove = await daiToken.methods
      .approve(ADDRESSES.DEX, daiAmountFaucet)
      .send({ from: myAddress });
    const ethApprove = await ethToken.methods
      .approve(ADDRESSES.DEX, ethAmountFaucet)
      .send({ from: myAddress });

    const daiFaucet = await daiToken.methods
      .faucet(myAddress, daiAmountFaucet)
      .send({ from: myAddress });
    const ethFaucet = await ethToken.methods
      .faucet(myAddress, ethAmountFaucet)
      .send({ from: myAddress });
    console.log("daiApprove", daiApprove.transactionHash);
    console.log("ethApprove", ethApprove.transactionHash);
    console.log("daiFaucet", daiFaucet.transactionHash);
    console.log("ethFaucet", ethFaucet.transactionHash);

    console.log("\nAdding Liquidity...");
    const addLiquidityAmountEth = web3.utils.toWei("0.1", "ether");
    const addLiquidityAmountDai = web3.utils.toWei("303.9", "ether");

    const addLiquidity = await DexContract.methods
      .addLiquidity(addLiquidityAmountEth, addLiquidityAmountDai)
      .send({ from: myAddress });
    console.log("addLiquidity", addLiquidity.transactionHash);

    console.log("\nSwap Tokens...");
    const tokenIn = ADDRESSES.ETHTOKEN;
    const amountIn = web3.utils.toWei("0.001", "ether");
    const minAmountOut = web3.utils.toWei("1", "ether");

    const swap = await DexContract.methods
      .swap(tokenIn, amountIn, minAmountOut)
      .send({ from: myAddress });
    console.log("swap", swap.transactionHash);

    console.log("\nRemoving Liquidity...");
    const getLpTokens = await DexContract.methods
      .getLpTokensBalance(myAddress)
      .call();
    console.log("Lp Token Balance", getLpTokens);
  } catch (error) {
    console.log("error", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
