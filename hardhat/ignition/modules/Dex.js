const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const lendingModule = require("./Lending");

module.exports = buildModule("DexV4", (m) => {
  const lending = m.useModule(lendingModule);

  const DLPToken = m.contract("DLPToken", [], { id: "dex_DLPTokenV3" });

  const ethToken = m.contractAt("ERC20Mock", lending.collateralToken, {
    id: "dex_ethTokenV4",
  });

  const daiToken = m.contractAt("ERC20Mock", lending.daiToken, {
    id: "dex_daiTokenV4",
  });

  const firstPriceFeed = m.contractAt(
    "PriceFeedAdapter",
    lending.collateralPriceFeed,
    { id: "dex_firstPriceFeedV4" }
  );

  const secondPriceFeed = m.contractAt(
    "PriceFeedAdapter",
    lending.daiPriceFeed,
    { id: "dex_secondPriceFeedV4" }
  );

  const dex = m.contract(
    "DEX",
    [ethToken, daiToken, firstPriceFeed, secondPriceFeed],
    { id: "dexV4" }
  );

  return { dex, ethToken, daiToken, firstPriceFeed, secondPriceFeed, DLPToken };
});

/**
 * Dex#OracleLib - 0x2b399F67D37D7f7Edd8ef826E3D653842dEDecEA
 * Dex#dex_daiToken - 0xf46E4f58dAF2e644E16Aa516Fb3c013cF0336e73
 * Dex#dex_ethToken - 0x621f3C9AFb6b0f9490003251961A681dA5B90544
 * Dex#dex_firstPriceFeed - 0xD5088a3B912E285526FBafA05F9c0cD32684dff2
 * Dex#dex_secondPriceFeed - 0xE74327B4A9aBEB77CF89B4be8A7b07bC52aD3733
 * Dex#dex - 0x69a34feA280aDff8c8116D2e9efffC648Eec96d2
 */

/**
 * DexV2#OracleLibV2 - 0xAf908353DD67be001941CBF9c8eE1841D68A2Abf
 * DexV2#dex_DLPTokenV2 - 0xe467E48D72eFE2a1A950eb744062CCc1bc105C34
 * DexV2#dex_daiTokenV2 - 0xf46E4f58dAF2e644E16Aa516Fb3c013cF0336e73
 * DexV2#dex_ethTokenV2 - 0x621f3C9AFb6b0f9490003251961A681dA5B90544
 * DexV2#dex_firstPriceFeedV2 - 0xD5088a3B912E285526FBafA05F9c0cD32684dff2
 * DexV2#dex_secondPriceFeedV2 - 0xE74327B4A9aBEB77CF89B4be8A7b07bC52aD3733
 * DexV2#dexV2 - 0x667a4206d58B4fa425C5A94e254255Bd1239FB9D
 */

/**
 * DexV3#dex_DLPTokenV3 - 0x3d1E5946EBbf8343dD5dCc8C60Bdcdc0118FB3c2
 * DexV3#dex_daiTokenV3 - 0xf46E4f58dAF2e644E16Aa516Fb3c013cF0336e73
 * DexV3#dex_ethTokenV3 - 0x621f3C9AFb6b0f9490003251961A681dA5B90544
 * DexV3#dex_firstPriceFeedV3 - 0xD5088a3B912E285526FBafA05F9c0cD32684dff2
 * DexV3#dex_secondPriceFeedV3 - 0xE74327B4A9aBEB77CF89B4be8A7b07bC52aD3733
 * DexV3#dexV3 - 0xA33BEc69ed8bC58f384d01D00B2219A37bE5323E
 */

/**
 * DexV4#dex_DLPTokenV3 - 0xcfa9F6B846d0DaA2686c90a70392aeAd8cb0Fb47
 * DexV4#dex_daiTokenV4 - 0xc755ae92fF404ec06fF5B3E85821f359B9AB56f1
 * DexV4#dex_ethTokenV4 - 0x6035D21cfd5460774044878F02D787ddA4AFE2Ed
 * DexV4#dex_firstPriceFeedV4 - 0xA8c7096cC11dfA42742B125A5F992b5074533A10
 * DexV4#dex_secondPriceFeedV4 - 0xCa147482e685FDEE18d311101Bb07828067E7571
 * DexV4#dexV4 - 0x89706Bad1a2b655fc42e4652d441865e9eF3208A
 */