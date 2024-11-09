const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const ARBITRUM_SEPOLIA_ADDRESSES = {
  ETH_USD_FEED: "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165",
  DAI_USD_FEED: "0xb113F5A928BCfF189C998ab20d753a47F9dE5A61",
};

module.exports = buildModule("LendingV7", (m) => {
  let daiToken, collateralToken, collateralPriceFeed, daiPriceFeed;

  daiToken = m.contract("ERC20Mock", ["DAI TOKEN", "DAI"], {
    id: "lending_DAITokenV7",
  });

  collateralToken = m.contract("ERC20Mock", ["ETH TOKEN", "ETH"], {
    id: "lending_CollateralTokenV7",
  });

  collateralPriceFeed = m.contract(
    "PriceFeedAdapter",
    [ARBITRUM_SEPOLIA_ADDRESSES.ETH_USD_FEED],
    { id: "eth_usd_adapterV7" }
  );
  daiPriceFeed = m.contract(
    "PriceFeedAdapter",
    [ARBITRUM_SEPOLIA_ADDRESSES.DAI_USD_FEED],
    { id: "dai_usd_adapterV7" }
  );

  const lendingV7 = m.contract(
    "LendingBorrowingV3",
    [daiToken, collateralToken, collateralPriceFeed, daiPriceFeed],
    { id: "lendingV7" }
  );

  return {
    lendingV7,
    daiToken,
    collateralToken,
    collateralPriceFeed,
    daiPriceFeed,
  };
});

/**
 * Lending#OracleLib - 0x592e4A849715AF4FC7303D17CFEC3217b82157c2
 * Lending#lending_CollateralToken - 0x6582Fd1f95818ac137f00313ab6a34736B136F3c
 * Lending#lending_DAIToken - 0x149f446d336A0E6cdfD1141fFC4Ec4E78b813b67
 * Lending#lending_priceFeedDai - 0x340350d5C69053d26C0BB98ab938dB88Fa6976eF
 * Lending#lending_priceFeedEth - 0xe1aFc825ada24b41C492FCA77559425aa38e53bF
 * Lending#lending - 0x3fAa0CC2B45088B3172cc23DA35713c76b7bebea
 */

/**
 *  LendingV2#OracleLibV2 - 0xeD7ff18174766c6AFE0BD930C323d230a4BC1161
 *  LendingV2#dai_usd_adapterV2 - 0x48d8b4e9A718Cb86aCf54257EE2e01E08cCA3341
 *  LendingV2#eth_usd_adapterV2 - 0x09aE1CF6109ec1e4E2b1807CbFE7ceE997658a45
 *  LendingV2#lending_CollateralTokenV2 - 0x81c898EF789e9dd0711D8177De61e2Dc660Ba0F7
 *  LendingV2#lending_DAITokenV2 - 0xA1e93C81a2fB76926a272d302b293D6a5e1eab3e
 *  LendingV2#lendingV2 - 0xd5DCC568297DC5B4d2DeD78Df748e8b2f47FE689
 */

/**
 * LendingV3#OracleLibV3 - 0x13885091216A6Ef95e13F6f1ca1152EA49aFE902
 * LendingV3#dai_usd_adapterV3 - 0xb041D0FB1e8043986EaefDE047118e641611a83E
 * LendingV3#eth_usd_adapterV3 - 0x0DFB75986b56d05E4785ed9DC419b2D9D1338B44
 * LendingV3#lending_CollateralTokenV3 - 0x1C8fBf95B73A95Ad13Eca19b590B070aE8bA3916
 * LendingV3#lending_DAITokenV3 - 0x4486D8De0040F15BcC22376B454Bd9993088218B
 * LendingV3#lendingV3 - 0xccf298e1171200D695bF167437b04D6EBc6d0E93
 */

/**
 * LendingV4#OracleLibV4 - 0xaD678BC4dA3B55C55422B8F0bCFcb7F60679a157
 * LendingV4#dai_usd_adapterV4 - 0x32bb699ec2a0316A90Bc5F93c0dD89156941e314
 * LendingV4#eth_usd_adapterV4 - 0xf8899b8Ed2fC2A0e271B5CC831Ba4A1F1fcac63A
 * LendingV4#lending_CollateralTokenV4 - 0xf307F64C71Bd09dA08956547704aB35f73C747f7
 * LendingV4#lending_DAITokenV4 - 0x98ab5DBE746198386FFc92CCfF1B69FaA7d0Ecbc
 * LendingV4#lendingV4 - 0xB5Da8fbB5a496E49B9De361a5f666dCdc66C28B5
 */

/**
 * LendingV5#OracleLibV5 - 0xC4e4ec8C4E108F7f75e9E11D42dB72206018064F
 * LendingV5#dai_usd_adapterV5 - 0xE9877e9Ae6bD332bEFedE57C59A4885b5e1036CA
 * LendingV5#eth_usd_adapterV5 - 0xaA1D6816783f15aecE715168De8E7e80341cB804
 * LendingV5#lending_CollateralTokenV5 - 0x88057DeB9EDf81803C07e8754f63751f8732aAEA
 * LendingV5#lending_DAITokenV5 - 0x4Aa40a491cFF660D205a74c53562E37167a80D88
 * LendingV5#lendingV5 - 0xD602FeaA79637B02D0E53914AfF43c8907ae585e
 */

/**
 * LendingV6#OracleLibV6 - 0x9d56e3aB8A026cefB4b62e5F71a47D8bF7732cb1
 * LendingV6#dai_usd_adapterV6 - 0xE74327B4A9aBEB77CF89B4be8A7b07bC52aD3733
 * LendingV6#eth_usd_adapterV6 - 0xD5088a3B912E285526FBafA05F9c0cD32684dff2
 * LendingV6#lending_CollateralTokenV6 - 0x621f3C9AFb6b0f9490003251961A681dA5B90544
 * LendingV6#lending_DAITokenV6 - 0xf46E4f58dAF2e644E16Aa516Fb3c013cF0336e73
 * LendingV6#lendingV6 - 0x940B2bb9920FeEd51cd9cb4a199C0fcC28671679
 */

/**
 * LendingV7#dai_usd_adapterV7 - 0xCa147482e685FDEE18d311101Bb07828067E7571
 * LendingV7#eth_usd_adapterV7 - 0xA8c7096cC11dfA42742B125A5F992b5074533A10
 * LendingV7#lending_CollateralTokenV7 - 0x6035D21cfd5460774044878F02D787ddA4AFE2Ed
 * LendingV7#lending_DAITokenV7 - 0xc755ae92fF404ec06fF5B3E85821f359B9AB56f1
 * LendingV7#lendingV7 - 0xeD426CBB7D9d805c368Cc1E48A06Da3d414BA29B
 */