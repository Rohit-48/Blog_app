import React, { useState } from "react"; 
import { Crepe } from "@milkdown/crepe";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { gfm } from "@milkdown/plugin-gfm";
import {image} from "@milkdown/plugin-image";
import { indent } from "@milkdown/plugin-indent";
import { Controller } from "react-hook-form";




export default function RTE({name, control, label, defaultValue="", ...props}){
    const [initialValue, setValue] = useState("");
    const [loading, setLoading] = useState(false);

    // LLM integration
    const handleImprove = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/improve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markdown: initialValue }),
            });
            const data = await response.json();
            if (data.improvedMarkdown) {
                setValue(data.improvedMarkdown);
            }
        } catch (err) {
            alert("Failed to improve text.");
        }
        setLoading(false);
    };

    return(
        <div className="w-full">
            {label && <label className="text-sm font-medium mb-2">{label}</label>}

            <Controller
                control={control}
                name={name || "content "}
                render={({field}) => (
                    <MilkdownProvider>  
                        <Milkdown
                            plugins={[
                                gfm(),
                                image(),
                                indent(),
                                math(),
                                sup(),
                                table(),
                                taskList(),
                                taskItem(),
                                slash(),
                                code(),
                                codeBlockHighlight(),
                            ]}
                            value={initialValue}
                            options={{
                            placeholder: "Write Blog Post...", }} 
                            onUpdate={setValue} 
                            onChange={onChange}
                        />
                        {/* LLM integration*/}
                        <div className="mt-2 flex gap-2">
                <button
                    className="px-4 py-2 bg-green-500 text-white rounded-md"
                    onClick={handleImprove}
                    disabled={loading}
                >
                    {loading ? "Improving..." : "Improve with Gemini"}
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
                    Save
                </button>
            </div>


                        <div className="mt-2">
                            <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
                                Save
                                </button>
                        </div>
                     
                    </MilkdownProvider>
                )}
            /> 
        </div>

        
    )
}
