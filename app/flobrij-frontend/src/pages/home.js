import { useParams } from "react-router-dom";

export default function Home() {

    const styles = {
        container: {
            width: "100%", 
            maxWidth: "100rem",
            display: "flex", 
            flexDirection: "column"
        }, 
        hero: {
            height: "40rem", 
            width: "100%", 
            borderBottom: "1px solid black", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center"
        }, 
        tagline: {
            color: "grey"
        },
        info: {

        }, 
        infoBoxRight: {

        }
    };
    return (
        <div style={styles.container}>
            <div style={styles.hero}>
                <h1 >Own your audience, take control of your future.</h1>
                <h3 style={styles.tagline}>FLOBRIJ is the world's first fully decentralized creator monitization platform.</h3>
                <button>Connect Your Wallet</button>
            </div>

            <div style={styles.info}>
                <div style={styles.infoBoxRight}>

                </div>
            </div>
        </div>
    );
}