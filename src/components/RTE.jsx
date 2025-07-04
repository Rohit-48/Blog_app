import React, { useState, useEffect, useCallback, useRef } from "react";
import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/frame.css";
import { Controller } from "react-hook-form";

export default function RTE({ name, control, label, defaultValue = "", ...props }) {
    const [value, setValue] = useState(defaultValue);
    const [loading, setLoading] = useState(false);
    const [autoSaveTimer, setAutoSaveTimer] = useState(null);
    const crepeRef = useRef(null);

    // Auto-save functionality
    const autoSave = useCallback((content) => {
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
        }
        
        const timer = setTimeout(() => {
            localStorage.setItem(`blog-draft-${name}`, content);
            console.log("Auto-saved content");
        }, 2000);
        
        setAutoSaveTimer(timer);
    }, [autoSaveTimer, name]);

    // Load draft from localStorage on mount
    useEffect(() => {
        const draft = localStorage.getItem(`blog-draft-${name}`);
        if (draft && !defaultValue) {
            setValue(draft);
        }
        
        return () => {
            if (autoSaveTimer) {
                clearTimeout(autoSaveTimer);
            }
        };
    }, [name, defaultValue, autoSaveTimer]);

    // Handle content change
    const handleChange = useCallback((content) => {
        setValue(content);
        autoSave(content);
    }, [autoSave]);

    // Handle image upload
    const handleImageUpload = async (file) => {
        setLoading(true);
        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);
            
            // For now, create a local URL - in production, upload to your storage service
            const imageUrl = URL.createObjectURL(file);
            
            // Insert image markdown into editor
            const imageMarkdown = `![${file.name}](${imageUrl})`;
            const newContent = value + '\n\n' + imageMarkdown;
            setValue(newContent);
            
            return imageUrl;
        } catch (error) {
            console.error('Image upload failed:', error);
            alert('Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    // Handle drag and drop
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        imageFiles.forEach(handleImageUpload);
    }, [value]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
    }, []);

    // LLM integration for content improvement
    const handleImprove = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/improve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markdown: value }),
            });
            const data = await response.json();
            if (data.improvedMarkdown) {
                setValue(data.improvedMarkdown);
            }
        } catch (err) {
            console.error("Failed to improve text:", err);
            alert("Failed to improve text. Make sure the API endpoint is available.");
        }
        setLoading(false);
    };

    // Clear draft
    const clearDraft = () => {
        localStorage.removeItem(`blog-draft-${name}`);
        setValue("");
    };

    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium mb-2 text-gray-700">{label}</label>}

            <Controller
                control={control}
                name={name || "content"}
                render={({ field: { onChange, value: fieldValue } }) => (
                    <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                        {/* Toolbar */}
                        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">
                                    {loading ? "Processing..." : "Ready"}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                    onClick={handleImprove}
                                    disabled={loading || !value.trim()}
                                >
                                    {loading ? "Improving..." : "✨ AI Improve"}
                                </button>
                                <button
                                    type="button"
                                    className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                                    onClick={clearDraft}
                                >
                                    Clear Draft
                                </button>
                            </div>
                        </div>

                        {/* Editor Container */}
                        <div 
                            className="min-h-[400px] p-4 bg-white"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        >
                            <Crepe
                                ref={crepeRef}
                                value={value || fieldValue || ""}
                                onChange={(newValue) => {
                                    handleChange(newValue);
                                    onChange(newValue);
                                }}
                                options={{
                                    placeholder: "Start writing your blog post... \n\n💡 Tip: Drag and drop images directly into the editor!",
                                    editable: true,
                                    theme: {
                                        size: {
                                            radius: '8px',
                                            lineWidth: '1px'
                                        },
                                        color: {
                                            primary: '#3B82F6',
                                            secondary: '#6B7280',
                                        }
                                    }
                                }}
                                style={{
                                    minHeight: '350px',
                                    fontSize: '16px',
                                    lineHeight: '1.6',
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                                }}
                            />
                        </div>

                        {/* Status Bar */}
                        <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-4">
                                <span>Words: {value.split(/\s+/).filter(w => w.length > 0).length}</span>
                                <span>Characters: {value.length}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span>Auto-save enabled</span>
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                )}
            />

            {/* Image Upload Area */}
            <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                        const files = Array.from(e.target.files);
                        files.forEach(handleImageUpload);
                    }}
                    className="hidden"
                    id={`image-upload-${name}`}
                />
                <label 
                    htmlFor={`image-upload-${name}`}
                    className="cursor-pointer text-gray-600 hover:text-gray-800"
                >
                    <div className="space-y-2">
                        <div className="text-2xl">📸</div>
                        <div className="text-sm">
                            Click to upload images or drag and drop them into the editor
                        </div>
                    </div>
                </label>
            </div>
        </div>
    );
}
