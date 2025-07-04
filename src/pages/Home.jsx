import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

function Home() {
    const authStatus = useSelector((state) => state.auth.status);
    const userData = useSelector((state) => state.auth.userData);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block">The Perfect</span>
                                    <span className="block text-blue-600">Blogging Platform</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    Create beautiful blogs with our WYSIWYG markdown editor, 
                                    generate lightning-fast static sites, and own your content completely. 
                                    Perfect for developers and content creators alike.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-md shadow">
                                        {authStatus ? (
                                            <Link
                                                to="/dashboard"
                                                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
                                            >
                                                Go to Dashboard
                                            </Link>
                                        ) : (
                                            <Link
                                                to="/signup"
                                                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
                                            >
                                                Get Started Free
                                            </Link>
                                        )}
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <Link
                                            to="#features"
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10 transition-colors"
                                        >
                                            Learn More
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Everything you need to blog
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                            From writing to publishing, we've got you covered with modern tools and workflows.
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Feature 1 */}
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-500 text-white text-2xl">
                                    ✍️
                                </div>
                                <h3 className="mt-6 text-lg leading-6 font-medium text-gray-900">WYSIWYG Editor</h3>
                                <p className="mt-2 text-base text-gray-500 text-center">
                                    Typora-like markdown editor with live preview, drag-and-drop images, and seamless writing experience.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-500 text-white text-2xl">
                                    ⚡
                                </div>
                                <h3 className="mt-6 text-lg leading-6 font-medium text-gray-900">Lightning Fast</h3>
                                <p className="mt-2 text-base text-gray-500 text-center">
                                    Generate optimized static sites with minimal HTML, fast loading times, and excellent SEO.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-500 text-white text-2xl">
                                    🎯
                                </div>
                                <h3 className="mt-6 text-lg leading-6 font-medium text-gray-900">SEO Optimized</h3>
                                <p className="mt-2 text-base text-gray-500 text-center">
                                    Automatic meta tags, schema markup, sitemaps, and RSS feeds for maximum visibility.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-500 text-white text-2xl">
                                    🚀
                                </div>
                                <h3 className="mt-6 text-lg leading-6 font-medium text-gray-900">Easy Deployment</h3>
                                <p className="mt-2 text-base text-gray-500 text-center">
                                    Deploy to GitHub Pages, Netlify, Vercel, or any static hosting with one click.
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-500 text-white text-2xl">
                                    📊
                                </div>
                                <h3 className="mt-6 text-lg leading-6 font-medium text-gray-900">Built-in Analytics</h3>
                                <p className="mt-2 text-base text-gray-500 text-center">
                                    Privacy-focused analytics with insights on traffic, popular posts, and engagement.
                                </p>
                            </div>

                            {/* Feature 6 */}
                            <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center h-16 w-16 rounded-md bg-blue-500 text-white text-2xl">
                                    💾
                                </div>
                                <h3 className="mt-6 text-lg leading-6 font-medium text-gray-900">Data Ownership</h3>
                                <p className="mt-2 text-base text-gray-500 text-center">
                                    Full export capabilities, Git-based workflow, and complete control over your content.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Technical Specs Section */}
            <div className="bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Technical Excellence</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Built for Performance
                        </p>
                    </div>

                    <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">&lt; 50KB</div>
                            <div className="mt-2 text-sm text-gray-500">Average page size</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">&lt; 2s</div>
                            <div className="mt-2 text-sm text-gray-500">Deploy time</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">90+</div>
                            <div className="mt-2 text-sm text-gray-500">Lighthouse score</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">100%</div>
                            <div className="mt-2 text-sm text-gray-500">Data ownership</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">How It Works</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            From Idea to Published
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div className="text-center">
                                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 text-2xl mx-auto">
                                    1
                                </div>
                                <h3 className="mt-6 text-lg font-medium text-gray-900">Write</h3>
                                <p className="mt-2 text-base text-gray-500">
                                    Use our intuitive markdown editor with live preview and drag-and-drop media support.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 text-2xl mx-auto">
                                    2
                                </div>
                                <h3 className="mt-6 text-lg font-medium text-gray-900">Generate</h3>
                                <p className="mt-2 text-base text-gray-500">
                                    Our static site generator creates optimized HTML with SEO features and fast loading.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 text-2xl mx-auto">
                                    3
                                </div>
                                <h3 className="mt-6 text-lg font-medium text-gray-900">Deploy</h3>
                                <p className="mt-2 text-base text-gray-500">
                                    Push to deploy via Git integration to your favorite hosting platform.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-blue-600">
                <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                        <span className="block">Ready to start blogging?</span>
                        <span className="block">Create your account today.</span>
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-blue-200">
                        Join thousands of bloggers who've made the switch to modern, performance-focused blogging.
                    </p>
                    <div className="mt-8 flex justify-center">
                        {authStatus ? (
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/dashboard"
                                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                                >
                                    Go to Dashboard
                                </Link>
                                <Link
                                    to="/create-post"
                                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-400 transition-colors"
                                >
                                    Write Your First Post
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/signup"
                                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                                >
                                    Sign Up Free
                                </Link>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-blue-500 transition-colors"
                                >
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;