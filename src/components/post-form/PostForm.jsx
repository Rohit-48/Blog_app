import React from "react";
import { useForm } from "react-hook-form";
import RTE from "../RTE";
import { Button, Input, Select, } from "@/components/ui/button";
import Header from "@/components/ui/header";
import Footer from "@/components/ui/footer";
import Container from "@/components/ui/container";
import Logo from "@/components/ui/logo";
import logoutbtn from "@/components/ui/logoutbtn";
import { useRouter } from "next/navigation";
import appwriteService from  "@/appwrite/config";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

function PostForm(){
    const {regsister,handleSubmit, watch, setValue, control,getValues} = useForm({
        defaultValues:{
            title: post?.title || "",
            slug: post?.slug || "",
            content: post?.content || "",
            featureImage: post?.featureImage || "",
            status: post?.status || "active",
            userId: post?.userId || "",
        }
    });
    
    const {} = useForm()
    return(
        <div>PostForm</div>
    )
}

export default PostForm;


