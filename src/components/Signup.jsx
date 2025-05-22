import React, {useState} from 'react';
import authService from '../services/authService';
import {useForm} from 'react-hook-form';
import {Button, Input, Logo} from '@nextui-org/react';
import {useNavigate} from 'react-router-dom';
import {login} from '../services/authService';
import {useForm} from 'react-hook-form';


function Signup(){
const [error, setError] = useState('');
const navigate = useNavigate();
const dispatch = useDispatch();
const {register, handleSubmit, formState: {errors}} = useForm();

const signup = async (data) => {
    setError('');
    try {
        const userData = await authService.createAccount(data);
        dispatch(login(userData));
        if(userData){
            const user = userData.user;
            getCurrentUser();
            if(userData) dispatch(login(userData));
            navigate('/');
        }
    } catch (error) {
        setError(error.response.data.message);
    }
}

return (
    <div className="flex justify-center items-center h-screen">

        <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-md">
            <div className='mb-4 flex justify-center'>
                <span className='inline-block w-full max-w-[100px]'>
                    <Logo width='100%' />
                </span>
            </div>  
            <h2 className='text-2xl font-bold mb-4 text-center'>Sign Up</h2>
            <p className='text-gray-600 mb-6 text-center'>Create an account to get started?&nbsp;
                <Link to='/login' className='text-blue-500 hover:text-blue-600'>Login</Link>
            </p>
            {/* This creates a form. When the form is submitted, it uses react-hook-form's handleSubmit to validate 
            the form and then calls your signup function with the form data. */}
            <form onSubmit={handleSubmit(signup)}>
                <Input {...register('name', {required: 'Name is required'})}
                    type='text'
                    placeholder='Name'
                    errorMessage={errors.name?.message}
                    className='mb-4'
                />
                <Input
                    {...register('email', {required: 'Email is required'})}
                    type='email'
                    placeholder='Email'
                    errorMessage={errors.email?.message}
                    className='mb-4'
                />
                <Input
                    {...register('password', {required: 'Password is required'})}
                    type='password'
                    placeholder='Password'
                    errorMessage={errors.password?.message}
                    className='mb-4'
                />
                <Button type='submit' color='primary' className='w-full'>Sign Up</Button>
                {error && <p className='text-red-500 mb-4 text-center'>{error}</p>}
            </form>
        </div>
    </div>

)
}
export default Signup;
