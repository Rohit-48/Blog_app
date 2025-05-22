import React, {useEffect, useState, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {Logo} from "@nextui-org/react";


export default function AuthLayout({children,authentication = true}){
    const navigate = useNavigate();
    const [loader, setLoader] = useState(true);
    const [autheState, setAutheState] = useState(null);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);


    useEffect(()=>{
        //TODO: make is more efficient.
        if (authentication && autheState !== authentication){
            navigate('/login');
        }else if (!authentication && autheState !== authentication){
            navigate('/');
        }
        setLoader(false);
    }, [autheState, navigate, authentication])


    return  loader ? <h1>Loading...</h1> : <>{children}</>;
}

