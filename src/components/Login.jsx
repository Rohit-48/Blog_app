import React, {useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { login  as authLogin} from "../appwrite/auth";
import { Button, Input, Select, Logo} from "./index"
import { useDispatch} from "react-redux";
import { authService } from "../appwrite/auth";
import { useForm } from "react-hook-form";

function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {register, handleSubmit} = useForm();

    const login = async (data) => {
        setError("");
        try{
            const session = await authService.login(data);
            if(session){
                const userData = await appwriteService.getUser();
                getCurrentUser();
                if(userData) dispatch(authLogin(userData));
                
            }
        }catch(error){
            setError(error.message);
        }
    }

    return( 
        <div
         className="flex justify-center items-center h-screen"
        >
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <div className="flex justify-center items-center">
                    <Logo />
                </div>
                <h2 className="text-3xl font-bold text-center mb-5">Sign in to your account</h2>
                <p className="text-center text-gray-500 mb-5">
                    Don&apos;t have an account? <Link to="/signup" className="text-blue-500">Sign up</Link>
                </p>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <form onSubmit={handleSubmit(login)}
                    className="mt-8">
                        <div className="space-y-4">
                            <Input
                                type="email"
                                placeholder="Email"
                                {...register("email", {required: true,      validate: {
                                    matchPattern: (value) => /^\S+@\S+$/.test(value) || "Invalid email address"
                                }})}
                            />

                            <input  label="Password"
                             type="password" 
                             placeholder="Enter your password"
                             {...register("password", {required: true, minLength: 12})} />


                             <Button 
                             type="submit" 
                             className="w-full">Sign In </Button>
                        </div>
                   
                </form>
            </div>
        </div>

    )
}

export default Login;