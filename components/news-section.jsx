"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Search, Plus, Edit, Trash2, Calendar, ExternalLink, Newspaper } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// API functions with error handling
const api = {
  async fetchNews() {
    try {
      const res = await fetch('/api/news');
      if (!res.ok) {
        throw new Error(`Failed to fetch news: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  },

  async addNews(news) {
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(news),
      });
      if (!res.ok) {
        throw new Error(`Failed to add news: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error adding news:', error);
      throw error;
    }
  },

  async updateNews(news) {
    try {
      const res = await fetch('/api/news', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(news),
      });
      if (!res.ok) {
        throw new Error(`Failed to update news: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error updating news:', error);
      throw error;
    }
  },

  async deleteNews(id) {
    try {
      const res = await fetch('/api/news', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        throw new Error(`Failed to delete news: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error deleting news:', error);
      throw error;
    }
  }
};

// Custom hook for news management
const useNewsManagement = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchNews();
      setNews(data);
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error Loading News",
        description: "Failed to load news articles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addNews = useCallback(async (newsData) => {
    try {
      const newsItem = {
        ...newsData,
        published_at: new Date().toISOString().split("T")[0],
      };
      const created = await api.addNews(newsItem);
      setNews(prev => [...prev, created]);
      toast({
        title: "News Added",
        description: "New news article has been successfully added.",
      });
      return created;
    } catch (error) {
      toast({
        title: "Error Adding News",
        description: "Failed to add the news article. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const updateNews = useCallback(async (newsData) => {
    try {
      const updated = await api.updateNews(newsData);
      setNews(prev => prev.map(item => item.id === updated.id ? updated : item));
      toast({
        title: "News Updated",
        description: "News article has been successfully updated.",
      });
      return updated;
    } catch (error) {
      toast({
        title: "Error Updating News",
        description: "Failed to update the news article. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const deleteNews = useCallback(async (newsId) => {
    try {
      await api.deleteNews(newsId);
      setNews(prev => prev.filter(item => item.id !== newsId));
      toast({
        title: "News Deleted",
        description: "News article has been removed from the system.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error Deleting News",
        description: "Failed to delete the news article. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    news,
    loading,
    error,
    addNews,
    updateNews,
    deleteNews,
    refetch: fetchNews
  };
};

// Custom hook for search and filtering
const useNewsFiltering = (news) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNews = useMemo(() => {
    return news.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [news, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredNews
  };
};

// Custom hook for form management
const useNewsForm = (initialData = {}) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "General",
    status: "Draft",
    ...initialData
  });

  const updateForm = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      content: "",
      category: "General",
      status: "Draft",
    });
  }, []);

  const setFormDataFromNews = useCallback((newsItem) => {
    setFormData({
      title: newsItem.title || "",
      content: newsItem.content || "",
      category: newsItem.category || "General",
      status: newsItem.status || "Draft",
    });
  }, []);

  const isFormValid = useMemo(() => {
    return formData.title.trim() && formData.content.trim();
  }, [formData.title, formData.content]);

  return {
    formData,
    updateForm,
    resetForm,
    setFormDataFromNews,
    isFormValid
  };
};

// Status badge component
const StatusBadge = ({ status }) => {
  return status === "Published" ? (
    <Badge className="bg-green-100 text-green-800">Published</Badge>
  ) : (
    <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
  );
};

// Category badge component
const CategoryBadge = ({ category }) => {
  const colors = {
    "Government Scheme": "bg-blue-100 text-blue-800",
    "Weather Alert": "bg-red-100 text-red-800",
    Training: "bg-purple-100 text-purple-800",
    Insurance: "bg-green-100 text-green-800",
    General: "bg-gray-100 text-gray-800",
  };
  return <Badge className={colors[category] || "bg-gray-100 text-gray-800"}>{category}</Badge>;
};

// News card component
const NewsCard = ({ item, onView, onEdit, onDelete }) => (
  <Card className="cursor-pointer hover:shadow-md transition-shadow">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CategoryBadge category={item.category} />
          {item.featured && <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>}
        </div>
        <StatusBadge status={item.status} />
      </div>
      <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
      <CardDescription className="line-clamp-3">{item.content}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center text-sm text-muted-foreground mb-4">
        <Calendar className="h-4 w-4" />
        <span>{item.published_at ? new Date(item.published_at).toLocaleDateString() : '-'}</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm">
          <span className="font-medium">Source: </span>
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {item.source}
          </a>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onView(item)}>
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the news article from the system.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(item.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Stats cards component
const NewsStats = ({ news }) => {
  const stats = useMemo(() => {
    const totalArticles = news.length;
    const publishedCount = news.filter(n => n.status === "Published").length;
    const featuredCount = news.filter(n => n.featured).length;
    
    return { totalArticles, publishedCount, featuredCount };
  }, [news]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
          <Newspaper className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalArticles}</div>
          <p className="text-xs text-muted-foreground">News articles</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Published</CardTitle>
          <Badge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.publishedCount}</div>
          <p className="text-xs text-muted-foreground">Live articles</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Featured</CardTitle>
          <Badge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.featuredCount}</div>
          <p className="text-xs text-muted-foreground">Featured articles</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Add/Edit news dialog component
const NewsDialog = ({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  formData, 
  onFormChange, 
  onSubmit, 
  submitLabel = "Add News",
  loading = false 
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => onFormChange('title', e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="content" className="text-right">Content</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => onFormChange('content', e.target.value)}
            className="col-span-3"
            rows={4}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">Category</Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => onFormChange('category', e.target.value)}
            className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="General">General</option>
            <option value="Government Scheme">Government Scheme</option>
            <option value="Weather Alert">Weather Alert</option>
            <option value="Training">Training</option>
            <option value="Insurance">Insurance</option>
          </select>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={onSubmit} disabled={loading || !formData.title || !formData.content}>
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            submitLabel
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// News detail dialog component
const NewsDetailDialog = ({ news, open, onOpenChange }) => {
  if (!news) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{news.title}</DialogTitle>
          <DialogDescription>
            Published on {news.published_at ? new Date(news.published_at).toLocaleDateString() : '-'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <CategoryBadge category={news.category} />
            <StatusBadge status={news.status} />
            {news.featured && (
              <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
            )}
          </div>

          <div className="prose max-w-none">
            <p className="text-sm leading-relaxed">{news.content}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function NewsSection() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const { news, loading, addNews, updateNews, deleteNews } = useNewsManagement();
  const { searchTerm, setSearchTerm, filteredNews } = useNewsFiltering(news);
  const { formData, updateForm, resetForm, setFormDataFromNews, isFormValid } = useNewsForm();

  const handleAddNews = useCallback(async () => {
    try {
      await addNews(formData);
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  }, [addNews, formData, resetForm]);

  const handleEditNews = useCallback(async () => {
    if (editingNews) {
      try {
        await updateNews({ ...editingNews, ...formData });
        setEditingNews(null);
        setIsEditDialogOpen(false);
        resetForm();
      } catch (error) {
        // Error is handled in the hook
      }
    }
  }, [updateNews, editingNews, formData, resetForm]);

  const handleEditClick = useCallback((newsItem) => {
    setEditingNews(newsItem);
    setFormDataFromNews(newsItem);
    setIsEditDialogOpen(true);
  }, [setFormDataFromNews]);

  const handleViewClick = useCallback((newsItem) => {
    setSelectedNews(newsItem);
    setShowDetailDialog(true);
  }, []);

  const handleDeleteNews = useCallback(async (newsId) => {
    try {
      await deleteNews(newsId);
    } catch (error) {
      // Error is handled in the hook
    }
  }, [deleteNews]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">News Section</h1>
            <p className="text-muted-foreground">Manage agricultural news, government schemes, and announcements</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">News Section</h1>
          <p className="text-muted-foreground">Manage agricultural news, government schemes, and announcements</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add News
        </Button>
      </div>

      <NewsStats news={news} />

      <Card>
        <CardHeader>
          <CardTitle>News Articles</CardTitle>
          <CardDescription>Manage news articles and announcements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredNews.map((item) => (
              <NewsCard
                key={item.id}
                item={item}
                onView={handleViewClick}
                onEdit={handleEditClick}
                onDelete={handleDeleteNews}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add News Dialog */}
      <NewsDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Add News Article"
        description="Create a new news article or announcement"
        formData={formData}
        onFormChange={updateForm}
        onSubmit={handleAddNews}
        submitLabel="Add News"
      />

      {/* Edit News Dialog */}
      <NewsDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit News Article"
        description="Update the news article information"
        formData={formData}
        onFormChange={updateForm}
        onSubmit={handleEditNews}
        submitLabel="Update News"
      />

      {/* News Detail Dialog */}
      <NewsDetailDialog
        news={selectedNews}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />
    </div>
  );
}
