import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import './Blog.css';

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedBlogs, setExpandedBlogs] = useState({});
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch blogs
    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/blog');
            if (response.data) {
                let blogData = Array.isArray(response.data) ? response.data :
                    (response.data.blogs || response.data.data || []);
                // Sort by createdAt descending (newest first)
                blogData = blogData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setBlogs(blogData);
            }
        } catch (err) {
            console.error("Error fetching blogs:", err);
            setError("Failed to load blogs. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            fetchBlogs();
            return;
        }

        try {
            setLoading(true);
            const response = await api.get(`/blog/search/${searchQuery}`);
            if (response.data) {
                let blogData = Array.isArray(response.data) ? response.data :
                    (response.data.blogs || response.data.data || []);
                blogData = blogData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setBlogs(blogData);
            }
        } catch (err) {
            console.error("Error searching blogs:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const toggleExpand = (blogId) => {
        setExpandedBlogs(prev => ({
            ...prev,
            [blogId]: !prev[blogId]
        }));
    };

    const shouldShowSeeMore = (content) => {
        // Show "see more" if content exceeds ~3 lines (roughly 200 characters)
        return content && content.length > 200;
    };

    if (loading && blogs.length === 0) {
        return (
            <div className="blog-container">
                <div className="blog-loading">
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="blog-container">
            <div className="blog-header">
                <h1>Community Feed</h1>
                <p>Latest updates, teachings, and stories from our community.</p>

                <form onSubmit={handleSearch} className="blog-search-form">
                    <div className="search-input-wrapper">
                        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="blog-search-input"
                        />
                    </div>
                    <button type="submit" className="blog-search-btn">
                        Search
                    </button>
                </form>
            </div>

            {error && <div className="blog-error">{error}</div>}

            <div className="blog-feed">
                {blogs.map((blog) => {
                    const isExpanded = expandedBlogs[blog._id];
                    const needsSeeMore = shouldShowSeeMore(blog.content);

                    return (
                        <article key={blog._id} className="blog-post">
                            {/* Post Header */}
                            <div className="post-header">
                                <div className="author-avatar">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>
                                <div className="post-info">
                                    <span className="author-name">{blog.author || 'Admin'}</span>
                                    <span className="post-time">{formatDate(blog.createdAt)}</span>
                                </div>
                            </div>

                            {/* Post Title */}
                            <h2 className="post-title">{blog.title}</h2>

                            {/* Post Content */}
                            <div className={`post-content ${isExpanded ? 'expanded' : ''}`}>
                                <p>{blog.content}</p>
                            </div>

                            {needsSeeMore && !isExpanded && (
                                <button
                                    className="see-more-btn"
                                    onClick={() => toggleExpand(blog._id)}
                                >
                                    ...see more
                                </button>
                            )}

                            {isExpanded && (
                                <button
                                    className="see-more-btn"
                                    onClick={() => toggleExpand(blog._id)}
                                >
                                    see less
                                </button>
                            )}

                            {/* Post Media */}
                            {blog.media && blog.media.length > 0 && (
                                <div className="post-media">
                                    <img
                                        src={blog.media[0]}
                                        alt={blog.title}
                                        onError={(e) => { e.target.style.display = 'none' }}
                                    />
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>

            {blogs.length === 0 && !loading && !error && (
                <div className="no-posts">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    <p>No posts yet. Check back later!</p>
                </div>
            )}
        </div>
    );
};

export default Blog;
