"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Upload, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// API functions
async function fetchBanners() {
  const res = await fetch('/api/banners');
  if (!res.ok) throw new Error('Failed to fetch banners');
  return await res.json();
}

async function addBanner(banner) {
  const res = await fetch('/api/banners', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(banner),
  });
  if (!res.ok) throw new Error('Failed to add banner');
  return await res.json();
}

async function updateBanner(banner) {
  const res = await fetch('/api/banners', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(banner),
  });
  if (!res.ok) throw new Error('Failed to update banner');
  return await res.json();
}

async function deleteBanner(id) {
  const res = await fetch('/api/banners', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error('Failed to delete banner');
  return await res.json();
}

export function BannersManagement() {
  const [banners, setBanners] = useState([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [newBanner, setNewBanner] = useState({
    title: "",
    description: "",
    imageUrl: "",
    isActive: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchBanners().then(setBanners)
  }, [])

  const handleAddBanner = () => {
    const banner = {
      ...newBanner,
      createdDate: new Date().toISOString().split("T")[0],
      clickCount: 0,
    }
    addBanner(banner).then((created) => {
      setBanners([...banners, created])
    setNewBanner({ title: "", description: "", imageUrl: "", isActive: true })
    setIsAddDialogOpen(false)
    toast({
      title: "Banner Added",
      description: "New banner has been successfully created.",
      })
    })
  }

  const handleEditBanner = () => {
    if (editingBanner) {
      updateBanner(editingBanner).then((updated) => {
        setBanners(banners.map((banner) => (banner.id === updated.id ? updated : banner)))
      setEditingBanner(null)
      toast({
        title: "Banner Updated",
        description: "Banner has been successfully updated.",
        })
      })
    }
  }

  const handleDeleteBanner = (bannerId) => {
    deleteBanner(bannerId).then(() => {
    setBanners(banners.filter((banner) => banner.id !== bannerId))
    toast({
      title: "Banner Deleted",
      description: "Banner has been removed from the system.",
      variant: "destructive",
      })
    })
  }

  const handleToggleStatus = (bannerId) => {
    const banner = banners.find((b) => b.id === bannerId)
    if (banner) {
      updateBanner({ ...banner, isActive: !banner.isActive }).then((updated) => {
        setBanners(banners.map((b) => (b.id === updated.id ? updated : b)))
    toast({
      title: "Banner Status Updated",
      description: "Banner visibility has been toggled.",
    })
      })
    }
  }

  const handleImageUpload = (event, isEditing = false) => {
    const file = event.target.files?.[0]
    if (file) {
      // In a real application, you would upload to Cloudinary here
      const mockCloudinaryUrl = `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(file.name)}`

      if (isEditing && editingBanner) {
        setEditingBanner({ ...editingBanner, imageUrl: mockCloudinaryUrl })
      } else {
        setNewBanner({ ...newBanner, imageUrl: mockCloudinaryUrl })
      }

      toast({
        title: "Image Uploaded",
        description: "Banner image has been uploaded successfully.",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banners Management</h1>
          <p className="text-muted-foreground">Manage promotional banners and advertisements</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Banner</DialogTitle>
              <DialogDescription>Create a new promotional banner for the platform</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newBanner.description}
                  onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">
                  Banner Image
                </Label>
                <div className="col-span-3 space-y-2">
                  <Input id="image" type="file" accept="image/*" onChange={(e) => handleImageUpload(e)} />
                  {newBanner.imageUrl && (
                    <img
                      src={newBanner.imageUrl || "/placeholder.svg"}
                      alt="Banner preview"
                      className="w-full h-32 object-cover rounded-md border"
                    />
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddBanner} disabled={!newBanner.title || !newBanner.imageUrl}>
                <Upload className="mr-2 h-4 w-4" />
                Create Banner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {banners.map((banner) => (
          <Card key={banner.id} className="overflow-hidden">
            <div className="relative">
              <img
                src={banner.imageUrl || "/placeholder.svg"}
                alt={banner.title}
                className="w-full h-48 object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{banner.title}</CardTitle>
              <CardDescription>{banner.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                <span>Created: {banner.created_at ? new Date(banner.created_at).toLocaleDateString() : '-'}</span>
                <span>Status: {banner.status || (banner.isActive ? 'Active' : 'Inactive')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(banner.id)}>
                  {banner.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setEditingBanner(banner)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Banner</DialogTitle>
                      <DialogDescription>Update banner information and image</DialogDescription>
                    </DialogHeader>
                    {editingBanner && (
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-title" className="text-right">
                            Title
                          </Label>
                          <Input
                            id="edit-title"
                            value={editingBanner.title}
                            onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-description" className="text-right">
                            Description
                          </Label>
                          <Textarea
                            id="edit-description"
                            value={editingBanner.description}
                            onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="edit-image" className="text-right">
                            Banner Image
                          </Label>
                          <div className="col-span-3 space-y-2">
                            <Input
                              id="edit-image"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, true)}
                            />
                            {editingBanner.imageUrl && (
                              <img
                                src={editingBanner.imageUrl || "/placeholder.svg"}
                                alt="Banner preview"
                                className="w-full h-32 object-cover rounded-md border"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button onClick={handleEditBanner}>Update Banner</Button>
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
                        This action cannot be undone. This will permanently delete the banner and remove it from all
                        displays.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteBanner(banner.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

