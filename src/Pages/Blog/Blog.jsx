import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import './Blog.css';

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch blogs
    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            // Trying '/blog' first as per common convention given file naming
            // If the user mounted it elsewhere, this might need adjustment
            const response = await api.get('/blog');
            if (response.data) {
                // Adjust based on actual response structure. 
                // Assuming response.data is the array or response.data.blogs
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
                // Sort by createdAt descending (newest first)
                blogData = blogData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setBlogs(blogData);
            }
        } catch (err) {
            console.error("Error searching blogs:", err);
            // Fallback to local filtering if API fails
            // setBlogs(prev => prev.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase())));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading && blogs.length === 0) {
        return (
            <div className="blog-container">
                <div className="blog-loading">Loading specific insights...</div>
            </div>
        );
    }

    return (
        <div className="blog-container">
            <div className="blog-header">
                <h1>Community Blog</h1>
                <p>Latest updates, teachings, and stories.</p>

                <form onSubmit={handleSearch} style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Search blogs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            padding: '10px 15px',
                            borderRadius: '25px',
                            border: '1px solid #ddd',
                            width: '300px',
                            fontSize: '1rem'
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: '10px 25px',
                            borderRadius: '25px',
                            border: 'none',
                            background: '#2c3e50',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        Search
                    </button>
                </form>
            </div>

            {error && <div className="blog-error">{error}</div>}

            <div className="blog-grid">
                {blogs.map((blog) => (
                    <div key={blog._id} className="blog-card" onClick={() => setSelectedBlog(blog)}>
                        {blog.media && blog.media.length > 0 && (
                            <img
                                src={blog.media[0]}
                                alt={blog.title}
                                className="blog-image"
                                onError={(e) => { e.target.style.display = 'none' }}
                            />
                        )}
                        <div className="blog-content">
                            <h3 className="blog-title">{blog.title}</h3>
                            <div className="blog-excerpt">
                                {blog.content}
                            </div>
                            <div className="blog-meta">
                                <span>{formatDate(blog.createdAt)}</span>
                                <button className="read-more-btn">Read More</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {blogs.length === 0 && !loading && !error && (
                <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
                    No blogs found.
                </div>
            )}

            {selectedBlog && (
                <div className="blog-modal-overlay" onClick={() => setSelectedBlog(null)}>
                    <div className="blog-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setSelectedBlog(null)}>&times;</button>

                        {selectedBlog.media && selectedBlog.media.length > 0 && (
                            <img
                                src={selectedBlog.media[0]}
                                alt={selectedBlog.title}
                                className="blog-detail-image"
                            />
                        )}

                        <div className="blog-detail-content">
                            <h2 className="blog-detail-title">{selectedBlog.title}</h2>
                            <span className="blog-detail-date">{formatDate(selectedBlog.createdAt)}</span>

                            <div className="blog-detail-text">
                                {selectedBlog.content}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Blog;
