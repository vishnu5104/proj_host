import React, { useState, useEffect, Children, setState } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import axios from 'axios';
import { create as ipfsHttpClient } from 'ipfs-http-client';
// all the data is centralized
import { MarketAddress, MarketAddressABI } from './constants';

// const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

const projectId = '2G76iBylpNVE2zUmUvE7FruWRwA';
const projectSecret = '8e3218ca549be68b2fc8a12956cf6d1d';
const auth = `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString(
  'base64'
)}`;

const client = ipfsHttpClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

const fetchContract = (signerOrProvider) => new ethers.Contract(MarketAddress, MarketAddressABI, signerOrProvider);

export const NFTContext = React.createContext();

export const NFTProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState('');
  // const [count, setCount] = useState(0);

  const nftCurrency = 'ETH';
  // const count = 0;

  // function CountInc() {
  //   setCount(count + 1);
  // }
  const checkIfWalletISConnected = async () => {
    if (!window.ethereum) return alert('Please install MetaMask');

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    if (accounts.length) {
      setCurrentAccount(accounts[0]);
    } else {
      console.log('No accounts found');
    }
  };

  useEffect(() => {
    checkIfWalletISConnected();
  }, []);
  const connectWallet = async () => {
    if (!window.ethereum) return alert('Please install MetaMask');

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setCurrentAccount(accounts[0]);

    window.location.reload();
  };
  const uploadToIPFS = async (file) => {
    const subdomain = 'https://nft-own-it-uplord.infura-ipfs.io';   
    try {
      const added = await client.add({ content: file });
      const url = `${subdomain}/ipfs/${added.path}`;
      
      return url;
    } catch (error) {
      console.log('Error uploading files to IPFS.');
    }
  };

  const createNFT = async (formInput, fileUrl, router) => {
    const { name, description, price } = formInput;

    // if there is no then any of the case do return from the fun() else do create a obj
    if (!name || !description || !price || !fileUrl) return;

    const data = JSON.stringify({ name, description, image: fileUrl });
    try {
      const added = await client.add(data);

      const url = `https://nft-own-it-uplord.infura-ipfs.io/ipfs/${added.path}`;
      // save on polygon
      // argu

      await createSale(url, price);
      // then go to home page

      router.push('/');
    } catch (error) {
      console.log(error);
      console.log('Error to upload to ipfs');
    }
  };
  // para

  const createSale = async (url, formInputPrice, isReselling, id) => {
    // connect to smart contract

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    // value of wei of zeo of to convert to it that what metamask read
    const price = ethers.utils.parseUnits(formInputPrice, 'ether');
    // calling func() from contract takes time so use await
    const contract = fetchContract(signer);
    // CountInc();

    // count += 1;
    // await contract.CountInc();

    const listingPrice = await contract.getListingPrice();
    const transaction = !isReselling
      ? await contract.createToken(url, price, { value: listingPrice.toString() })
      // else it belong to this
      : await contract.resellToken(id, price, { value: listingPrice.toString() });
    await transaction.wait();
  };
  // for home page
  const fetchNFTs = async () => {
    const provider = new ethers.providers.JsonRpcProvider();
    // to fetch contracts -> fetch all the nfts not only for a specific person
    const contract = fetchContract(provider);

    const data = await contract.fetchMarketItems();
    const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
      const tokenURI = await contract.tokenURI(tokenId);
      // responce we get -> metadata : image,name,descis
      const { data: { image, name, description } } = await axios.get(tokenURI);
      const price = ethers.utils.formatUnits(unformattedPrice.toString(), 'ether');
      // item array has all the data of what we return
      // readable obj
      return {
        price,
        tokenId: tokenId.toNumber(),
        seller,
        owner,
        image,
        name,
        description,
        tokenURI,
      };
    }));

    return items;// ->all nft simentanesoly
  };
  // on my nft page or listed nft page
  const fetchMyNFTsOrListedNFTs = async (type) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);
    // fun in bc->smart contract
    const data = type === 'fetchItemsListed' ? await contract.fetchItemsListed() : await contract.fetchMyNFTs();

    const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
      const tokenURI = await contract.tokenURI(tokenId);
      // responce we get -> metadata : image,name,descis
      const { data: { image, name, description } } = await axios.get(tokenURI);
      const price = ethers.utils.formatUnits(unformattedPrice.toString(), 'ether');
      // item array has all the data of what we return
      // readable obj
      return {
        price,
        tokenId: tokenId.toNumber(),
        seller,
        owner,
        image,
        name,
        description,
        tokenURI,
      };
    }));
    return items;
  };
  // it take actual nft
  // copy first 5 lines of fetchmynfts for another method of contract
  const buyNft = async (nft) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);
    // get our contract so then format the price of the contract to human readable
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
    // this is how we call the fun() from smart contract
    const transaction = await contract.createMarketSale(nft.tokenId, { value: price });
    await transaction.wait();
  };

  return (
    <NFTContext.Provider value={{ nftCurrency, connectWallet, currentAccount, uploadToIPFS, createNFT, fetchNFTs, fetchMyNFTsOrListedNFTs, buyNft, createSale }}>
      {children}
    </NFTContext.Provider>
  );
};
