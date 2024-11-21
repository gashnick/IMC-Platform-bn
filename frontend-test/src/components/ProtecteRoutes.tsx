import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

interface IResponse {
    success: boolean
    statusCode: number
}
const ProtectedRoutes = () => {

   const [ user, setUser ] = useState<IResponse>()
   const [isLoading, setIsLoading] = useState(true);

   useEffect(()=> {
    const fetchLoggedInUser = async()=> {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:8080/users/profile", {
                method: "GET",
                credentials: "include"
            });

            const data = await response.json();
            setUser(data)

        } catch (error) {
            console.log(error);
        
        } finally {
            setIsLoading(false);
        }
    }

    fetchLoggedInUser();
   }, []);

   if(isLoading){
     return null
   }

  return (!isLoading && user?.success) ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;