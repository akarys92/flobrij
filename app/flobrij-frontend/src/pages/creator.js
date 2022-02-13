import { useParams } from "react-router-dom";
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'; 
import { Program, Provider, web3 } from '@project-serum/anchor';
import idl from '../idl.json';
import { useEffect, useState } from "react";
import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';

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


const Creator = (props) => {
    //TODO Get rid of this hack
    // let { publickey } = useParams();

    const [ receiptArray, setReceiptArray ] = useState([]);
    const [ gridRows, setGridRows ] = useState([]); 
    const gridColumns = [
        { field: 'email', headerName: 'Email', width: 190 },
        { field: 'created_at', headerName: 'Created At', width: 250 },
        { field: 'membership_expires', headerName: 'Membership Expires At', width: 250 },
        { field: 'amount_paid', headerName: 'Amount Paid', width: 230 },
        { field: 'transaction_link', headerName: 'Transaction Link', width: 230 },
    ]; 

    const getReceipts = async () => {
        const recipientPublicKey = new web3.PublicKey(props.publicKey);;
        const provider = getProvider(); 
        const program = new Program(idl, programID, provider); 
        console.log(recipientPublicKey);

        const receiptAccounts = await program.account.receipt.all([
        {
            memcmp: {
            offset: 8
                + 32, // Transaction key, 
            bytes: recipientPublicKey,
            }
        }
        ]);
        console.log(receiptAccounts);
        setReceiptArray(receiptAccounts);
    }; 

    /*
    *  Create a provider
    */
    const getProvider = () => {
        const connection = new Connection(network, opts.preflightCommitment); 
        const provider = new Provider(
          connection, window.solana, opts.preflightCommitment, 
        ); 
        return provider; 
    }; 

    /*
    * Generate grid of user payments
    */
    const generateTable = () => {
        
        const rows = receiptArray.map( (row, index)=> {
            let tempRow = {
                id: index, 
                email: row.account.email, 
                created_at: new Date(row.account.timestamp*1000), 
                membership_expires: 
                new Date(row.account.timestamp*1000 + row.account.expirationHours * 60 * 60 * 1000), 
                amount_paid: row.account.amount + " lamports", 
                transaction_link: row.account.transaction 
            };
            return tempRow;  
        }); 

        setGridRows(rows);
    }



    useEffect(() => {
        // Update the document title using the browser API
        getReceipts();
    }, []);

    useEffect(() => {
        // Update the document title using the browser API
        generateTable();
    }, [receiptArray]);

    const styles = {
        container: {
            display: "flex",
            flexDirection: "column", 
            width: "1200px"
        }, 
        outerGridcontainer: {
            display: 'flex', 
            height: '100%',
            
        },
        gridContainer: {
            minHeight: "25rem",
            flexGrow: 1 
        },
        infoContainer: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            marginBottom: "2rem"
        },
        infoSquare: {
            display: "flex", 
            flexDirection: "column",
            alignItems: "center",  
            minHeight: "15rem",
            width: "100%", 
            padding: "2rem"
        }, 
        tagLine: {
            color: "grey"
        }
    }; 

    return (
            <div style={styles.container}>
                <div style={styles.infoContainer}>
                    <div style={styles.infoSquare}>
                        <h1>Welcome: {props.displayName}</h1>
                        <h2 style={styles.tagLine}>You own your fanbase, find them here!</h2>
                    </div>
                </div>
                
                <div style={styles.outerGridcontainer}>
                    <div style={styles.gridContainer}>
                        <h1>Your Active Fanbase: </h1>
                        <DataGrid
                            columns={gridColumns}
                            rows={gridRows}
                            />
                    </div>
                </div>
                
            </div>
    );
};

export default Creator; 