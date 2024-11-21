import { useState } from "react";
import { useNavigate } from "react-router-dom"
const Dashboard = () => {
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const handleLogout = async()=> {
        try {
            const response = await fetch("http://localhost:8080/logout", {
                method: "delete",
                credentials: "include"
            });

            console.log(response);

            const data = await response.json();
    
            if(data.success)
                navigate("/login");

        } catch (error) {
            console.log(error);
            setError((error as Error).message || "Something awful went wrong while logout!")
        }
    }

    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <h1 style={{color: "white"}}>Dashboard</h1>
            { error && <p>{error }</p>}
            <button 
                style={{padding: "10px 30px", color: "brown", cursor: "pointer"}}
                onClick={ handleLogout }
                >Logout</button>
        </div>
    )
}

export default Dashboard