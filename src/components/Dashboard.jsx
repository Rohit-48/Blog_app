import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import appwriteService from "../appwrite/config";
import StaticSiteGenerator from "../utils/staticSiteGenerator";
import Button from "./Button";

function Dashboard() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPosts, setSelectedPosts] = useState([]);
    const [analytics, setAnalytics] = useState({
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        totalViews: 0,
        thisMonth: 0
    });
    const [siteConfig, setSiteConfig] = useState({
        siteName: 'My Blog',
        baseUrl: 'https://myblog.com',
        description: 'A modern blog built with React',
        author: 'Blog Author'
    });
    const [activeTab, setActiveTab] = useState('posts');
    const [isGenerating, setIsGenerating] = useState(false);
    
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    useEffect(() => {
        fetchPosts();
        calculateAnalytics();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await appwriteService.getPosts();
            if (response) {
                setPosts(response.documents || []);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateAnalytics = () => {
        const totalPosts = posts.length;
        const publishedPosts = posts.filter(post => post.status === 'published').length;
        const draftPosts = posts.filter(post => post.status === 'draft').length;
        const thisMonth = posts.filter(post => {
            const postDate = new Date(post.createdAt);
            const now = new Date();
            return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear();
        }).length;

        setAnalytics({
            totalPosts,
            publishedPosts,
            draftPosts,
            totalViews: totalPosts * 127, // Mock data
            thisMonth
        });
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await appwriteService.deletePost(postId);
                setPosts(posts.filter(post => post.$id !== postId));
                calculateAnalytics();
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post");
            }
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedPosts.length === 0) {
            alert('Please select posts to perform bulk actions');
            return;
        }

        if (action === 'delete') {
            if (window.confirm(`Are you sure you want to delete ${selectedPosts.length} posts?`)) {
                try {
                    await Promise.all(selectedPosts.map(id => appwriteService.deletePost(id)));
                    setPosts(posts.filter(post => !selectedPosts.includes(post.$id)));
                    setSelectedPosts([]);
                    calculateAnalytics();
                } catch (error) {
                    console.error("Error deleting posts:", error);
                    alert("Failed to delete some posts");
                }
            }
        }

        if (action === 'publish') {
            try {
                await Promise.all(
                    selectedPosts.map(id => 
                        appwriteService.updatePost(id, { status: 'published' })
                    )
                );
                fetchPosts();
                setSelectedPosts([]);
            } catch (error) {
                console.error("Error publishing posts:", error);
                alert("Failed to publish some posts");
            }
        }
    };

    const generateStaticSite = async () => {
        setIsGenerating(true);
        try {
            const generator = new StaticSiteGenerator(siteConfig);
            const site = await generator.generateSite(posts);
            
            // Create and download the site as a ZIP file (mock implementation)
            const siteData = JSON.stringify(site, null, 2);
            const blob = new Blob([siteData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'static-site.json';
            a.click();
            
            URL.revokeObjectURL(url);
            
            alert('Static site generated successfully! In production, this would create HTML files ready for deployment.');
        } catch (error) {
            console.error("Error generating site:", error);
            alert("Failed to generate static site");
        } finally {
            setIsGenerating(false);
        }
    };

    const exportPosts = () => {
        const exportData = {
            posts: posts,
            config: siteConfig,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'blog-export.json';
        a.click();
        
        URL.revokeObjectURL(url);
    };

    const importPosts = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                if (importData.posts && Array.isArray(importData.posts)) {
                    // In a real implementation, you'd import these to your database
                    alert(`Found ${importData.posts.length} posts to import. This would be implemented with your backend.`);
                } else {
                    alert('Invalid import file format');
                }
            } catch (error) {
                alert('Error reading import file');
            }
        };
        reader.readAsText(file);
    };

    const StatCard = ({ title, value, subtitle, icon, color = "blue" }) => (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">{title}</p>
                    <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
                    <p className="text-xs text-gray-500">{subtitle}</p>
                </div>
                <div className={`text-${color}-500 text-2xl`}>{icon}</div>
            </div>
        </div>
    );

    const PostRow = ({ post }) => (
        <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-4 py-3">
                <input
                    type="checkbox"
                    checked={selectedPosts.includes(post.$id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedPosts([...selectedPosts, post.$id]);
                        } else {
                            setSelectedPosts(selectedPosts.filter(id => id !== post.$id));
                        }
                    }}
                    className="rounded border-gray-300"
                />
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center space-x-3">
                    {post.featuredImage && (
                        <img 
                            src={post.featuredImage} 
                            alt={post.title}
                            className="w-12 h-12 object-cover rounded"
                        />
                    )}
                    <div>
                        <h3 className="font-medium text-gray-900">{post.title}</h3>
                        <p className="text-sm text-gray-500">
                            {post.excerpt ? post.excerpt.substring(0, 60) + '...' : ''}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    post.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : post.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                }`}>
                    {post.status}
                </span>
            </td>
            <td className="px-4 py-3 text-sm text-gray-500">
                {format(new Date(post.createdAt), 'MMM d, yyyy')}
            </td>
            <td className="px-4 py-3 text-sm text-gray-500">
                {post.tags ? post.tags.join(', ') : 'No tags'}
            </td>
            <td className="px-4 py-3">
                <div className="flex space-x-2">
                    <Link
                        to={`/edit-post/${post.$id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        Edit
                    </Link>
                    <button
                        onClick={() => handleDeletePost(post.$id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-gray-600">Welcome back, {userData?.name || 'Blogger'}!</p>
                        </div>
                        <div className="flex space-x-3">
                            <Button
                                onClick={() => navigate('/create-post')}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                ✍️ New Post
                            </Button>
                            <Button
                                onClick={generateStaticSite}
                                disabled={isGenerating}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {isGenerating ? 'Generating...' : '🚀 Generate Site'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Posts"
                        value={analytics.totalPosts}
                        subtitle="All time"
                        icon="📝"
                        color="blue"
                    />
                    <StatCard
                        title="Published"
                        value={analytics.publishedPosts}
                        subtitle="Live posts"
                        icon="🌐"
                        color="green"
                    />
                    <StatCard
                        title="Drafts"
                        value={analytics.draftPosts}
                        subtitle="Work in progress"
                        icon="📄"
                        color="yellow"
                    />
                    <StatCard
                        title="This Month"
                        value={analytics.thisMonth}
                        subtitle="New posts"
                        icon="📈"
                        color="purple"
                    />
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'posts', label: 'Posts', icon: '📝' },
                            { id: 'analytics', label: 'Analytics', icon: '📊' },
                            { id: 'settings', label: 'Site Settings', icon: '⚙️' },
                            { id: 'export', label: 'Export/Import', icon: '📦' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                {activeTab === 'posts' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        {/* Bulk Actions */}
                        {selectedPosts.length > 0 && (
                            <div className="bg-blue-50 p-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-blue-700">
                                        {selectedPosts.length} posts selected
                                    </span>
                                    <div className="flex space-x-2">
                                        <Button
                                            onClick={() => handleBulkAction('publish')}
                                            className="bg-green-600 hover:bg-green-700 text-xs"
                                        >
                                            Publish
                                        </Button>
                                        <Button
                                            onClick={() => handleBulkAction('delete')}
                                            className="bg-red-600 hover:bg-red-700 text-xs"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Posts Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedPosts(posts.map(post => post.$id));
                                                    } else {
                                                        setSelectedPosts([]);
                                                    }
                                                }}
                                                className="rounded border-gray-300"
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Post</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {posts.map((post) => (
                                        <PostRow key={post.$id} post={post} />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {posts.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📝</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                                <p className="text-gray-500 mb-6">Get started by creating your first blog post!</p>
                                <Button
                                    onClick={() => navigate('/create-post')}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Create Your First Post
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium mb-3">Post Performance</h3>
                                <div className="space-y-3">
                                    {posts.slice(0, 5).map((post) => (
                                        <div key={post.$id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                            <span className="font-medium">{post.title}</span>
                                            <span className="text-sm text-gray-500">{Math.floor(Math.random() * 1000)} views</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-medium mb-3">Traffic Sources</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span>Direct</span>
                                        <span className="font-medium">45%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Search Engines</span>
                                        <span className="font-medium">30%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Social Media</span>
                                        <span className="font-medium">25%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold mb-4">Site Configuration</h2>
                        <form className="space-y-4 max-w-2xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                                <input
                                    type="text"
                                    value={siteConfig.siteName}
                                    onChange={(e) => setSiteConfig({...siteConfig, siteName: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
                                <input
                                    type="url"
                                    value={siteConfig.baseUrl}
                                    onChange={(e) => setSiteConfig({...siteConfig, baseUrl: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={siteConfig.description}
                                    onChange={(e) => setSiteConfig({...siteConfig, description: e.target.value})}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                                <input
                                    type="text"
                                    value={siteConfig.author}
                                    onChange={(e) => setSiteConfig({...siteConfig, author: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                Save Settings
                            </Button>
                        </form>
                    </div>
                )}

                {activeTab === 'export' && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold mb-4">Data Management</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium mb-3">Export Data</h3>
                                <p className="text-gray-600 mb-4">Download all your posts and settings as a backup.</p>
                                <Button onClick={exportPosts} className="bg-blue-600 hover:bg-blue-700">
                                    📥 Export All Data
                                </Button>
                            </div>
                            <div>
                                <h3 className="font-medium mb-3">Import Data</h3>
                                <p className="text-gray-600 mb-4">Import posts from another platform or backup.</p>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={importPosts}
                                    className="hidden"
                                    id="import-file"
                                />
                                <label htmlFor="import-file">
                                    <Button as="span" className="bg-green-600 hover:bg-green-700 cursor-pointer">
                                        📤 Import Data
                                    </Button>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;