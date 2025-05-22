import { returnFirstArg } from "html-react-parser/lib/utilities";
import React from "react";
import appwriteService from "../appwrite/config";
import { Link } from "react-router-dom";

function Postcard({$id, title, content, featureImage, status, createdAt}){
    return(
        <Link to={`/post/${id}`}>
            <div  className="w-full bg-gray-100 rounded-xl p-4">
                <div className="w-full h-80 bg-gray-300 rounded-xl mb-3 justify-center items-center flex">
                    <img src={appwriteService.getFilePreview(featureImage)} alt={title}
                    className="w-full h-full object-cover rounded-xl"
                    />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
            </div>

        </Link>
    )
}

export default Postcard;