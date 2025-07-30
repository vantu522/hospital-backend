import News from '../../models/news.model.js';

const newsController = {
  createNews: async (req, res) => {
    try {
      const imageUrl = req.file?.path || ''; // Cloudinary trả về lin
       const newsData = {
        ...req.body,
        hinhAnh: imageUrl,
        luotXem: 0,
        ngayDang: req.body.ngayDang ? new Date(req.body.ngayDang) : new Date(),
      };
      const news = new News(newsData);
      await news.save();
      res.status(201).json(news);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  getAllNews: async (req, res) => {
    try {
      const newsList = await News.find();
      res.json(newsList);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getNewsById: async (req, res) => {
    try {
      const news = await News.findById(req.params.id);
      if (!news) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
      res.json(news);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  updateNews: async (req, res) => {
    try {
      req.body.updatedAt = new Date();
      const updated = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  deleteNews: async (req, res) => {
    try {
      const deleted = await News.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
      res.json({ message: 'Đã xoá bài viết' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};

export default newsController;