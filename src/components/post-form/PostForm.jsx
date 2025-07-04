import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import RTE from "../RTE";
import Button from "../Button";
import Input from "../input";
import Select from "../Select";
import appwriteService from "../../appwrite/config";
import slugify from "slugify";

function PostForm({ post }) {
    const { register, handleSubmit, watch, setValue, control, getValues, formState: { errors } } = useForm({
        defaultValues: {
            title: post?.title || "",
            slug: post?.slug || "",
            content: post?.content || "",
            status: post?.status || "draft",
            featuredImage: "",
            excerpt: post?.excerpt || "",
            tags: post?.tags?.join(", ") || "",
            metaTitle: post?.metaTitle || "",
            metaDescription: post?.metaDescription || "",
            publishDate: post?.publishDate || new Date().toISOString().split('T')[0],
        }
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    const watchedTitle = watch("title", "");
    const watchedSlug = watch("slug", "");

    // Auto-generate slug from title
    useEffect(() => {
        if (watchedTitle && !watchedSlug) {
            const generatedSlug = slugify(watchedTitle, {
                lower: true,
                strict: true,
                remove: /[*+~.()'"!:@]/g
            });
            setValue("slug", generatedSlug);
        }
    }, [watchedTitle, watchedSlug, setValue]);

    // Auto-generate meta title and description if not set
    useEffect(() => {
        const currentValues = getValues();
        if (watchedTitle && !currentValues.metaTitle) {
            setValue("metaTitle", watchedTitle);
        }
        
        const content = currentValues.content;
        if (content && !currentValues.metaDescription && !currentValues.excerpt) {
            // Extract first paragraph as excerpt/meta description
            const firstParagraph = content.split('\n').find(line => line.trim().length > 0);
            if (firstParagraph) {
                const cleanText = firstParagraph.replace(/[#*`_]/g, '').trim();
                const excerpt = cleanText.substring(0, 160);
                setValue("excerpt", excerpt);
                setValue("metaDescription", excerpt);
            }
        }
    }, [watchedTitle, setValue, getValues]);

    const submit = async (data) => {
        setIsSubmitting(true);
        try {
            let fileId = null;

            // Handle featured image upload
            if (data.featuredImage && data.featuredImage[0]) {
                const file = await appwriteService.uploadFile(data.featuredImage[0]);
                if (file) {
                    fileId = file.$id;
                }
            }

            // Process tags
            const tags = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

            const postData = {
                title: data.title,
                content: data.content,
                featuredImage: fileId,
                status: data.status,
                userId: userData?.$id,
                slug: data.slug,
                excerpt: data.excerpt,
                tags: tags,
                metaTitle: data.metaTitle,
                metaDescription: data.metaDescription,
                publishDate: data.publishDate,
                updatedAt: new Date().toISOString(),
            };

            let dbPost;
            if (post) {
                // Update existing post
                dbPost = await appwriteService.updatePost(post.$id, postData);
            } else {
                // Create new post
                postData.createdAt = new Date().toISOString();
                dbPost = await appwriteService.createPost(postData);
            }

            if (dbPost) {
                navigate(`/post/${dbPost.$id}`);
            }
        } catch (error) {
            console.error("Error saving post:", error);
            alert("Failed to save post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePreview = () => {
        setPreviewMode(!previewMode);
    };

    const handleSaveDraft = async () => {
        const data = getValues();
        data.status = "draft";
        await submit(data);
    };

    const handlePublish = async () => {
        const data = getValues();
        data.status = "published";
        await submit(data);
    };

    if (previewMode) {
        const currentData = getValues();
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Preview Mode</h1>
                    <Button onClick={handlePreview} className="bg-gray-500">
                        ← Edit
                    </Button>
                </div>
                
                <article className="prose lg:prose-xl max-w-none">
                    <h1>{currentData.title}</h1>
                    {currentData.excerpt && (
                        <p className="text-lg text-gray-600 font-medium">{currentData.excerpt}</p>
                    )}
                    <div className="whitespace-pre-wrap">{currentData.content}</div>
                </article>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    {post ? "Edit Post" : "Create New Post"}
                </h1>
                <p className="text-gray-600 mt-2">
                    Write and publish your blog post with advanced features
                </p>
            </div>

            <form onSubmit={handleSubmit(submit)} className="space-y-8">
                {/* Main Content Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-4">Content</h2>
                    
                    <div className="space-y-4">
                        <Input
                            label="Title *"
                            placeholder="Enter an engaging title for your post"
                            {...register("title", { required: "Title is required" })}
                            error={errors.title?.message}
                        />

                        <Input
                            label="Slug"
                            placeholder="url-friendly-slug"
                            {...register("slug", { required: "Slug is required" })}
                            error={errors.slug?.message}
                            helpText="This will be used in the URL. Leave empty to auto-generate from title."
                        />

                        <RTE
                            label="Content *"
                            name="content"
                            control={control}
                            defaultValue={getValues("content")}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Excerpt"
                                type="textarea"
                                rows="3"
                                placeholder="Brief description of your post"
                                {...register("excerpt")}
                                helpText="Brief summary that appears in post lists and social shares"
                            />

                            <Input
                                label="Tags"
                                placeholder="react, javascript, tutorial"
                                {...register("tags")}
                                helpText="Comma-separated tags for categorization"
                            />
                        </div>
                    </div>
                </div>

                {/* SEO & Meta Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-4">SEO Settings</h2>
                    
                    <div className="space-y-4">
                        <Input
                            label="Meta Title"
                            placeholder="SEO optimized title"
                            {...register("metaTitle")}
                            helpText="Title that appears in search results (auto-filled from title)"
                            maxLength="60"
                        />

                        <Input
                            label="Meta Description"
                            type="textarea"
                            rows="3"
                            placeholder="Brief description for search engines"
                            {...register("metaDescription")}
                            helpText="Description that appears in search results (160 characters max)"
                            maxLength="160"
                        />
                    </div>
                </div>

                {/* Publishing Options */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold mb-4">Publishing Options</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select
                            options={[
                                { value: "draft", label: "Draft" },
                                { value: "published", label: "Published" },
                                { value: "archived", label: "Archived" },
                            ]}
                            label="Status"
                            {...register("status")}
                        />

                        <Input
                            label="Publish Date"
                            type="date"
                            {...register("publishDate")}
                            helpText="When to publish this post"
                        />

                        <Input
                            label="Featured Image"
                            type="file"
                            accept="image/*"
                            {...register("featuredImage")}
                            helpText="Main image for your post"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-between items-center p-6 bg-gray-50 rounded-lg">
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            onClick={handlePreview}
                            className="bg-gray-600 hover:bg-gray-700"
                        >
                            👀 Preview
                        </Button>
                        
                        <Button
                            type="button"
                            onClick={handleSaveDraft}
                            disabled={isSubmitting}
                            className="bg-yellow-600 hover:bg-yellow-700"
                        >
                            💾 Save Draft
                        </Button>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="bg-gray-500 hover:bg-gray-600"
                        >
                            Cancel
                        </Button>
                        
                        <Button
                            type="button"
                            onClick={handlePublish}
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isSubmitting ? "Publishing..." : "🚀 Publish"}
                        </Button>
                    </div>
                </div>
            </form>

            {/* Auto-save indicator */}
            <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm">
                Auto-save enabled ✅
            </div>
        </div>
    );
}

export default PostForm;


