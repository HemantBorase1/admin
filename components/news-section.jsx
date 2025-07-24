"use client"

import { useState, useEffect } from "react"
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

// API functions
async function fetchNews() {
  const res = await fetch('/api/news');
  if (!res.ok) throw new Error('Failed to fetch news');
  return await res.json();
}

async function addNews(news) {
  const res = await fetch('/api/news', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(news),
  });
  if (!res.ok) throw new Error('Failed to add news');
  return await res.json();
}

async function updateNews(news) {
  const res = await fetch('/api/news', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(news),
  });
  if (!res.ok) throw new Error('Failed to update news');
  return await res.json();
}

async function deleteNews(id) {
  const res = await fetch('/api/news', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error('Failed to delete news');
  return await res.json();
}

export function NewsSection() {
  const [news, setNews] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingNews, setEditingNews] = useState(null)
  const [selectedNews, setSelectedNews] = useState(null)
  const [newNews, setNewNews] = useState({
    title: "",
    content: "",
    category: "General",
    status: "Draft",
  })
  const { toast } = useToast()

  // Fetch news on mount
  useEffect(() => {
    fetchNews().then(setNews)
  }, [])

  const filteredNews = news.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddNews = () => {
    const newsItem = {
      ...newNews,
      published_at: new Date().toISOString().split("T")[0],
    }
    addNews(newsItem).then((created) => {
      setNews([...news, created])
      setNewNews({
        title: "",
        content: "",
        category: "General",
        status: "Draft",
      })
      setIsAddDialogOpen(false)
      toast({
        title: "News Added",
        description: "New news article has been successfully added.",
      })
    })
  }

  const handleEditNews = () => {
    if (editingNews) {
      updateNews(editingNews).then((updated) => {
        setNews(news.map((item) => (item.id === updated.id ? updated : item)))
        setEditingNews(null)
        toast({
          title: "News Updated",
          description: "News article has been successfully updated.",
        })
      })
    }
  }

  const handleDeleteNews = (newsId) => {
    deleteNews(newsId).then(() => {
      setNews(news.filter((item) => item.id !== newsId))
      toast({
        title: "News Deleted",
        description: "News article has been removed.",
        variant: "destructive",
      })
    })
  }

  const getStatusBadge = (status) => {
    return status === "Published" ? (
      <Badge className="bg-green-100 text-green-800">Published</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
    )
  }

  const getCategoryBadge = (category) => {
    const colors = {
      "Government Scheme": "bg-blue-100 text-blue-800",
      "Weather Alert": "bg-red-100 text-red-800",
      Training: "bg-purple-100 text-purple-800",
      Insurance: "bg-green-100 text-green-800",
      General: "bg-gray-100 text-gray-800",
    }
    return <Badge className={colors[category] || "bg-gray-100 text-gray-800"}>{category}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">News Section</h1>
          <p className="text-muted-foreground">Manage agricultural news, government schemes, and announcements</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add News
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add News Article</DialogTitle>
              <DialogDescription>Create a new news article or announcement</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={newNews.title}
                  onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="content" className="text-right">
                  Content
                </Label>
                <Textarea
                  id="content"
                  value={newNews.content}
                  onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                  className="col-span-3"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <select
                  id="category"
                  value={newNews.category}
                  onChange={(e) => setNewNews({ ...newNews, category: e.target.value })}
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
              <Button onClick={handleAddNews} disabled={!newNews.title || !newNews.content}>
                Add News
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{news.length}</div>
            <p className="text-xs text-muted-foreground">News articles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{news.filter((n) => n.status === "Published").length}</div>
            <p className="text-xs text-muted-foreground">Live articles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{news.filter((n) => n.featured).length}</div>
            <p className="text-xs text-muted-foreground">Featured articles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{news.reduce((acc, n) => acc + n.views, 0)}</div>
            <p className="text-xs text-muted-foreground">Article views</p>
          </CardContent>
        </Card>
      </div>

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
              <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryBadge(item.category)}
                      {item.featured && <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>}
                    </div>
                    {getStatusBadge(item.status)}
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedNews(item)}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{selectedNews?.title}</DialogTitle>
                            <DialogDescription>
                              Published on {selectedNews?.published_at ? new Date(selectedNews.published_at).toLocaleDateString() : '-'}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedNews && (
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2">
                                {getCategoryBadge(selectedNews.category)}
                                {getStatusBadge(selectedNews.status)}
                                {selectedNews.featured && (
                                  <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                                )}
                              </div>

                              <div className="prose max-w-none">
                                <p className="text-sm leading-relaxed">{selectedNews.content}</p>
                              </div>

                              {/* Source and views removed */}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setEditingNews(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit News Article</DialogTitle>
                            <DialogDescription>Update the news article information</DialogDescription>
                          </DialogHeader>
                          {editingNews && (
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-title" className="text-right">
                                  Title
                                </Label>
                                <Input
                                  id="edit-title"
                                  value={editingNews.title}
                                  onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-content" className="text-right">
                                  Content
                                </Label>
                                <Textarea
                                  id="edit-content"
                                  value={editingNews.content}
                                  onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })}
                                  className="col-span-3"
                                  rows={4}
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-category" className="text-right">
                                  Category
                                </Label>
                                <select
                                  id="edit-category"
                                  value={editingNews.category}
                                  onChange={(e) => setEditingNews({ ...editingNews, category: e.target.value })}
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
                          )}
                          <DialogFooter>
                            <Button onClick={handleEditNews}>Update News</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

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
                              This action cannot be undone. This will permanently delete the news article from the
                              system.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteNews(item.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
