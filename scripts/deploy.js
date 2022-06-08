const main = async () => {
    const domainContractFactory = await hre.ethers.getContractFactory('Domains');
    const domainContract = await domainContractFactory.deploy("gtfol");
    await domainContract.deployed();
    console.log("Contract deployed to:", domainContract.address);
    
  
    let txn = await domainContract.register("techbro",  {value: hre.ethers.utils.parseEther('0.1')});
    await txn.wait();
    console.log("Minted domain techbro.gtfol");
  
    const address = await domainContract.getAddress("techbro");
    console.log("Owner of domain techbro:", address);

    const balance = await hre.ethers.provider.getBalance(domainContract.address);
    console.log("Contract balance:", hre.ethers.utils.formatEther(balance));

    txn = await domainContract.addPost("techbro", "GTFOL!", false, 0);
    await txn.wait();
    console.log("New post by techbro");

    txn = await domainContract.bookmark("GTFOL!", false, 0, 0);
    await txn.wait();

    const post = await domainContract.getPosts();
    await txn.wait();
    console.log("New post by techbro:", post);

    const post1 = await domainContract.getBookmarks();
    await txn.wait();
    console.log("New post by techbro:", post1);

    const userPosts = await domainContract.getUserTotalPosts("techbro");
    await txn.wait();
    console.log("New post by techbro:", userPosts);

    
    

    txn = await domainContract.hidePost(true, 0);
    await txn.wait();
    console.log("hide post by techbro");

    txn = await domainContract.bookmark("GTFOL!", true, 0, 0);
    await txn.wait();

    const post2 = await domainContract.getPosts();
    await txn.wait();
    console.log("hidden post by techbro:", post2);

    const postt = await domainContract.getBookmarks();
    await txn.wait();
    console.log("New post by techbro:", postt);

    const userPosts2 = await domainContract.getUserTotalPosts("techbro");
    await txn.wait();
    console.log("New post by techbro:", userPosts2);

    txn = await domainContract.editPost("GTFOL!", false, 0);
    await txn.wait();
    console.log("hide post by techbro");

    const post3 = await domainContract.getPosts();
    await txn.wait();
    console.log("hidden post by techbro:", post3);

    const userPosts3 = await domainContract.getUserTotalPosts("techbro");
    await txn.wait();
    console.log("New post by techbro:", userPosts3);

  
    // Trying to set a record that doesn't belong to me!
    txn = await domainContract.setRecord("techbro", "Look at me, this is my domain now!", "legendury@gmail.com", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKkXrypM5LEm0hGbxNlkUlJELJKCd10gDnvw&usqp=CAU");
    await txn.wait();
    console.log("Set record for techbro");
    
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