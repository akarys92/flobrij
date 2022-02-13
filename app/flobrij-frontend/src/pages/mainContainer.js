import { useParams } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'; 
// import { Program, Provider, web3 } from '@project-serum/anchor';
import Creator from "./creator";
import Patron from "./patron";
import phantom from '../assets/phantom-icon-purple.png';
import { getHashedName, getNameAccountKey, NameRegistryState } from '@solana/spl-name-service';

const SOL_TLD_AUTHORITY = new PublicKey(
    "58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx"
);


const MainContainer = () => {
    let params = useParams();
      // State 
    const [walletAddress, setWalletAddress] = useState(null);

    /*
    * This function holds the logic for deciding if a Phantom Wallet is
    * connected or not
    */
    const checkIfWalletIsConnected = async () => {
        try {
            const { solana } = window; 
            if(solana.isPhantom) {
                console.log('Phantom wallet found!');

                // Check if we have access to the wallet
                const response = await solana.connect({ onlyIfTrusted: true }); 
                console.log(
                'Connected with Public Key: ',
                response.publicKey.toString()
                ); 
                // Set the public key in state
                setWalletAddress(response.publicKey.toString());
            }
            else {
                alert('Solana object not found! Get a Phantom Wallet 👻');
            }
        } 
        catch(error) {
        console.error(error); 
        }
    };
    /*
    * TEMP
    */
    const connectWallet = async() => {
        const { solana } = window; 
        if(solana) {
            const response = await solana.connect();
            console.log('Connected with Public Key: ', response.publicKey.toString()); 
            setWalletAddress(response.publicKey.toString());
        }
    };

    /*
    * UI for when wallet isn't connected yet
    */
    const renderNotConnectedContainer = () => (
        <div style={styles.container}>
            <h2>Connect a Wallet</h2>
            <img style={styles.phantomLogo} src={phantom} />
            <p>FLOBRIJ requires a Phantom wallet. If you don't have one, get one <a href="https://phantom.app/download">here.</a> </p>
            <button
                className="cta-button connect-wallet-button"
                onClick={connectWallet}
            >
                Connect Wallet
            </button>
        </div>
        
    );

    /*
    * What to render when we're CONNECTED!
    */
    const renderConnectedContainer = () => { 
        let displayName = params.publickey; 
        let publicKey = params.publickey; 

        //TODO: Get rid of this hack
        if(params.publickey === 'alexkarys.sol') {
            displayName = 'alexkarys.sol';
            publicKey = '8Nc8aZ6MnPEQp6yKG6Pq87bK2dXWSpp5xnZC6sAnagr3'; 
            if(walletAddress === '8Nc8aZ6MnPEQp6yKG6Pq87bK2dXWSpp5xnZC6sAnagr3' ) {
                return <Creator walletAddress={walletAddress} displayName={displayName} publicKey={publicKey}/> ;
            }
        }
        
        return walletAddress === params.publickey ? <Creator walletAddress={walletAddress} displayName={displayName} publicKey={publicKey}/> 
            : <Patron walletAddress={walletAddress} displayName={displayName} publicKey={publicKey}/>;
    }

    const getInputKey = async (input) => {
        let hashed_input_name = await getHashedName(input);
        let inputDomainKey = await getNameAccountKey(
            hashed_input_name,
            undefined,
            SOL_TLD_AUTHORITY
        );
        return { inputDomainKey: inputDomainKey, hashedInputName: hashed_input_name };
    };

    const checkDomain = async () => {
        let key = await getInputKey(params.publicKey); 
        console.log(JSON.stringify(key))
    };

    const styles = {
        container: {
            display: "flex", 
            flexDirection: "column", 
            justifyContent: "center",
            alignItems: "center", 
            border: "1px solid #d3d3d3",
            padding: "2rem", 
            height: "20rem", 
            widht: "20rem"
        }, 
        phantomLogo: {
            height: "5rem"
        }
    };
    /*
   * When our component first mounts, let's check to see if we have a connected
   * Phantom Wallet
   */
    useEffect(() => {
        const onLoad = async () => {
            await checkIfWalletIsConnected();
        };
        window.addEventListener('load', onLoad);
        return () => window.removeEventListener('load', onLoad);
    }, []);

    useEffect(()=>{
        checkDomain();
    }, [params])

    return walletAddress ? renderConnectedContainer() : renderNotConnectedContainer(); 
}

export default MainContainer; 