import React, { useEffect, useState } from "react";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import {ethers} from "ethers";
import contractAbi from './utils/contractABI.json';
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import wallpin from './assets/wallpin.png';
import { networks } from './utils/networks';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const tld = '.gtfol';
const CONTRACT_ADDRESS = '0xF808a343c925abd6B6Db499b45f84Ed2c56a01A5';

const App = () => {
	const [currentAccount, setCurrentAccount] = useState('');

	const [domain, setDomain] = useState('');
  	const [record, setRecord] = useState({bio: "", email: "", avatar:""});

	const [network, setNetwork] = useState('');

	const [profileEdit, setProfileEdit] = useState(false);
	const [textEdit, setTextEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mints, setMints] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [allBookmarks, setAllBookmarks] = useState([]);
  const [userAcc, setUserAcc] = useState('');
  const [profile, setProfile] = useState(false);
  const [starredPosts, setStarredPosts] = useState(false);
  const [textareaheight, setTextareaheight] = useState(1);
  const [textHeight, setTextHeight] = useState(1);  
  const [text, setText] = useState("");
  const [newText, setNewText] = useState("");
  const [notPublic, setNotPublic] = useState(false);
  const [editProfile, setEditProfile] = useState(false);

	const connectWallet = async () => {
		try {
		  const { ethereum } = window;
	
		  if (!ethereum) {
			alert("Get MetaMask -> https://metamask.io/");
			return;
		  }
	
		  // Fancy method to request access to account.
		  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
		
		  // Boom! This should print out public address once we authorize Metamask.
		  console.log("Connected", accounts[0]);
		  setCurrentAccount(accounts[0]);
		  setUserAcc(accounts[0]);
		  
		} catch (error) {
		  console.log(error)
		}
	  }
	  
  // Gotta make sure this is async.
  const checkIfWalletIsConnected = async() => {
    // First make sure we have access to window.ethereum
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

	 // Check if we're authorized to access the user's wallet
	 const accounts = await ethereum.request({ method: 'eth_accounts' });
	 const account = accounts[0];

	 // Users can have multiple authorized accounts, we grab the first one if its there!
	 if (accounts.length !== 0) {
	   const account = accounts[0];
	   console.log('Found an authorized account:', account);
	   setCurrentAccount(account);
	   setUserAcc(account);
	   
	 } else {
	   console.log('No authorized account found');
	 }

	  // This is the new part, we check the user's network chain ID
	  const chainId = await ethereum.request({ method: 'eth_chainId' });
	  setNetwork(networks[chainId]);
  
	  ethereum.on('chainChanged', handleChainChanged);
	  
	  // Reload the page when they change networks
	  function handleChainChanged(_chainId) {
		window.location.reload();
	  }

	  ethereum.on('accountsChanged', accountsChanged);

	  function accountsChanged(_account) {
		window.location.reload();
	  }
	   
	  
  };
  const switchNetwork = async () => {
	if (window.ethereum) {
	  try {
		// Try to switch to the Mumbai testnet
		await window.ethereum.request({
		  method: 'wallet_switchEthereumChain',
		  params: [{ chainId: '0x13881' }], // Check networks.js for hexadecimal network ids
		});
	  } catch (error) {
		// This error code means that the chain we want has not been added to MetaMask
		// In this case we ask the user to add it to their MetaMask
		if (error.code === 4902) {
		  try {
			await window.ethereum.request({
			  method: 'wallet_addEthereumChain',
			  params: [
				{	
				  chainId: '0x13881',
				  chainName: 'Polygon Mumbai Testnet',
				  rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
				  nativeCurrency: {
					  name: "Mumbai Matic",
					  symbol: "MATIC",
					  decimals: 18
				  },
				  blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
				},
			  ],
			});
		  } catch (error) {
			console.log(error);
		  }
		}
		console.log(error);
	  }
	} else {
	  // If window.ethereum is not found then MetaMask is not installed
	  alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
	} 
  }

  const mintDomain = async () => {
	const result = mints.find( ({ owner }) => owner.toLowerCase() === currentAccount.toLowerCase() );
	//console.log(result.name);
	  if (result) { return }
	// Don't run if the domain is empty
	if (!record || !domain) { return }
	if (!currentAccount) {
		return
	}
	// Alert the user if the domain is too short
	if (domain.length < 3) {
		alert('Domain must be at least 3 characters long');
		return;
	}
	// Calculate price based on length of domain (change this to match your contract)	
	// 3 chars = 0.5 MATIC, 4 chars = 0.3 MATIC, 5 or more = 0.1 MATIC
	const price = domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1';
	console.log("Minting domain", domain, "with price", price);
  try {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

			console.log("Going to pop wallet now to pay gas...")
      let tx = await contract.register(domain, {value: ethers.utils.parseEther(price)});
      // Wait for the transaction to be mined
			const receipt = await tx.wait();

			// Check if the transaction was successfully completed
			if (receipt.status === 1) {
				console.log("Domain minted! https://mumbai.polygonscan.com/tx/"+tx.hash);
				
				// Set the record for the domain
				tx = await contract.setRecord(domain, record.bio, record.email, record.avatar);
				await tx.wait();

				console.log("Record set! https://mumbai.polygonscan.com/tx/"+tx.hash);

				setTimeout(() => {
					fetchMints();
					window.location.reload();
				  }, 2000);
				
				setRecord({bio: "", email: "", avatar:""});
				setDomain('');
				
			}
			else {
				alert("Transaction failed! Please try again");
			}
    }
  }
  catch(error){
    console.log(error);
  }
}

const updateDomain = async () => {
	if (!record || !domain) { return }
	setLoading(true);
	console.log("Updating domain", domain, "with record", record);
	  try {
	  const { ethereum } = window;
	  if (ethereum) {
		const provider = new ethers.providers.Web3Provider(ethereum);
		const signer = provider.getSigner();
		const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);
  
		let tx = await contract.setRecord(domain, record.bio, record.email, record.avatar);
		await tx.wait();
		console.log("Record set https://mumbai.polygonscan.com/tx/"+tx.hash);
  
		fetchMints();
		setRecord({bio: "", email: "", avatar:""});
		setDomain('');
		setEditProfile(false);
		window.location.reload();
		
	  }
	  } catch(error) {
		console.log(error);
	  }
	setLoading(false);
  }

  const fetchMints = async () => {
	  
	try {
	  const { ethereum } = window;
	  if (ethereum) {
		// You know all this
		const provider = new ethers.providers.Web3Provider(ethereum);
		const signer = provider.getSigner();
		const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

		
		  
		  
		// Get all the domain names from our contract
		const names = await contract.getAllNames();
		  
		// For each name, get the record and the address
		const mintRecords = await Promise.all(names.map(async (name) => {
		const bioRecord = await contract.bioRecords(name);
		const emailRecord = await contract.emailRecords(name);
		const avatarLink = await contract.avatars(name);
		const owner = await contract.domains(name);
		const userPostCount = await contract.getUserTotalPosts(name);
		
		return {
		  id: names.indexOf(name),
		  name: name,
		  record: bioRecord,
		  email: emailRecord,
		  avatar: avatarLink,
		  owner: owner,
		  totalPosts: userPostCount.toNumber(),
		};
	  }));
  
	  console.log("MINTS FETCHED ", mintRecords);
	  setMints(mintRecords);

	  const posts = await contract.getPosts();

		const renderPosts = posts.map(post => {
			return {
			  user: post.user,
			  timestamp: new Date(post.timestamp * 1000),
			  message: post.message,
			  hide: post.hide,
			  edit: false,
			  personal: false,
			  totalBookmarks: post.totalBookmarks.toNumber(),
			};
		  });


		  console.log("POSTS FETCHED ", renderPosts);

		  setAllPosts(renderPosts.reverse());

		  const bookmarks = await contract.getBookmarks();

		  const renderBookmarks = bookmarks.map(bm => {
			  return {
				  user: bm.user,
				  message: bm.message,
				  hide: bm.hide,
				  postId: bm.postId.toNumber(),
			  }
		  });
		  console.log("BOOKMARKS FETCHED ", renderBookmarks);

		  setAllBookmarks(renderBookmarks.reverse());

		  

		

		  
	  }
	} catch(error){
	  console.log(error);
	}
  }
  
  // This will run any time currentAccount or network are changed
  useEffect(() => {
	if (network === 'Polygon Mumbai Testnet') {
	  fetchMints();
	}
  }, [currentAccount, network]);


  

  //const userPosts = allPosts.filter( ({ user }) => user.toLowerCase() === currentAccount.toLowerCase() );

  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const renderMints = () => {
	if (starredPosts) {
		return (
			<div className="mint-container">
				<div className="mint-section">
				
			  {!profile && (<p className="mint-subtitle">Recent Posts!</p>)}
			 
				</div>
				 <div className="mint-list">
				 { allBookmarks.map((bookmark, index) => {
					 const ind = ((allBookmarks.length - 1) - index);
					 
					 const post = allPosts.find( ({ message }) => message === bookmark.message );
					 const mint = mints.find( ({ owner }) => owner.toLowerCase() === post.user.toLowerCase() );
					//console.log(allBookmarks);
					//const bookmark = allBookmarks.filter( ({ user }) => user.toLowerCase() === currentAccount.toLowerCase() );
					//console.log(bookmark);
					//const userBookmark = bookmark.find( ({ postId }) => postId === ind );
					//let bookmarkInd = allBookmarks.indexOf(userBookmark);
					//console.log(bookmarkInd);
					 const date = post.timestamp;
					 let newTime = date.toLocaleTimeString('en-US');
					let amPm = newTime.split(" ")[1];
					let seconds = newTime.split(":")[2].replace(amPm,'');
					let noSeconds = newTime.replace(":"+seconds,' ');
					let hour = newTime.split(":")[0];
					if(parseInt(hour)<9){
						noSeconds= "0"+noSeconds
					};
					console.log(noSeconds);
					 let month = months[date.getMonth()];
					 let dayNum = date.getDate();
					 let year = date.getFullYear();
						if (currentAccount.toLowerCase() === bookmark.user.toLowerCase() && !bookmark.hide)
						{ return (
							 <div className={ bookmark.user.toLowerCase() === userAcc.toLowerCase()  ? "mint-item" : "hide-item"} key={index}>
								 <img className="pin-icon" src={wallpin} alt="Edit button" />
								 <div className="content-data">
								 <div className="mint-owner"><p>{mint.owner.slice(0, 6)}...{mint.owner.slice(-4)}</p></div>
								 <div className="mint-owner"><p>{noSeconds} • {month} {dayNum}, {year}.</p></div>
								 </div>
								 <div className='mint-row'>
							  { (mint.avatar) ? <img alt="User avatar" className="avatar" src={mint.avatar} /> : <div className="no-avatar"></div>}
								
								  <p  onClick={() => { setUserAcc(mint.owner);
								  setProfile(true);
								
								}} className="underlined">{' '}{mint.name}{tld}{' '}</p>
								
								
								{ mint.owner.toLowerCase() === currentAccount.toLowerCase() ?
								  <button className="edit-button" onClick={() => editRecord(mint.name)}>
									<img className="edit-icon" src="https://img.icons8.com/metro/26/000000/pencil.png" alt="Edit button" />
								  </button>
								  :
								  null
								}
							  </div>
						{/*<p className="mint-bio"> {mint.record} </p>*/}
						{post.edit ? 
						(<div>
							<div className="text-edit-section">
						<textarea 
					//rows={textHeight} 
					placeholder="Click here to type..." 
					onChange={e => textChange(e)}
					//onClick={() => setLoad(0)}
					name="comments"
					className="text-input-box"
						value={newText}  />
						</div>
				<div className="public-section">
			<input 
			onChange={() => setPrivate(index, post.personal)}
			className="make-public" 
			type="checkbox" 
			id="private" 
			name="private" 
			value="private" />
			<label className="make-public-text" htmlFor="private">{post.personal ? "Share to Public" : "Add to Private Posts"}</label>
								</div>
								<div className="button-container">
				  {/*This will call the updateDomain function we just made*/}
				  <button className='cta-button cancel-button'  onClick={() => toggleEdit(index)}>
				  Cancel
				</button> 
				  {/*This will let us get out of editing mode by setting editing to false*/}
				  <button className='cta-button save-button' onClick={() => saveEdit(ind, post.personal)}>
					Save
				  </button>  
				</div>
								</div>)
						: 
						
						
						(
						<div className="post-section">
							<div className="text-section">
							
						{ (mint.owner.toLowerCase() === currentAccount.toLowerCase()) && (!textEdit) ?
									<div className="edit-container">
								  <button className="text-edit-button" onClick={() => editText(post.message, post.hide, index)}>
									Edit
								  </button></div>
								  :
								  null
								}
								
						<div className={ (mint.owner.toLowerCase() === currentAccount.toLowerCase()) && (!textEdit) ? "mint-text" : "mint-text-2"}>
							
							
								<p className="post-text">{post.message}</p>
						</div>
						</div>
						<div className="post-options">
						
							<div className="star-container"><button className="star-button" onClick={() => addBookmark(post.message, bookmark.hide, bookmark.postId, ind)}>
									<i className={"fa fa-star"} aria-hidden="true"></i>
								  </button>  
								  
								  <p className="bookmark-num">{post.totalBookmarks} {(post.totalBookmarks === 1) ? "Star" : "Stars"}</p>
								  </div> 
		
								  
							
								  { mint.owner.toLowerCase() === currentAccount.toLowerCase() && (<div><button className="hide-button" onClick={() => hideMsg(bookmark.postId, post.hide)}>
								<img className="privacy-icon" src={post.hide? "https://img.icons8.com/metro/fd9c34/color/privacy" : "https://img.icons8.com/metro/ffffff/privacy"} alt="Edit button" />
								  </button> 
								  </div>)}
								
								</div></div>)}
	
	
					  </div>)} 
	
				 })}
			  
			</div> 
			</div>)
		

	}
	else {
		if (currentAccount && mints.length > 0 && (!editProfile)) {
	  return (
		<div className="mint-container">
			<div className="mint-section">
			
		  {!profile && (<p className="mint-subtitle">Recent Posts!</p>)}
		 
			</div>
			{ profile ?  
			 <div className="mint-list">
			 { allPosts.map((post, index) => {
				 const ind = ((allPosts.length - 1) - index);
				 const mint = mints.find( ({ owner }) => owner.toLowerCase() === post.user.toLowerCase() );
				console.log(allBookmarks);
				const bookmark = allBookmarks.filter( ({ user }) => user.toLowerCase() === currentAccount.toLowerCase() );
				console.log(bookmark);
				const userBookmark = bookmark.find( ({ postId }) => postId === ind );
				let bookmarkInd = allBookmarks.indexOf(userBookmark);
				console.log(bookmarkInd);
				 const date = post.timestamp;
				 let newTime = date.toLocaleTimeString('en-US');
				let amPm = newTime.split(" ")[1];
				let seconds = newTime.split(":")[2].replace(amPm,'');
				let noSeconds = newTime.replace(":"+seconds,' ');
				let hour = newTime.split(":")[0];
				if(parseInt(hour)<9){
					noSeconds= "0"+noSeconds
				};
				console.log(noSeconds);
				 let month = months[date.getMonth()];
				 let dayNum = date.getDate();
				 let year = date.getFullYear();
					if (currentAccount.toLowerCase() === userAcc.toLowerCase())
					{ return (
						 <div className={ post.user.toLowerCase() === userAcc.toLowerCase()  ? "mint-item" : "hide-item"} key={index}>
							 <img className="pin-icon" src={wallpin} alt="Edit button" />
							 <div className="content-data">
							 <div className="mint-owner"><p>{mint.owner.slice(0, 6)}...{mint.owner.slice(-4)}</p></div>
							 <div className="mint-owner"><p>{noSeconds} • {month} {dayNum}, {year}.</p></div>
							 </div>
							 <div className='mint-row'>
						  { (mint.avatar) ? <img alt="User avatar" className="avatar" src={mint.avatar} /> : <div className="no-avatar"></div>}
							
							  <p  onClick={() => { setUserAcc(mint.owner);
							  setProfile(true);
							
							}} className="underlined">{' '}{mint.name}{tld}{' '}</p>
							
							
							{ mint.owner.toLowerCase() === currentAccount.toLowerCase() ?
							  <button className="edit-button" onClick={() => editRecord(mint.name)}>
								<img className="edit-icon" src="https://img.icons8.com/metro/26/000000/pencil.png" alt="Edit button" />
							  </button>
							  :
							  null
							}
						  </div>
					{/*<p className="mint-bio"> {mint.record} </p>*/}
					{post.edit ? 
					(<div>
						<div className="text-edit-section">
					<textarea 
                //rows={textHeight} 
                placeholder="Click here to type..." 
                onChange={e => textChange(e)}
                //onClick={() => setLoad(0)}
                name="comments"
                className="text-input-box"
                    value={newText}  />
					</div>
			<div className="public-section">
		<input 
		onChange={() => setPrivate(index, post.personal)}
		className="make-public" 
		type="checkbox" 
		id="private" 
		name="private" 
		value="private" />
		<label className="make-public-text" htmlFor="private">{post.personal ? "Share to Public" : "Add to Private Posts"}</label>
							</div>
							<div className="button-container">
              {/*This will call the updateDomain function we just made*/}
			  <button className='cta-button cancel-button'  onClick={() => toggleEdit(index)}>
              Cancel
            </button> 
              {/*This will let us get out of editing mode by setting editing to false*/}
              <button className='cta-button save-button' onClick={() => saveEdit(ind, post.personal)}>
                Save
              </button>  
            </div>
							</div>)
					: 
					
					
					(
					<div className="post-section">
						<div className="text-section">
						
					{ (mint.owner.toLowerCase() === currentAccount.toLowerCase()) && (!textEdit) ?
								<div className="edit-container">
							  <button className="text-edit-button" onClick={() => editText(post.message, post.hide, index)}>
								Edit
							  </button></div>
							  :
							  null
							}
							
					<div className={ (mint.owner.toLowerCase() === currentAccount.toLowerCase()) && (!textEdit) ? "mint-text" : "mint-text-2"}>
						
						
							<p className="post-text">{post.message}</p>
					</div>
					</div>
					<div className="post-options">
					{
						userBookmark ?
						<div className="star-container"><button className="star-button" onClick={() => addBookmark(post.message, userBookmark.hide, ind, bookmarkInd)}>
								<i className={userBookmark.hide ? "fa fa-star-o" : "fa fa-star"} aria-hidden="true"></i>
							  </button>
							  
							  <p className="bookmark-num">{post.totalBookmarks} {(post.totalBookmarks === 1) ? "Star" : "Stars"}</p>
							  </div> 
							  :
							  <div className="star-container"><button className="star-button" onClick={() => addBookmark(post.message, true, ind, index)}>
							  <i className="fa fa-star-o" aria-hidden="true"></i>
							</button>
							
							<p className="bookmark-num">{post.totalBookmarks} {(post.totalBookmarks === 1) ? "Star" : "Stars"}</p>
							</div> 
							  }
						
							  { mint.owner.toLowerCase() === currentAccount.toLowerCase() && (<div><button className="hide-button" onClick={() => hideMsg(ind, post.hide)}>
							<img className="privacy-icon" src={post.hide? "https://img.icons8.com/metro/fd9c34/color/privacy" : "https://img.icons8.com/metro/ffffff/privacy"} alt="Edit button" />
							  </button> 
							  </div>)}
							
							</div></div>)}


				  </div>)} else { return (
						 <div className={ post.user.toLowerCase() === userAcc.toLowerCase() && (!post.hide) ? "mint-item" : "hide-item"} key={index}>
							 <img className="pin-icon" src={wallpin} alt="Edit button" />
							 <div className="content-data">
							 <div className="mint-owner"><p>{mint.owner.slice(0, 6)}...{mint.owner.slice(-4)}</p></div>
							 <div className="mint-owner"><p>{noSeconds} • {month} {dayNum}, {year}.</p></div>
							 </div>
							 <div className='mint-row'>
						  { (mint.avatar) ? <img alt="User avatar" className="avatar" src={mint.avatar} /> : <div className="no-avatar"></div>}
							
							  <p  onClick={() => { setUserAcc(mint.owner);
							  setProfile(true);
							
							}} className="underlined">{' '}{mint.name}{tld}{' '}</p>
							
							
							{ mint.owner.toLowerCase() === currentAccount.toLowerCase() ?
							  <button className="edit-button" onClick={() => editRecord(mint.name)}>
								<img className="edit-icon" src="https://img.icons8.com/metro/26/000000/pencil.png" alt="Edit button" />
							  </button>
							  :
							  null
							}
						  </div>
					{/*<p className="mint-bio"> {mint.record} </p>*/}
					{post.edit ? 
					(<div>
						<div className="text-edit-section">
					<textarea 
                //rows={textHeight} 
                placeholder="Click here to type..." 
                onChange={e => textChange(e)}
                //onClick={() => setLoad(0)}
                name="comments"
                className="text-input-box"
                    value={newText}  />
					</div>
			<div className="public-section">
		<input 
		onChange={() => setPrivate(index, post.personal)}
		className="make-public" 
		type="checkbox" 
		id="private" 
		name="private" 
		value="private" />
		<label className="make-public-text" htmlFor="private">{post.personal ? "Share to Public" : "Add to Private Posts"}</label>
							</div>
							<div className="button-container">
              {/*This will call the updateDomain function we just made*/}
			  <button className='cta-button cancel-button'  onClick={() => toggleEdit(index)}>
              Cancel
            </button> 
              {/*This will let us get out of editing mode by setting editing to false*/}
              <button className='cta-button save-button' onClick={() => saveEdit(ind, post.personal)}>
                Save
              </button>  
            </div>
							</div>)
					: 
					
					
					(
					<div className="post-section">
						<div className="text-section">
						
					{ (mint.owner.toLowerCase() === currentAccount.toLowerCase()) && (!textEdit) ?
								<div className="edit-container">
							  <button className="text-edit-button" onClick={() => editText(post.message, post.hide, index)}>
								Edit
							  </button></div>
							  :
							  null
							}
							
					<div className={ (mint.owner.toLowerCase() === currentAccount.toLowerCase()) && (!textEdit) ? "mint-text" : "mint-text-2"}>
						
						
							<p className="post-text">{post.message}</p>
					</div>
					</div>
					<div className="post-options">
					{
						userBookmark ?
						<div className="star-container"><button className="star-button" onClick={() => addBookmark(post.message, userBookmark.hide, ind, bookmarkInd)}>
								<i className={userBookmark.hide ? "fa fa-star-o" : "fa fa-star"} aria-hidden="true"></i>
							  </button>
							  
							  <p className="bookmark-num">{post.totalBookmarks} {(post.totalBookmarks === 1) ? "Star" : "Stars"}</p>
							  </div> 
							  :
							  <div className="star-container"><button className="star-button" onClick={() => addBookmark(post.message, true, ind, index)}>
							  <i className="fa fa-star-o" aria-hidden="true"></i>
							</button>
							
							<p className="bookmark-num">{post.totalBookmarks} {(post.totalBookmarks === 1) ? "Star" : "Stars"}</p>
							</div> 
							  }
						
							  { mint.owner.toLowerCase() === currentAccount.toLowerCase() && (<div><button className="hide-button" onClick={() => hideMsg(ind, post.hide)}>
							<img className="privacy-icon" src={post.hide? "https://img.icons8.com/metro/fd9c34/color/privacy" : "https://img.icons8.com/metro/ffffff/privacy"} alt="Edit button" />
							  </button> 
							  </div>)}
							
							</div></div>)}


				  </div>)}
					
				})}

			 
		  
		</div> 
							:

		  <div className="mint-list">
			{ allPosts.map((post, index) => {
				const ind = ((allPosts.length - 1) - index);
				const mint = mints.find( ({ owner }) => owner.toLowerCase() === post.user.toLowerCase() );
				console.log(allBookmarks);
				const bookmark = allBookmarks.filter( ({ user }) => user.toLowerCase() === currentAccount.toLowerCase() );
				console.log(bookmark);
				const userBookmark = bookmark.find( ({ postId }) => postId === ind );
				let bookmarkInd = allBookmarks.indexOf(userBookmark);
				console.log(bookmarkInd);
				const date = post.timestamp;
				let newTime = date.toLocaleTimeString('en-US');
				let amPm = newTime.split(" ")[1];
				let seconds = newTime.split(":")[2].replace(amPm,'');
				let noSeconds = newTime.replace(":"+seconds,' ');
				let hour = newTime.split(":")[0];
				if(parseInt(hour)<9){
					noSeconds= "0"+noSeconds
				};
				console.log(noSeconds);
				{/*let dayString = days[date.getDay()];*/}
				let month = months[date.getMonth()];
				let dayNum = date.getDate();
				let year = date.getFullYear();

					return (
						<div className={post.hide? "hide-item" : "mint-item"} key={index}>
							<img className="pin-icon" src={wallpin} alt="Edit button" />
							<div className="content-data">
							<div className="mint-owner"><p>{mint.owner.slice(0, 6)}...{mint.owner.slice(-4)}</p></div>
							
							<div className="mint-owner"><p>{noSeconds} • {month} {dayNum}, {year}.</p></div>
							</div>
						  <div className='mint-row'>
						  { (mint.avatar) ? <img alt="User avatar" className="avatar" src={mint.avatar} /> : <div className="no-avatar"></div>}
							
							  <p onClick={() => { setUserAcc(mint.owner);
							  setProfile(true);
							  window.scrollTo(0,0);
							
							}} className="underlined">{' '}{mint.name}{tld}{' '}</p>
							
							
							{ mint.owner.toLowerCase() === currentAccount.toLowerCase() ?
							  <button className="edit-button" onClick={() => editRecord(mint.name)}>
								<img className="edit-icon" src="https://img.icons8.com/metro/26/000000/pencil.png" alt="Edit button" />
							  </button>
							  :
							  null
							}
						  </div>
					{/*<p className="mint-bio"> {mint.record} </p>*/}
					{post.edit ? 
					(<div>
						<div className="text-edit-section">
					<textarea 
                //rows={textHeight} 
                placeholder="Click here to type..." 
                onChange={e => textChange(e)}
                //onClick={() => setLoad(0)}
                name="comments"
                className="text-input-box"
                    value={newText}  />
					</div>
			<div className="public-section">
		<input 
		onChange={() => setPrivate(index, post.personal)}
		className="make-public" 
		type="checkbox" 
		id="private" 
		name="private" 
		value="private" />
		<label className="make-public-text" htmlFor="private">{post.personal ? "Share to Public" : "Add to Private Posts"}</label>
							</div>
							<div className="edit-button-container">
              {/*This will call the updateDomain function we just made*/}
			  <button className='cta-button cancel-button'  onClick={() => toggleEdit(index)}>
              Cancel
            </button> 
              {/*This will let us get out of editing mode by setting editing to false*/}
              <button className='cta-button save-button' onClick={() => saveEdit(ind, post.personal)}>
                Save
              </button>  
            </div>
							</div>)
					: 
					
					
					(
					<div className="post-section">
						<div className="text-section">
						
					{ (mint.owner.toLowerCase() === currentAccount.toLowerCase()) && (!textEdit) ?
								<div className="edit-container">
							  <button className="text-edit-button" onClick={() => editText(post.message, post.hide, index)}>
								Edit
							  </button></div>
							  :
							  null
							}
							
					<div className={ (mint.owner.toLowerCase() === currentAccount.toLowerCase()) && (!textEdit) ? "mint-text" : "mint-text-2"}>
						
						
							<p className="post-text">{post.message}</p>
					</div>
					</div>
					<div className="post-options">
					{
						userBookmark ?
						<div className="star-container"><button className="star-button" onClick={() => addBookmark(post.message, userBookmark.hide, ind, bookmarkInd)}>
								<i className={userBookmark.hide ? "fa fa-star-o" : "fa fa-star"} aria-hidden="true"></i>
							  </button>
							  
							  <p className="bookmark-num">{post.totalBookmarks} {(post.totalBookmarks === 1) ? "Star" : "Stars"}</p>
							  </div> 
							  :
							  <div className="star-container"><button className="star-button" onClick={() => addBookmark(post.message, true, ind, index)}>
							  <i className="fa fa-star-o" aria-hidden="true"></i>
							</button>
							
							<p className="bookmark-num">{post.totalBookmarks} {(post.totalBookmarks === 1) ? "Star" : "Stars"}</p>
							</div> 
							  }
						
							  { mint.owner.toLowerCase() === currentAccount.toLowerCase() && (<div><button className="hide-button" onClick={() => hideMsg(ind, post.hide)}>
							<img className="privacy-icon" src={post.hide? "https://img.icons8.com/metro/fd9c34/color/privacy" : "https://img.icons8.com/metro/ffffff/privacy"} alt="Edit button" />
							  </button> 
							  </div>)}
							
							</div></div>)}


				  </div>)
					
				})}

			 
		  
		</div> 	
		}
	  </div>);
	}
}
  };
  
  const addBookmark = async (msg, hide, id, index) => {
	const result = mints.find( ({ owner }) => owner.toLowerCase() === currentAccount.toLowerCase() );
	//console.log(result.name);
	  if (!result) { return }
	try {
		const { ethereum } = window;
		if (ethereum) {
		  // You know all this
		  const provider = new ethers.providers.Web3Provider(ethereum);
		  const signer = provider.getSigner();
		  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

			if (hide)
		 { 
			 const textTxn = await contract.bookmark(msg, false, id, 0);

			 console.log("Mining...", textTxn.hash);
		

		  await textTxn.wait();
		  console.log("Mined -- ", textTxn.hash);
			}
		 else if (hide == undefined) {
			const textTxn = await contract.bookmark(msg, false, id, 0);

			console.log("Mining...", textTxn.hash);
		

		  await textTxn.wait();
		  console.log("Mined -- ", textTxn.hash);
		 }
		 else {
			const textTxn = await contract.bookmark(msg, true, id, index);

			console.log("Mining...", textTxn.hash);
		

		  await textTxn.wait();
		  console.log("Mined -- ", textTxn.hash);
		 }
        

		  window.location.reload();

		} 
	} catch(error){
			console.log(error);
		  }
  }

  // This will take us into edit mode and show us the edit buttons!
  const editRecord = async (name) => {
	const result = mints.find( ({ owner }) => owner.toLowerCase() === currentAccount.toLowerCase() );
	//console.log(result.name);
	  if (!result) { return }
	console.log("Editing record for", name);
	setProfile(false);
	setProfileEdit(true);
	setDomain(name);
	setEditProfile(true);
	
	
	
	try {
		const { ethereum } = window;
		if (ethereum) {
		  // You know all this
		  const provider = new ethers.providers.Web3Provider(ethereum);
		  const signer = provider.getSigner();
		  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

		  const bioRecord = await contract.bioRecords(name);
		  const emailRecord = await contract.emailRecords(name);
		  const avatarLink = await contract.avatars(name);

		  setRecord({bio: bioRecord, email: emailRecord, avatar: avatarLink});


			
		  
		} 
	} catch(error){
			console.log(error);
		  }
		window.scrollTo(500,500);

  }


  const setPrivate = (id, personal) => {
	setAllPosts(prevState => prevState.map((post, index) => {
		return index === id ?
		{...post, personal: !personal} : post
}
));
  }

  const toggleEdit = (id) => {
	setAllPosts(prevState => prevState.map((post, index) => {
		return index === id ?
		{...post, edit: false, personal: false} : post
}
));
	setTextEdit(false);
  }

  const editText = (post, hide, id) => {
	//console.log("Editing record for", name);
	if (textEdit) {return};
	setTextEdit(true);
	setNewText(post);
	setAllPosts(prevState => prevState.map((post, index) => {
		return index === id ?
		{...post, edit: true, personal: hide} : post
}
));
  }

  function handleChange(event) {
	setText(event.target.value);
	 console.log( event.target.rows); 
const height = event.target.scrollHeight; 
const rowHeight = 23; 
const trows = Math.ceil(height / rowHeight) - 1; 

if (trows) { 
  
  setTextareaheight(trows); 
  
} 
}

function bioChange(event) {
	setRecord(prevRecord => ({...prevRecord, bio: event.target.value}))
	 console.log( event.target.rows); 
const height = event.target.scrollHeight; 
const rowHeight = 30; 
const trows = Math.ceil(height / rowHeight) - 1; 

if (trows) { 
  
	setTextHeight(trows); 
  
} 
}

function textChange(event) {
	setNewText(event.target.value);
	 /*console.log( event.target.rows); 
const height = event.target.scrollHeight; 
const rowHeight = 30; 
const trows = Math.ceil(height / rowHeight) - 1; 

if (trows) { 
  
	setTextHeight(trows); 
  
}*/ 
}



const saveEdit = async (id, personal) => {
	const post = allPosts.filter( ({ user }) => user.toLowerCase() === currentAccount.toLowerCase() );
	console.log(post);
	const postText = post.find( ({ message }) => message === newText );
	console.log(postText);
	if (postText && (postText.hide === personal)) {return};
	setTextEdit(false);
	try {
		const { ethereum } = window;
		if (ethereum) {
		  // You know all this
		  const provider = new ethers.providers.Web3Provider(ethereum);
		  const signer = provider.getSigner();
		  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

		  const textTxn = await contract.editPost(newText, personal, id);
        
		  console.log("Mining...", textTxn.hash);
		

		  await textTxn.wait();
		  console.log("Mined -- ", textTxn.hash);

		  setAllPosts(prevState => prevState.map((post, index) => {
			return index === id ?
			{...post, edit: false} : post
	}
	));

	window.location.reload();

		} 
	} catch(error){
			console.log(error);
		  }
}

const hideMsg = async (id, hide) => {
	try {
		if (hide)
		{
			const { ethereum } = window;
		if (ethereum) {
		  // You know all this
		  const provider = new ethers.providers.Web3Provider(ethereum);
		  const signer = provider.getSigner();
		  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

		  const textTxn = await contract.hidePost(false, id);
        
		  console.log("Mining...", textTxn.hash);
		

		  await textTxn.wait();
		  console.log("Mined -- ", textTxn.hash);

		  window.location.reload();

		} 
	} else {
		const { ethereum } = window;
		if (ethereum) {
		  // You know all this
		  const provider = new ethers.providers.Web3Provider(ethereum);
		  const signer = provider.getSigner();
		  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

		  const textTxn = await contract.hidePost(true, id);
        
		  console.log("Mining...", textTxn.hash);
		

		  await textTxn.wait();
		  console.log("Mined -- ", textTxn.hash);

		  window.location.reload();
	} 

	
}
	} catch(error){
			console.log(error);
		  }
}

const sharePost = async () => {
	try {
		const { ethereum } = window;
		if (ethereum) {
		  // You know all this
		  const provider = new ethers.providers.Web3Provider(ethereum);
		  const signer = provider.getSigner();
		  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

		  const mint = mints.find( ({ owner }) => owner.toLowerCase() === currentAccount.toLowerCase() );

		  let userPostCount = await contract.getUserTotalPosts(mint.name);
		  console.log("Retrieved total posts by user...", userPostCount.toNumber());

		 
		  const textTxn = await contract.addPost(mint.name, text, notPublic, 0);
        
		  console.log("Mining...", textTxn.hash);
		

		  await textTxn.wait();
		  console.log("Mined -- ", textTxn.hash);

		  let userPostCount2 = await contract.getUserTotalPosts(mint.name);
		  console.log("Retrieved total posts by user...", userPostCount2.toNumber());

		  setText("");

		  window.location.reload();
		  

		} else {
			console.log("Ethereum object doesn't exist!");
		  }
	} catch(error) {
		console.log(error);
	}
}

useEffect(() => {
	let contract;
  
	const onNewPost = (from, message, timestamp, hide) => {
	  console.log("NewPost", from, message, timestamp, hide);
	  setAllPosts(prevState => [
		...prevState,
		{
		  user: from,
		  message: message,
		  timestamp: new Date(timestamp * 1000),
		  hide: hide,
		  edit: false,
		  personal: false,
		},
	  ]);
	};

	const onEditedPost = (message, timestamp, hide, id) => {
		console.log("EditedPost", message, timestamp, hide, id);
		setAllPosts(prevState => prevState.map((post, index) => {
			return index === id ?
			{...post, message: message, timestamp: new Date(timestamp * 1000), hide: hide} : post
}
));
	  };

	  const onHiddenPost = (hide, id) => {
		console.log("HiddenPost", hide, id);
		setAllPosts(prevState => prevState.map((post, index) => {
			return index === id ?
			{...post, hide: hide} : post
}
));
	  };
  
	if (window.ethereum) {
	  const provider = new ethers.providers.Web3Provider(window.ethereum);
	  const signer = provider.getSigner();
  
	  contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);
	  contract.on("NewPost", onNewPost);
	  contract.on("EditedPost", onEditedPost);
	  contract.on("HiddenPost", onHiddenPost);

	}
  
	return () => {
	  if (contract) {
		contract.off("NewPost", onNewPost);
		contract.off("EditedPost", onEditedPost);
		contract.off("HiddenPost", onHiddenPost);
	  }
	};
  }, []);

  const renderWrongNetwork = () => {
	  // If not on Polygon Mumbai Testnet, render "Please connect to Polygon Mumbai Testnet"
	if (currentAccount && (network !== 'Polygon Mumbai Testnet')) {
		return (
		  <div className="wrong-network-text">
			<p>Please connect to the Polygon Mumbai Testnet</p>
			  <button className='cta-button network-button' disabled={null} onClick={switchNetwork}>
				  Connect
			  </button>  
			</div>
		);
	  }
  }

  const renderInputForm = () =>{
			const user = mints.find( ({ owner }) => owner.toLowerCase() === userAcc.toLowerCase() );
			console.log(user);
			const starredByUser = allBookmarks.filter( ({ user }) => user.toLowerCase() === currentAccount.toLowerCase() );
			console.log(starredByUser);
			const wasStarred = starredByUser.find( ({ hide }) => hide === false);
			console.log(wasStarred);
	return (
		<div className={(network === 'Polygon Mumbai Testnet') ? "container" : currentAccount? "wrong-network-container" : "container"}>
        <div className="header-container">
          <header>
            <div className="left">
		
            {(!profile) && (<p className="title"><span className="title-2">Document. Every.</span><span className="title-2">Ship.</span></p>)}
            { currentAccount && (!profile)? (<div className="right">
      <img alt="Network logo" className="logo" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />
       <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> 
    </div>) : null}
				{ profile && (
					<div>
						<img className="subtitle-pin-icon-0" src={wallpin} alt="Edit button" />
				<div className="profile-section">
				
					<div className="profile-section-0">
						
					{ (user.avatar) ? <img alt="User avatar" className="avatar-profile" src={user.avatar} /> : <div className="no-user-avatar"></div>}
					
						<div className="profile-section-1">
							<div className="profile-section-2">
								<div className="profile-edit">
								
								<h1>{' '}{user.name}{tld}{' '}</h1>
								{ userAcc.toLowerCase() === currentAccount.toLowerCase() ?
							  <button className="edit-button" onClick={() => editRecord(user.name)}>
								<img className="edit-icon" src="https://img.icons8.com/metro/26/000000/pencil.png" alt="Edit button" />
							  </button>
							  :
							  null
							}
							
							</div>
						<div className="nft-link-section"><a href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${user.id}`} target="_blank">View Domain on Opensea →</a></div>
						</div><p>{user.record}</p></div>
						</div>
						</div>
						<div className="total-posts">Total Posts: {user.totalPosts} </div>
						<div className="testnet-link-section-2"><a href="https://mumbaifaucet.com/" target="_blank">💸 You'll need some testnet funds to use this site, get some here →</a></div>
						 <div className="profile-posts-container">
						 {(user.totalPosts >= 1 ) && <p className="recent-posts">{starredPosts? "Starred Posts" : "Recent Posts"}</p>
					

				}
							{(currentAccount.toLowerCase() === userAcc.toLowerCase()) && wasStarred ? starredPosts ? 
							<button className='cta-button starred-button'  onClick={() => setStarredPosts(false)}>
							Back
						  </button>
							: <button className='cta-button starred-button'  onClick={() => setStarredPosts(true)}>
              Starred Posts
            </button> : null
			} 
						</div>
				</div>)}
			{(!profile) && (<div className={profileEdit ? "hide-item" : mints.find( ({ owner }) => owner.toLowerCase() === currentAccount.toLowerCase() ) ? "subtitle-section-2" : "subtitle-section-1" }>
			<img className="subtitle-pin-icon" src={wallpin} alt="Edit button" />
			{ mints.find( ({ owner }) => owner.toLowerCase() === currentAccount.toLowerCase() ) ? <p className="subtitle"><span className="subtitle-1">🚢 What did you ship today buildooor!</span>📝 a ship could be your first or latest smart contract, hackathon, deployed dApp, start-up!?, content posted online, completed course,  job!?, or you could just post about how it's going lol<span className="subtitle-2">*️⃣ Tap the star icon to star your favourite posts and tap the lock icon to make your posts private (only can you see them).</span></p> : <p className="subtitle">📝 Post about your latest ships and have your words immortalized on the buildspace wall of fame! - to get started connect an ethereum wallet, get testnet funds and mint a cool domain to save some lil info, ezpz.</p>}
            </div>)}
			
			{(!profile) && (<div className="testnet-link-section"><a href="https://mumbaifaucet.com/" target="_blank">💸 You'll need some testnet funds to use this site, get some here →</a></div>)}</div>
			 {/* Display a logo and wallet connection status*/}
			 
          </header>
        </div>
		{ mints.find( ({ owner }) => owner.toLowerCase() === currentAccount.toLowerCase() ) && (!editProfile)  ? 
		
		<div className={profile? "hide-item" : "form-container" }>
			<div className="first-row">
				<textarea 
                rows={textareaheight} 
                placeholder="Click here to type..." 
                onChange={e => handleChange(e)}
                //onClick={() => setLoad(0)}
                name="comments"
                className="post-input-box"
                    value={text}  />
					
			<div className="second-row">
			<div className="private-section">
		<input 
		onChange={() => {setNotPublic(prevSet => !prevSet); console.log("Private Post");}}
		className="not-private" 
		type="checkbox" 
		id="private" 
		name="private" 
		value="private" />
		<label htmlFor="private">Private Post</label></div>

		
            <button className='cta-button share-button'  onClick={sharePost}>
              Share
            </button>  
          </div>
		
			</div>
			</div>
		
		:  
		
		<div className={profile? "hide-item" : "form-container" }>
			<div className="first-row">
				<input
					type="text"
					maxlength="8"
					value={domain}
					placeholder='domain ≤ 8 characters'
					onChange={e => setDomain(e.target.value)}
				/>
				<p className='tld'> {tld} </p>
			</div>
			<input
				type="email"
				value={record.email}
				placeholder='email'
				onChange={e => setRecord(prevRecord => ({...prevRecord, email: e.target.value}))}
			/>
			<input
				type="text"
				value={record.avatar}
				placeholder='avatar/photo link'
				onChange={e => setRecord(prevRecord => ({...prevRecord, avatar: e.target.value}))}
			/>
			<textarea
				rows={textHeight}
				className="input"
				type="text"
				maxlength="200"
				value={record.bio}
				placeholder='little intro'
				onChange={e => bioChange(e)}
			/>

			 {/* If the editing variable is true, return the "Set record" and "Cancel" button */}
			 {profileEdit ? (
            <div className="button-container">
				{/*This will let us get out of editing mode by setting editing to false*/}
				<button className='cta-button cancel-edit-button' onClick={() => {setEditProfile(false); setProfileEdit(false)}}>
                Cancel
              </button> 
              {/*This will call the updateDomain function we just made*/}
              <button className='cta-button set-rec-button' disabled={loading} onClick={updateDomain}>
                Save
              </button>  
               
            </div>
          ) : (
            // If editing is not true, the mint button will be returned instead
            <button className='cta-button mint-button' disabled={loading} onClick={mintDomain}>
              Mint
            </button>  
          )}

		</div>}
		{mints && renderMints()}
		</div>
	);
}


  // Create a function to render if wallet is not connected yet
  /*const renderNotConnectedContainer = () => (
	<div className="container">
	<div className="header-container">
	  <header>
		<div className="left">
		<p className="title">🧑🏽‍💻 NBA Name Service</p>
		<p className="subtitle">Your tech profile live on the blockchain!</p>
		</div>
		 {/* Display a logo and wallet connection status}
		 <div className="right">
  <img alt="Network logo" className="logo" src={ network.includes("Polygon") ? polygonLogo : ethLogo} />
  { currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p> }
</div>
	  </header>
	</div>
    <div className="connect-wallet-container">
      <img src="https://media2.giphy.com/media/qgQUggAC3Pfv687qPC/giphy.gif?cid=ecf05e47tem3f1muyiea1ojxipbqkbyvao1rzgv7q7fpukkz&rid=giphy.gif&ct=g" alt="techie gif" />
      <button onClick={connectWallet} className="cta-button connect-wallet-button">
        Connect Wallet
      </button>
    </div>
	</div>
    ); */

  // This runs our function when the page loads.
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
	  <div>
    <div className="App"></div>
	<nav className="white-bar"><p>buildspace Wall of Fame <span>.gtfol</span></p>
	{!currentAccount && (<button onClick={connectWallet} className="connect-button">Connect Wallet</button>)}
	{currentAccount && mints.find( ({ owner }) => owner.toLowerCase() === currentAccount.toLowerCase() ) &&
	(
	<div className="profile-btn-container">
			{(profile) && (<button className='cta-button profile-button'   onClick={() => { setUserAcc(currentAccount.toLowerCase());
							  setProfile(false);
							  setStarredPosts(false);
							
							}}>
              Back
            </button>)} 
	<button  onClick={() => { setUserAcc(currentAccount.toLowerCase());
							  setProfile(true);
							  window.scrollTo(0,0);
							}} className="cta-button connect-button">My Profile</button>

							</div>
							)}
	</nav>
         {/* Hide the connect button if currentAccount isn't empty*/}
		 {/* Render the input form if an account is connected */}
		 {renderInputForm()}
		 {renderWrongNetwork()}

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a className="footer-text" 
            href={TWITTER_LINK} 
            target="_blank"
            rel="noreferrer">
              {`built with @${TWITTER_HANDLE}`}
          </a>
        </div>
	  </div>
  );
};

export default App;
