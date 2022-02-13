import logo from './logo.svg';
import './App.css';
import { Link, Outlet } from "react-router-dom";


function App() {
  
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column"
    },
    navbar: {
      borderBottom: "solid 1px #d3d3d3", 
      paddingLeft: "1rem"
    },
    logo: {
      textDecoration: "none", 
      color: "black"
    },
    mainArea: {
      margin: "1rem", 
      display: "flex",
      justifyContent: "center"
    }
  }; 

  return (
    <div style={styles.container}>
        <nav style={styles.navbar}>
          <Link style={styles.logo} to="/"><h1>FLOBRIJ</h1></Link>
        </nav>
        <div style={styles.mainArea}>
          <Outlet />

        </div>
    </div>
  );
}

export default App;
