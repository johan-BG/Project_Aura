const { Contract, ContractFactory, utils } = require("ethers");
const WETH9 = require("./WETH9.json");
const { ethers } = require("hardhat"); // Assuming you are running this via hardhat
const fs = require("fs");
const path = require("path");

// Import artifacts
const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  SwapRouter: require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"),
  QuoterV2: require("@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json"),
  NFTDescriptor: require("@uniswap/v3-periphery/artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json"),
  NonfungibleTokenPositionDescriptor: require("@uniswap/v3-periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  WETH9,
};

// Standard Library Linker
const linkLibraries = ({ bytecode, linkReferences }, libraries) => {
  let linkedBytecode = bytecode;

  // 1. Loop through all files in the linkReferences
  Object.keys(linkReferences).forEach((fileName) => {
    // 2. Loop through all library names in that file
    Object.keys(linkReferences[fileName]).forEach((contractName) => {
      // 3. Check if the library address was provided in the arguments
      if (!libraries.hasOwnProperty(contractName)) {
        throw new Error(`Missing link library name ${contractName}`);
      }

      // 4. Format the address (remove 0x)
      const address = utils
        .getAddress(libraries[contractName])
        .toLowerCase()
        .slice(2);

      // 5. Replace every occurrence of the placeholder with the address
      linkReferences[fileName][contractName].forEach(({ start, length }) => {
        const start2 = 2 + start * 2;
        const length2 = length * 2;

        linkedBytecode = linkedBytecode
          .slice(0, start2)
          .concat(address)
          .concat(
            linkedBytecode.slice(start2 + length2, linkedBytecode.length),
          );
      });
    });
  });
  return linkedBytecode;
};

async function main() {
  const [owner] = await ethers.getSigners();

  // 1. Deploy WETH
  console.log("Deploying WETH...");
  const Weth = new ContractFactory(
    artifacts.WETH9.abi,
    artifacts.WETH9.bytecode,
    owner,
  );
  const weth = await Weth.deploy();
  await weth.deployed();

  // 2. Deploy Factory
  console.log("Deploying Uniswap V3 Factory...");
  const Factory = new ContractFactory(
    artifacts.UniswapV3Factory.abi,
    artifacts.UniswapV3Factory.bytecode,
    owner,
  );
  const factory = await Factory.deploy();
  await factory.deployed();

  // 3. Deploy SwapRouter
  console.log("Deploying SwapRouter...");
  const SwapRouter = new ContractFactory(
    artifacts.SwapRouter.abi,
    artifacts.SwapRouter.bytecode,
    owner,
  );
  const swaprouter = await SwapRouter.deploy(factory.address, weth.address);
  await swaprouter.deployed();

  // Deploy Quoter
  const QuoterV2 = new ContractFactory(
    artifacts.QuoterV2.abi,
    artifacts.QuoterV2.bytecode,
    owner,
  );
  const quoterv2 = await QuoterV2.deploy(factory.address, weth.address);
  await quoterv2.deployed();

  // 4. Deploy NFTDescriptor (Library)
  console.log("Deploying NFTDescriptor...");
  const NFTDescriptor = new ContractFactory(
    artifacts.NFTDescriptor.abi,
    artifacts.NFTDescriptor.bytecode,
    owner,
  );
  const nftDescriptor = await NFTDescriptor.deploy();
  await nftDescriptor.deployed();

  // 5. Link and Deploy NonfungibleTokenPositionDescriptor
  console.log("Linking and Deploying PositionDescriptor...");

  // !!! FIX HERE: Use the linkReferences DIRECTLY from the artifact !!!
  const linkedBytecode = linkLibraries(
    {
      bytecode: artifacts.NonfungibleTokenPositionDescriptor.bytecode,
      linkReferences:
        artifacts.NonfungibleTokenPositionDescriptor.linkReferences,
    },
    {
      // Map the library name to the deployed address
      NFTDescriptor: nftDescriptor.address,
    },
  );

  const NonfungibleTokenPositionDescriptor = new ContractFactory(
    artifacts.NonfungibleTokenPositionDescriptor.abi,
    linkedBytecode, // Use the linked bytecode
    owner,
  );

  const nativeCurrencyLabelBytes = utils.formatBytes32String("ETH");

  const nonfungibleTokenPositionDescriptor =
    await NonfungibleTokenPositionDescriptor.deploy(
      weth.address,
      nativeCurrencyLabelBytes,
    );
  await nonfungibleTokenPositionDescriptor.deployed();

  // 6. Deploy NonfungiblePositionManager
  console.log("Deploying PositionManager...");
  const NonfungiblePositionManager = new ContractFactory(
    artifacts.NonfungiblePositionManager.abi,
    artifacts.NonfungiblePositionManager.bytecode,
    owner,
  );
  const nonfungiblePositionManager = await NonfungiblePositionManager.deploy(
    factory.address,
    weth.address,
    nonfungibleTokenPositionDescriptor.address,
  );
  await nonfungiblePositionManager.deployed();

  console.log("----------------------------------------------");
  console.log("WETH:", weth.address);
  console.log("Factory:", factory.address);
  console.log("Quoter:", quoterv2.address);
  console.log("SwapRouter:", swaprouter.address);
  console.log("NFTDescriptor:", nftDescriptor.address);
  console.log(
    "PositionDescriptor Address:",
    nonfungibleTokenPositionDescriptor.address,
  );
  console.log("PositionManager Address:", nonfungiblePositionManager.address);
  console.log("----------------------------------------------");

  const deploymentdata={};
  deploymentdata.weth = weth.address;
  deploymentdata.factory = factory.address;
  deploymentdata.quoter = quoterv2.address;
  deploymentdata.swaprouter = swaprouter.address;
  deploymentdata.nftDescriptor = nftDescriptor.address;
  deploymentdata.nonfungibleTokenPositionDescriptor =
    nonfungibleTokenPositionDescriptor.address;
  deploymentdata.nonfungiblePositionManager =
    nonfungiblePositionManager.address;
  fs.writeFileSync(
    path.join(__dirname,"../../frontend/address.json"),
    JSON.stringify(deploymentdata, null, 2),
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
