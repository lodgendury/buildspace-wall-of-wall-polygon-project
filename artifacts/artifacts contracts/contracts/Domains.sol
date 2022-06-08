// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

// We first import some OpenZeppelin Contracts.
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import {StringUtils} from "./libraries/StringUtils.sol";
// We import another help function
import {Base64} from "./libraries/Base64.sol";

import "hardhat/console.sol";

error Unauthorized();
error AlreadyRegistered();
error InvalidName(string name);

// We inherit the contract we imported. This means we'll have access
// to the inherited contract's methods.
contract Domains is ERC721URIStorage {
  // Magic given to us by OpenZeppelin to help us keep track of tokenIds.
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

    string public tld;

    uint256 allPosts;

  string svgPartOne = '<svg xmlns="http://www.w3.org/2000/svg" width="270" height="270" fill="none"><path fill="url(#B)" d="M0 0h270v270H0z"/><defs><filter id="A" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse" height="270" width="270"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity=".225" width="200%" height="200%"/></filter></defs><path d="M72.863 42.949c-.668-.387-1.426-.59-2.197-.59s-1.529.204-2.197.59l-10.081 6.032-6.85 3.934-10.081 6.032c-.668.387-1.426.59-2.197.59s-1.529-.204-2.197-.59l-8.013-4.721a4.52 4.52 0 0 1-1.589-1.616c-.384-.665-.594-1.418-.608-2.187v-9.31c-.013-.775.185-1.538.572-2.208a4.25 4.25 0 0 1 1.625-1.595l7.884-4.59c.668-.387 1.426-.59 2.197-.59s1.529.204 2.197.59l7.884 4.59a4.52 4.52 0 0 1 1.589 1.616c.384.665.594 1.418.608 2.187v6.032l6.85-4.065v-6.032c.013-.775-.185-1.538-.572-2.208a4.25 4.25 0 0 0-1.625-1.595L41.456 24.59c-.668-.387-1.426-.59-2.197-.59s-1.529.204-2.197.59l-14.864 8.655a4.25 4.25 0 0 0-1.625 1.595c-.387.67-.585 1.434-.572 2.208v17.441c-.013.775.185 1.538.572 2.208a4.25 4.25 0 0 0 1.625 1.595l14.864 8.655c.668.387 1.426.59 2.197.59s1.529-.204 2.197-.59l10.081-5.901 6.85-4.065 10.081-5.901c.668-.387 1.426-.59 2.197-.59s1.529.204 2.197.59l7.884 4.59a4.52 4.52 0 0 1 1.589 1.616c.384.665.594 1.418.608 2.187v9.311c.013.775-.185 1.538-.572 2.208a4.25 4.25 0 0 1-1.625 1.595l-7.884 4.721c-.668.387-1.426.59-2.197.59s-1.529-.204-2.197-.59l-7.884-4.59a4.52 4.52 0 0 1-1.589-1.616c-.385-.665-.594-1.418-.608-2.187v-6.032l-6.85 4.065v6.032c-.013.775.185 1.538.572 2.208a4.25 4.25 0 0 0 1.625 1.595l14.864 8.655c.668.387 1.426.59 2.197.59s1.529-.204 2.197-.59l14.864-8.655c.657-.394 1.204-.95 1.589-1.616s.594-1.418.609-2.187V55.538c.013-.775-.185-1.538-.572-2.208a4.25 4.25 0 0 0-1.625-1.595l-14.993-8.786z" fill="#fff"/><defs><linearGradient id="B" x1="0" y1="0" x2="270" y2="270" gradientUnits="userSpaceOnUse"><stop stop-color="#cb5eee"/><stop offset="1" stop-color="#0cd7e4" stop-opacity=".99"/></linearGradient></defs><text x="32.5" y="231" font-size="27" fill="#fff" filter="url(#A)" font-family="Plus Jakarta Sans,DejaVu Sans,Noto Color Emoji,Apple Color Emoji,sans-serif" font-weight="bold">';
  string svgPartTwo = '</text></svg>';

  event NewPost(address indexed from, string message, uint256 timestamp, bool hide, uint totalBookmarks);
  event EditedPost(string message, uint256 timestamp, bool hide, uint id);
  event HiddenPost(bool hide, uint id);

struct Post {// The address of the user who waved.
        address user;
        string message; // The message the user sent.
        uint256 timestamp; // The timestamp when the user waved.
        bool hide;
        uint256 totalBookmarks;
    }

    struct Bookmark {// The address of the user who waved.
        address user;
        string message; // The message the user sent.
        bool hide;
        uint256 postId;
    }

 
  mapping(string => address) public domains;
  mapping (uint => string) public names;
  // Checkout our new mapping! This will store values
  mapping(string => string) public bioRecords;
  mapping(string => string) public emailRecords;
  mapping(string => uint256) public totalPosts;
  mapping(string => string) public avatars;
  //mapping(string => Post[]) public messages;
  Post[] posts;
  Bookmark[] bookmarks;


  

  
  address payable public owner;
  

  constructor(string memory _tld) payable ERC721("buildspace Wall of Fame", "GTFOL") {
    owner = payable(msg.sender);
    tld = _tld;
    console.log("%s name service deployed", _tld);
  }
  function valid(string calldata name) public pure returns(bool) {
  return StringUtils.strlen(name) >= 3 && StringUtils.strlen(name) <= 12;
}

function bookmark(string memory _message, bool _hide, uint _id, uint ind) public {
        if (_hide == false)
        {
          bookmarks.push(Bookmark(msg.sender, _message, _hide, _id));
        posts[_id].totalBookmarks += 1;
        } else {
          bookmarks[ind].hide = _hide;
          posts[_id].totalBookmarks -= 1;
        }
        }

    function addPost(string calldata name, string memory _message, bool _hide, uint fav) public {
      require(domains[name] == msg.sender);
        posts.push(Post(msg.sender, _message, block.timestamp, _hide, fav));
        allPosts += 1;
        totalPosts[name] += 1;
        console.log("%s now has %d posts", name, totalPosts[name]);
        emit NewPost(msg.sender, _message, block.timestamp, _hide, fav);
    }

    function editPost(string memory _message, bool _hide, uint _id) public {
           require(posts[_id].user == msg.sender);
            posts[_id].message = _message;
            posts[_id].hide = _hide;
            posts[_id].timestamp = block.timestamp;

            emit EditedPost(_message, block.timestamp, _hide, _id);
    }

    function hidePost(bool _hide, uint _id) public {
          require(posts[_id].user == msg.sender);
          posts[_id].hide = _hide;

          emit HiddenPost(_hide, _id);
    }

     function getPosts() public view returns(Post[] memory) {
      return posts;
  }

  function getBookmarks() public view returns(Bookmark[] memory) {
      return bookmarks;
  }

  function getUserTotalPosts(string calldata name) public view returns(uint256) {
     return totalPosts[name];
  }

  /*function getNumOfAllPosts() public view returns(uint256) {
    return allPosts;
  }*/

	function getAllNames() public view returns (string[] memory) {
  console.log("Getting all names from contract");
  string[] memory allNames = new string[](_tokenIds.current());
  for (uint i = 0; i < _tokenIds.current(); i++) {
    allNames[i] = names[i];
    console.log("Name for token %d is %s", i, allNames[i]);
  }

  return allNames;
}
  // This function will give us the price of a domain based on length
  function price(string calldata name) public pure returns(uint) {
    uint len = StringUtils.strlen(name);
    require(len > 0);
    if (len == 3) {
      return 5 * 10**17; // 5 MATIC = 5 000 000 000 000 000 000 (18 decimals). We're going with 0.5 Matic cause the faucets don't give a lot
    } else if (len == 4) {
      return 3 * 10**17; // To charge smaller amounts, reduce the decimals. This is 0.3
    } else {
      return 1 * 10**17;
    }
  }

  function register(string calldata name) public payable{
      // Check that the name is unregistered
    if (domains[name] != address(0)) revert AlreadyRegistered();
    if (!valid(name)) revert InvalidName(name);
    
    uint _price = price(name);

    // Check if enough Matic was paid in the transaction
    require(msg.value >= _price, "Not enough Matic paid");

     // Combine the name passed into the function  with the TLD
    string memory _name = string(abi.encodePacked(name, ".", tld));
    // Create the SVG (image) for the NFT with the name
    string memory finalSvg = string(abi.encodePacked(svgPartOne, _name, svgPartTwo));
    uint256 newRecordId = _tokenIds.current();
    uint256 length = StringUtils.strlen(name);
    string memory strLen = Strings.toString(length);

    console.log("Registering %s.%s on the contract with tokenID %d", name, tld, newRecordId);

    // Create the JSON metadata of our NFT. We do this by combining strings and encoding as base64
    string memory json = Base64.encode(
      abi.encodePacked(
        '{"name": "',
        _name,
        '", "description": "A domain on the buildspace Wall of Fame", "image": "data:image/svg+xml;base64,',
        Base64.encode(bytes(finalSvg)),
        '","length":"',
        strLen,
        '"}'
      )
    );

    string memory finalTokenUri = string( abi.encodePacked("data:application/json;base64,", json));

    console.log("\n--------------------------------------------------------");
    console.log("Final tokenURI", finalTokenUri);
    console.log("--------------------------------------------------------\n");

    _safeMint(msg.sender, newRecordId);
    _setTokenURI(newRecordId, finalTokenUri);
    domains[name] = msg.sender;
    console.log("%s has registered a domain!", msg.sender);

    _tokenIds.increment();
    names[newRecordId] = name;
  }

  function getAddress(string calldata name) public view returns (address) {
      // Check that the owner is the transaction sender
      return domains[name];
  }

  function setRecord(string calldata name, string calldata bio, string calldata email, string calldata avatar) public {
      // Check that the owner is the transaction sender
       if (msg.sender != domains[name]) revert Unauthorized();
      bioRecords[name] = bio;
      emailRecords[name] = email;
      //hiddenRecords[name] = hiddenRecord;
      avatars[name] = avatar;

  }

  /*function getRecord(string calldata name) public view returns(string memory, string memory, string memory) {
      return (bioRecords[name], emailRecords[name], avatars[name]);
  }
 
  modifier onlyOwner() {
  require(isOwner());
  _;
}

function isOwner() public view returns (bool) {
  return msg.sender == owner;
}

function withdraw() public onlyOwner {
  uint amount = address(this).balance;
  
  (bool success, ) = msg.sender.call{value: amount}("");
  require(success, "Failed to withdraw Matic");
}*/
}