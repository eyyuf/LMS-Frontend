import blog from "../models/blog.js";


export const createBlog = async (req, res) => {
    try {
        const { title, content, author } = req.body;
        const media = req.files;

        if (!media || !title || !content || !author) {
            return res.json({ success: false, message: "All fields are required" });
        }
        const mediaPaths = media.map(file => file.path);

        const newBlog = new blog({ title, content, author, media: mediaPaths });
        await newBlog.save();
        res.json({ success: true, message: "Blog created successfully", blog: newBlog });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
export const getBlog = async (req, res) => {
    try {
        const blog = await blog.findById(req.params.id);
        if (!blog) {
            return res.json({ success: false, message: "Blog not found" });
        }
        res.json({ success: true, blog });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await blog.find();
        res.json({ success: true, blogs });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
export const updateBlog = async (req, res) => {
    try {
        const { title, content, author } = req.body;
        const media = req.file?.path;
        const blog = await blog.findById(req.params.id);
        if (!blog) {
            return res.json({ success: false, message: "Blog not found" });
        }
        blog.title = title;
        blog.content = content;
        blog.author = author;
        blog.media = media;
        await blog.save();
        res.json({ success: true, message: "Blog updated successfully", blog });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
export const deleteBlog = async (req, res) => {
    try {
        const blog = await blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.json({ success: false, message: "Blog not found" });
        }
        res.json({ success: true, message: "Blog deleted successfully", blog });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
export const searchBlog = async (req, res) => {
    try {
        const blogs = await blog.find({ title: { $regex: req.params.query, $options: "i" } });
        res.json({ success: true, blogs });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}; 