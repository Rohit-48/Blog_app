import matter from 'gray-matter';
import { marked } from 'marked';
import { format } from 'date-fns';
import slugify from 'slugify';

class StaticSiteGenerator {
    constructor(config = {}) {
        this.config = {
            siteName: config.siteName || 'My Blog',
            baseUrl: config.baseUrl || 'https://myblog.com',
            description: config.description || 'A modern blog built with React',
            author: config.author || 'Blog Author',
            postsPerPage: config.postsPerPage || 10,
            ...config
        };
        
        // Configure marked for better rendering
        marked.setOptions({
            highlight: function(code, lang) {
                // Add syntax highlighting support
                return `<pre><code class="language-${lang}">${code}</code></pre>`;
            },
            breaks: true,
            gfm: true
        });
    }

    // Generate a complete static site
    async generateSite(posts, pages = []) {
        const site = {
            pages: {},
            assets: {},
            meta: {
                generatedAt: new Date().toISOString(),
                totalPosts: posts.length,
                config: this.config
            }
        };

        // Generate homepage
        site.pages['index.html'] = this.generateHomepage(posts);
        
        // Generate individual post pages
        posts.forEach(post => {
            const slug = post.slug || slugify(post.title, { lower: true, strict: true });
            site.pages[`posts/${slug}.html`] = this.generatePostPage(post);
        });

        // Generate archive pages
        site.pages['archive.html'] = this.generateArchivePage(posts);
        
        // Generate tag pages
        const tags = this.extractAllTags(posts);
        tags.forEach(tag => {
            const tagSlug = slugify(tag, { lower: true });
            const tagPosts = posts.filter(post => post.tags && post.tags.includes(tag));
            site.pages[`tags/${tagSlug}.html`] = this.generateTagPage(tag, tagPosts);
        });

        // Generate RSS feed
        site.pages['feed.xml'] = this.generateRSSFeed(posts);
        
        // Generate sitemap
        site.pages['sitemap.xml'] = this.generateSitemap(posts);

        // Generate CSS
        site.assets['styles.css'] = this.generateCSS();
        
        // Generate manifest and other PWA files
        site.assets['manifest.json'] = this.generateManifest();

        return site;
    }

    // Generate homepage HTML
    generateHomepage(posts) {
        const recentPosts = posts
            .filter(post => post.status === 'published')
            .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
            .slice(0, this.config.postsPerPage);

        const postsHTML = recentPosts.map(post => {
            const slug = post.slug || slugify(post.title, { lower: true, strict: true });
            return `
                <article class="post-card">
                    ${post.featuredImage ? `<img src="${post.featuredImage}" alt="${post.title}" class="post-image">` : ''}
                    <div class="post-content">
                        <h2><a href="/posts/${slug}.html">${post.title}</a></h2>
                        <p class="post-meta">
                            <time datetime="${post.publishDate}">${format(new Date(post.publishDate), 'MMMM d, yyyy')}</time>
                            ${post.tags ? `• ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}` : ''}
                        </p>
                        <p class="post-excerpt">${post.excerpt || this.extractExcerpt(post.content)}</p>
                        <a href="/posts/${slug}.html" class="read-more">Read more →</a>
                    </div>
                </article>
            `;
        }).join('');

        return this.generateHTMLTemplate({
            title: this.config.siteName,
            description: this.config.description,
            content: `
                <header class="site-header">
                    <h1>${this.config.siteName}</h1>
                    <p>${this.config.description}</p>
                </header>
                <main class="post-list">
                    ${postsHTML}
                </main>
                <aside class="sidebar">
                    ${this.generateSidebar(posts)}
                </aside>
            `,
            canonical: this.config.baseUrl
        });
    }

    // Generate individual post page
    generatePostPage(post) {
        const content = marked(post.content);
        const slug = post.slug || slugify(post.title, { lower: true, strict: true });
        
        return this.generateHTMLTemplate({
            title: `${post.title} - ${this.config.siteName}`,
            description: post.metaDescription || post.excerpt || this.extractExcerpt(post.content),
            content: `
                <article class="post">
                    <header class="post-header">
                        ${post.featuredImage ? `<img src="${post.featuredImage}" alt="${post.title}" class="post-featured-image">` : ''}
                        <h1>${post.title}</h1>
                        <div class="post-meta">
                            <time datetime="${post.publishDate}">${format(new Date(post.publishDate), 'MMMM d, yyyy')}</time>
                            ${post.tags ? `• ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}` : ''}
                        </div>
                    </header>
                    <div class="post-content">
                        ${content}
                    </div>
                    <footer class="post-footer">
                        <div class="post-share">
                            <a href="https://twitter.com/intent/tweet?url=${this.config.baseUrl}/posts/${slug}.html&text=${encodeURIComponent(post.title)}" target="_blank">Share on Twitter</a>
                            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${this.config.baseUrl}/posts/${slug}.html" target="_blank">Share on LinkedIn</a>
                        </div>
                    </footer>
                </article>
                <nav class="post-navigation">
                    <a href="/" class="back-home">← Back to Home</a>
                </nav>
            `,
            canonical: `${this.config.baseUrl}/posts/${slug}.html`,
            structuredData: this.generatePostStructuredData(post)
        });
    }

    // Generate archive page
    generateArchivePage(posts) {
        const publishedPosts = posts
            .filter(post => post.status === 'published')
            .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

        const postsHTML = publishedPosts.map(post => {
            const slug = post.slug || slugify(post.title, { lower: true, strict: true });
            return `
                <div class="archive-item">
                    <time>${format(new Date(post.publishDate), 'MMM d, yyyy')}</time>
                    <a href="/posts/${slug}.html">${post.title}</a>
                </div>
            `;
        }).join('');

        return this.generateHTMLTemplate({
            title: `Archive - ${this.config.siteName}`,
            description: `All posts from ${this.config.siteName}`,
            content: `
                <header class="page-header">
                    <h1>Archive</h1>
                    <p>All ${publishedPosts.length} posts</p>
                </header>
                <div class="archive-list">
                    ${postsHTML}
                </div>
            `,
            canonical: `${this.config.baseUrl}/archive.html`
        });
    }

    // Generate tag page
    generateTagPage(tag, posts) {
        const tagSlug = slugify(tag, { lower: true });
        const postsHTML = posts.map(post => {
            const slug = post.slug || slugify(post.title, { lower: true, strict: true });
            return `
                <article class="post-card">
                    <h2><a href="/posts/${slug}.html">${post.title}</a></h2>
                    <p class="post-meta">
                        <time datetime="${post.publishDate}">${format(new Date(post.publishDate), 'MMMM d, yyyy')}</time>
                    </p>
                    <p class="post-excerpt">${post.excerpt || this.extractExcerpt(post.content)}</p>
                </article>
            `;
        }).join('');

        return this.generateHTMLTemplate({
            title: `Posts tagged "${tag}" - ${this.config.siteName}`,
            description: `All posts tagged with ${tag}`,
            content: `
                <header class="page-header">
                    <h1>Posts tagged "${tag}"</h1>
                    <p>${posts.length} posts</p>
                </header>
                <div class="post-list">
                    ${postsHTML}
                </div>
            `,
            canonical: `${this.config.baseUrl}/tags/${tagSlug}.html`
        });
    }

    // Generate RSS feed
    generateRSSFeed(posts) {
        const recentPosts = posts
            .filter(post => post.status === 'published')
            .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
            .slice(0, 20);

        const items = recentPosts.map(post => {
            const slug = post.slug || slugify(post.title, { lower: true, strict: true });
            return `
                <item>
                    <title><![CDATA[${post.title}]]></title>
                    <description><![CDATA[${post.excerpt || this.extractExcerpt(post.content)}]]></description>
                    <link>${this.config.baseUrl}/posts/${slug}.html</link>
                    <guid>${this.config.baseUrl}/posts/${slug}.html</guid>
                    <pubDate>${new Date(post.publishDate).toUTCString()}</pubDate>
                </item>
            `;
        }).join('');

        return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title>${this.config.siteName}</title>
        <description>${this.config.description}</description>
        <link>${this.config.baseUrl}</link>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <language>en-us</language>
        ${items}
    </channel>
</rss>`;
    }

    // Generate sitemap
    generateSitemap(posts) {
        const urls = [`${this.config.baseUrl}/`, `${this.config.baseUrl}/archive.html`];
        
        posts.filter(post => post.status === 'published').forEach(post => {
            const slug = post.slug || slugify(post.title, { lower: true, strict: true });
            urls.push(`${this.config.baseUrl}/posts/${slug}.html`);
        });

        const urlsXML = urls.map(url => `
            <url>
                <loc>${url}</loc>
                <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
                <changefreq>weekly</changefreq>
                <priority>0.8</priority>
            </url>
        `).join('');

        return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urlsXML}
</urlset>`;
    }

    // Generate base HTML template
    generateHTMLTemplate({ title, description, content, canonical, structuredData = '' }) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonical}">
    <link rel="stylesheet" href="/styles.css">
    <link rel="alternate" type="application/rss+xml" title="${this.config.siteName}" href="/feed.xml">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    ${structuredData}
</head>
<body>
    <nav class="main-nav">
        <a href="/" class="nav-home">${this.config.siteName}</a>
        <div class="nav-links">
            <a href="/archive.html">Archive</a>
            <a href="/feed.xml">RSS</a>
        </div>
    </nav>
    
    <div class="container">
        ${content}
    </div>
    
    <footer class="main-footer">
        <p>&copy; ${new Date().getFullYear()} ${this.config.siteName}. Built with ❤️</p>
    </footer>
    
    <!-- Analytics placeholder -->
    <script>
        // Add your analytics code here
    </script>
</body>
</html>`;
    }

    // Generate structured data for posts
    generatePostStructuredData(post) {
        const slug = post.slug || slugify(post.title, { lower: true, strict: true });
        return `
            <script type="application/ld+json">
            {
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": "${post.title}",
                "description": "${post.excerpt || this.extractExcerpt(post.content)}",
                "url": "${this.config.baseUrl}/posts/${slug}.html",
                "datePublished": "${post.publishDate}",
                "dateModified": "${post.updatedAt || post.publishDate}",
                "author": {
                    "@type": "Person",
                    "name": "${this.config.author}"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "${this.config.siteName}"
                }
            }
            </script>
        `;
    }

    // Generate CSS
    generateCSS() {
        return `/* Modern Blog Styles */
:root {
    --primary-color: #3B82F6;
    --text-color: #1F2937;
    --text-light: #6B7280;
    --border-color: #E5E7EB;
    --bg-light: #F9FAFB;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background: white;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.main-nav {
    background: white;
    border-bottom: 1px solid var(--border-color);
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
}

.main-nav .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-home {
    font-size: 1.5rem;
    font-weight: bold;
    text-decoration: none;
    color: var(--primary-color);
}

.nav-links a {
    margin-left: 2rem;
    text-decoration: none;
    color: var(--text-color);
    font-weight: 500;
}

.site-header {
    text-align: center;
    padding: 4rem 0;
    background: var(--bg-light);
}

.site-header h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.post-list {
    display: grid;
    gap: 2rem;
    margin: 2rem 0;
}

.post-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    overflow: hidden;
    transition: transform 0.2s;
}

.post-card:hover {
    transform: translateY(-2px);
}

.post-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
}

.post-content {
    padding: 1.5rem;
}

.post-content h2 {
    margin-bottom: 0.5rem;
}

.post-content h2 a {
    text-decoration: none;
    color: var(--text-color);
}

.post-meta {
    color: var(--text-light);
    font-size: 0.9rem;
    margin-bottom: 1rem;
}

.tag {
    background: var(--bg-light);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
}

.read-more {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
}

.post {
    max-width: 800px;
    margin: 2rem auto;
}

.post-header {
    text-align: center;
    margin-bottom: 2rem;
}

.post-featured-image {
    width: 100%;
    height: 400px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 2rem;
}

.post-content {
    font-size: 1.1rem;
    line-height: 1.8;
}

.post-content h1, .post-content h2, .post-content h3 {
    margin: 2rem 0 1rem;
}

.post-content p {
    margin-bottom: 1.5rem;
}

.post-content img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
}

.post-content pre {
    background: var(--bg-light);
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    margin: 1.5rem 0;
}

.main-footer {
    background: var(--bg-light);
    text-align: center;
    padding: 2rem 0;
    margin-top: 4rem;
    border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
    .container {
        padding: 0 1rem;
    }
    
    .site-header h1 {
        font-size: 2rem;
    }
    
    .nav-links a {
        margin-left: 1rem;
    }
}`;
    }

    // Generate PWA manifest
    generateManifest() {
        return JSON.stringify({
            name: this.config.siteName,
            short_name: this.config.siteName,
            description: this.config.description,
            start_url: "/",
            display: "standalone",
            background_color: "#ffffff",
            theme_color: "#3B82F6",
            icons: [
                {
                    src: "/icon-192x192.png",
                    sizes: "192x192",
                    type: "image/png"
                },
                {
                    src: "/icon-512x512.png",
                    sizes: "512x512",
                    type: "image/png"
                }
            ]
        }, null, 2);
    }

    // Helper functions
    extractExcerpt(content, length = 160) {
        const text = content.replace(/[#*`_]/g, '').trim();
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    extractAllTags(posts) {
        const tagSet = new Set();
        posts.forEach(post => {
            if (post.tags) {
                post.tags.forEach(tag => tagSet.add(tag));
            }
        });
        return Array.from(tagSet);
    }

    generateSidebar(posts) {
        const tags = this.extractAllTags(posts);
        const recentPosts = posts
            .filter(post => post.status === 'published')
            .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
            .slice(0, 5);

        return `
            <div class="sidebar-section">
                <h3>Recent Posts</h3>
                <ul>
                    ${recentPosts.map(post => {
                        const slug = post.slug || slugify(post.title, { lower: true, strict: true });
                        return `<li><a href="/posts/${slug}.html">${post.title}</a></li>`;
                    }).join('')}
                </ul>
            </div>
            <div class="sidebar-section">
                <h3>Tags</h3>
                <div class="tag-cloud">
                    ${tags.map(tag => {
                        const tagSlug = slugify(tag, { lower: true });
                        return `<a href="/tags/${tagSlug}.html" class="tag">${tag}</a>`;
                    }).join(' ')}
                </div>
            </div>
        `;
    }
}

export default StaticSiteGenerator;