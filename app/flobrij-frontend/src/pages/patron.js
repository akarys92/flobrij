/* TODO
    - Check if the creator ID is valid
        - Check if this creator has received payments before
    - See if this patron has sent before, if so, import their email!
*/

import React, { useEffect, useState } from 'react';
import { Connection, PublicKey, clusterApiUrl, Transaction, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from '@solana/web3.js'; 
import { Program, Provider, web3 } from '@project-serum/anchor';
import idl from '../idl.json';
import { useParams } from "react-router-dom";
import gold from '../assets/gold.png';
import silver from '../assets/silver.png';
import bronze from '../assets/bronze.png';
import { style, textAlign } from '@mui/system';

// Constants
// SystemProgram is a reference to the Solana runtime
const { SystemProgram, Keypair } = web3; 

// Get our program's ID from the IDL file
const programID = new PublicKey(idl.metadata.address); 

// Set our network to devnet
const network = clusterApiUrl('devnet'); 

// Controls how we want to acknowledge when a transaction is done
const opts = {
    preflightCommitment: "processed"
}; 


const Patron = (props) => {

    const [ patronEmail, setPatronEmail ] = useState("");
    const [ transaction, setTransaction ] = useState({});
    const [ expirationHours, setExpirationHours ] = useState(8760);
    const [ statusMessage, setStatusMessage ] = useState("");
    const [ statusMessageActive, setStatusMessageActive ] = useState(false);

    // const { publickey } = useParams();

    const sendPayment = async (lamportPayment) => {
        // final fields
        const provider = getProvider(); 
        const program = new Program(idl, programID, provider); 
        const EMAIL = patronEmail;
        const recipient = new web3.PublicKey(props.publicKey); 
        const receipt = web3.Keypair.generate();
        const newTransaction = web3.Keypair.generate(); 

        setStatusMessage("Sending " + lamportPayment + " lamports...");
        setStatusMessageActive(true);

        try {
            
            let transaction = new Transaction();

            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: program.provider.wallet.publicKey,
                    toPubkey: recipient,
                    lamports: lamportPayment
                })
            );

            let connection = new Connection(clusterApiUrl('devnet'));
            transaction.feePayer = await provider.wallet.publicKey; 
            let blockhashObj = await connection.getRecentBlockhash();
            transaction.recentBlockhash = await blockhashObj.blockhash;
            let signed = await provider.wallet.signTransaction(transaction);
            let signature = await connection.sendRawTransaction(signed.serialize());
            await connection.confirmTransaction(signature);
            console.log("Signature: ", signature);
            setStatusMessage("Successfully sent funds!");
        }
        catch(e) {
            setStatusMessage("Send funds failed!");
            closeStatusMessage();
            console.log("Error sending funds: \n" + e);
        }

        try {
            setStatusMessage("Creating receipt...");
            const tx = await program.rpc.createReceipt(newTransaction.publicKey, recipient, EMAIL, lamportPayment, expirationHours, {
                accounts: {
                  // Accounts here...
                  receipt: receipt.publicKey, 
                  payer: program.provider.wallet.publicKey, 
                  systemProgram: web3.SystemProgram.programId,
              },
              signers: [
                  // Key pairs of signers here...
                  receipt
                ],
            });
            console.log(tx);
            const receiptAccount = await program.account.receipt.fetch(receipt.publicKey); 
            setTransaction(receiptAccount);
            console.log(receiptAccount);

            setStatusMessage("Successfully created receipt!");
            closeStatusMessage();
        }
        catch(e) {
            setStatusMessage("Receipt creation failed!");
            console.log("Error creating receipt: \n" + e);
        }
        closeStatusMessage();
    };

    const closeStatusMessage = () => {
        setTimeout(() => {  
            setStatusMessageActive(false); 
            setStatusMessage(""); 
        }, 3000);
    };

    /*
    * Handle change in input field
    */
    const onInputChange = (event) => {
        const { value } = event.target;
        setPatronEmail(value); 
    };

    /*
    * 
    */
    const getProvider = () => {
        const connection = new Connection(network, opts.preflightCommitment); 
        const provider = new Provider(
          connection, window.solana, opts.preflightCommitment, 
        ); 
        return provider; 
    }; 

    const renderPaymentForm = () => {
        return (
                <form style={styles.paymentFormContainer}
                    onSubmit={(event) => {
                    event.preventDefault();
                    sendPayment();
                    }}
                >
                    <input
                        type="text"
                        style={styles.input}
                        placeholder="Enter email!"
                        value={patronEmail}
                        onChange={onInputChange}
                    />
                </form>
        ); 
    };

    const loadWallet = async () => {
        const { solana } = window;
        const response = await solana.connect({ onlyIfTrusted: true }); 
        console.log(response);
    };

    /*
    * Get connected wallet creds on load
    */
    useEffect(() => {
        loadWallet();
    }, []);

    const renderStatus = () => {
        return (
            <div style={styles.statusContainer}>
                <h2>Status</h2>
                <p> { statusMessage } </p>
            </div>
        ); 
    }; 

    const renderPaymentContainer = () => {
        return (
            <div style={styles.paymentContainer}>
                <h1>Choose your support level</h1> 
                { renderPaymentForm() }

                <div style={styles.paymentOptionsContainer}>
                    <div style={styles.paymentBox}>
                        <h2>Superfan</h2>
                        <img src={silver} />
                        
                        <p style={styles.paymentBoxDescription}>You love them, but you could love them a little more. </p>
                        <h4>Join for 0.5 Sol per month</h4>
                        <button onClick={()=>{ sendPayment(500000000) }}>Join</button>
                    </div>
                    <div style={styles.paymentBox}>
                        <h2>Megafan</h2>
                        <img src={gold} />
                        
                        <p style={styles.paymentBoxDescription}>No one loves them as much as you do. </p>
                        <h4>Join for 1.0 Sol per month</h4>
                        <button onClick={()=>{ sendPayment(1000000000) }}>Join</button>
                    </div>
                    <div style={styles.paymentBox}>
                        <h2>Fan</h2>
                        <img src={bronze} />
                        
                        <p style={styles.paymentBoxDescription}>They're cool and you want to support them. </p>
                        <h4>Join for 0.25 Sol per month</h4>
                        <button onClick={()=>{ sendPayment(250000000) }}>Join</button>
                    </div>
                </div>
            </div>
        );
    };

    const styles = {
        container: {
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center"
        }, 
        heading: {
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center" 
        }, 
        tagline: {
            color: "grey"
        }, 
        paymentContainer: {
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center"
        },
        paymentFormContainer: {
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            padding: "2rem", 
            minWidth: "40rem"
        }, 
        paymentOptionsContainer: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around"
        }, 
        paymentBox: {
            width: "25%", 
            border: "1px solid #d3d3d3",
            minHeight: "20rem", 
            display: "flex",
            flexDirection: "column", 
            alignItems: "center", 
            padding: "1rem"
        }, 
        input: {
            width: "60%", 
            padding: "12px 20px",
            margin: "8px 0",
            boxSizing: "border-box",
            border: "none",
            borderBottom: "2px solid grey",
            textAlign: "center"
        }, 
        paymentBoxDescription: {
            textAlign: "center", 
            paddingBottom: "1rem"
        }, 
        statusContainer: {
            width: "50%", 
            border: "2px solid #d3d3d3",
            minHeight: "20rem", 
            display: "flex",
            flexDirection: "column", 
            alignItems: "center", 
            padding: "1rem"
        }
    }; 

    return (
        <div style={styles.container}>
            <div style={styles.heading}>
                <h1>{ props.displayName }</h1>
                <h4 style={styles.tagline}>This creator does not have a tagline setup!</h4>
            </div>

            { statusMessageActive? renderStatus() : renderPaymentContainer() }
        </div>
    );
};

export default Patron; 
