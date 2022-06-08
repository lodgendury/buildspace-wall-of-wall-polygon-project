const main = async () => {
    const domainContractFactory = await hre.ethers.getContractFactory('Domains');
    const domainContract = await domainContractFactory.deploy();
    await domainContract.deployed();
    console.log("Contract deployed to:", domainContract.address);
  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }const main = async () => {
      // The first return is the deployer, the second is a random account
      const [owner, randomPerson] = await hre.ethers.getSigners();
      const domainContractFactory = await hre.ethers.getContractFactory('Domains');
      const domainContract = await domainContractFactory.deploy("nba");
      await domainContract.deployed();
      console.log("Contract deployed to:", domainContract.address);
      console.log("Contract deployed by:", owner.address);
    
      let txn = await domainContract.register("fullblockdev",  {value: hre.ethers.utils.parseEther('1234')});
      await txn.wait();
    
      const domainAddress = await domainContract.getAddress("fullblockdev");
      console.log("Owner of domain fullblockdev:", domainAddress);
  
      const balance = await hre.ethers.provider.getBalance(domainContract.address);
      console.log("Contract balance:", hre.ethers.utils.formatEther(balance));
  
      try {
        txn = await domainContract.connect(randomPerson).withdraw();
        await txn.wait();
      } catch(error){
        console.log("Could not rob contract");
      }
  
      let ownerBalance = await hre.ethers.provider.getBalance(owner.address);
      console.log("Balance of owner before withdrawal:", hre.ethers.utils.formatEther(ownerBalance));
    
      // Oops, looks like the owner is saving their money!
      txn = await domainContract.connect(owner).withdraw();
      await txn.wait();
      
      // Fetch balance of contract & owner
      const contractBalance = await hre.ethers.provider.getBalance(domainContract.address);
      ownerBalance = await hre.ethers.provider.getBalance(owner.address);
    
      console.log("Contract balance after withdrawal:", hre.ethers.utils.formatEther(contractBalance));
      console.log("Balance of owner after withdrawal:", hre.ethers.utils.formatEther(ownerBalance));
    
      // Trying to set a record that doesn't belong to me!
      txn = await domainContract.connect(owner).setRecord("fullblockdev", "Look at me, this is my domain now!", "legendury@gmail.com", "Buildspace", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKkXrypM5LEm0hGbxNlkUlJELJKCd10gDnvw&usqp=CAU");
      await txn.wait();
    }
    
    const runMain = async () => {
      try {
        await main();
        process.exit(0);
      } catch (error) {
        console.log(error);
        process.exit(1);
      }
    };
    
    runMain();
  };
  
  runMain();