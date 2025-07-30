"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
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

// API functions with error handling
const api = {
  async fetchBanners() {
    try {
      const res = await fetch('/api/banners');
      if (!res.ok) {
        throw new Error(`Failed to fetch banners: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  },

  async addBanner(banner) {
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banner),
      });
      if (!res.ok) {
        throw new Error(`Failed to add banner: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error adding banner:', error);
      throw error;
    }
  },

  async updateBanner(banner) {
    try {
      const res = await fetch('/api/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banner),
      });
      if (!res.ok) {
        throw new Error(`Failed to update banner: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
  },

  async deleteBanner(id) {
    try {
      const res = await fetch('/api/banners', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        throw new Error(`Failed to delete banner: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  }
};

// Custom hook for banner management
const useBannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchBanners();
      setBanners(data);
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error Loading Banners",
        description: "Failed to load banners. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addBanner = useCallback(async (bannerData) => {
    try {
      const banner = {
        ...bannerData,
        published_at: new Date().toISOString().split("T")[0],
      };
      const created = await api.addBanner(banner);
      setBanners(prev => [...prev, created]);
      toast({
        title: "Banner Added",
        description: "New banner has been successfully created.",
      });
      return created;
    } catch (error) {
      toast({
        title: "Error Adding Banner",
        description: "Failed to add the banner. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const updateBanner = useCallback(async (bannerData) => {
    try {
      const updated = await api.updateBanner(bannerData);
      setBanners(prev => prev.map(banner => banner.id === updated.id ? updated : banner));
      toast({
        title: "Banner Updated",
        description: "Banner has been successfully updated.",
      });
      return updated;
    } catch (error) {
      toast({
        title: "Error Updating Banner",
        description: "Failed to update the banner. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const deleteBanner = useCallback(async (bannerId) => {
    try {
      await api.deleteBanner(bannerId);
      setBanners(prev => prev.filter(banner => banner.id !== bannerId));
      toast({
        title: "Banner Deleted",
        description: "Banner has been removed from the system.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error Deleting Banner",
        description: "Failed to delete the banner. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const toggleBannerStatus = useCallback(async (bannerId) => {
    const banner = banners.find(b => b.id === bannerId);
    if (banner) {
      try {
        const updated = await api.updateBanner({ ...banner, isActive: !banner.isActive });
        setBanners(prev => prev.map(b => b.id === updated.id ? updated : b));
        toast({
          title: "Banner Status Updated",
          description: "Banner visibility has been toggled.",
        });
      } catch (error) {
        toast({
          title: "Error Updating Status",
          description: "Failed to update banner status.",
          variant: "destructive",
        });
      }
    }
  }, [banners, toast]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  return {
    banners,
    loading,
    error,
    addBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    refetch: fetchBanners
  };
};

// Custom hook for form management
const useBannerForm = (initialData = {}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    isActive: true,
    ...initialData
  });

  const updateForm = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      isActive: true,
    });
  }, []);

  const setFormDataFromBanner = useCallback((banner) => {
    setFormData({
      title: banner.title || "",
      description: banner.description || "",
      imageUrl: banner.imageUrl || "",
      isActive: banner.isActive ?? true,
    });
  }, []);

  const isFormValid = useMemo(() => {
    return formData.title.trim() && formData.imageUrl.trim();
  }, [formData.title, formData.imageUrl]);

  return {
    formData,
    updateForm,
    resetForm,
    setFormDataFromBanner,
    isFormValid
  };
};

// Image upload component
const ImageUpload = ({ value, onChange, label = "Banner Image" }) => {
  const handleImageUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real application, you would upload to Cloudinary here
      const mockCloudinaryUrl = `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(file.name)}`;
      onChange(mockCloudinaryUrl);
    }
  }, [onChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor="image">{label}</Label>
      <div className="space-y-2">
        <Input 
          id="image" 
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload} 
        />
        {value && (
          <img
            src={value}
            alt="Banner preview"
            className="w-full h-32 object-cover rounded-md border"
          />
        )}
      </div>
    </div>
  );
};

// Banner card component
const BannerCard = ({ banner, onEdit, onDelete, onToggleStatus }) => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
    <div className="relative">
      <img
        src={banner.imageUrl || "/placeholder.svg"}
        alt={banner.title}
        className="w-full h-48 object-cover"
      />
      <div className="absolute top-2 right-2">
        <Badge variant={banner.isActive ? "default" : "secondary"}>
          {banner.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>
    </div>
    <CardHeader>
      <CardTitle className="text-lg">{banner.title}</CardTitle>
      <CardDescription className="line-clamp-2">{banner.description}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
        <span>Created: {banner.created_at ? new Date(banner.created_at).toLocaleDateString() : '-'}</span>
        <span>Status: {banner.status || (banner.isActive ? 'Active' : 'Inactive')}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onToggleStatus(banner.id)}
          title={banner.isActive ? "Hide Banner" : "Show Banner"}
        >
          {banner.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="sm" onClick={() => onEdit(banner)}>
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
                This action cannot be undone. This will permanently delete the banner and remove it from all displays.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(banner.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CardContent>
  </Card>
);

// Add/Edit banner dialog component
const BannerDialog = ({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  formData, 
  onFormChange, 
  onSubmit, 
  submitLabel = "Create Banner",
  loading = false 
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl">
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
          <Label htmlFor="description" className="text-right">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onFormChange('description', e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <ImageUpload
            value={formData.imageUrl}
            onChange={(value) => onFormChange('imageUrl', value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={onSubmit} disabled={loading || !formData.title || !formData.imageUrl}>
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              {submitLabel}
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export function BannersManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const { banners, loading, addBanner, updateBanner, deleteBanner, toggleBannerStatus } = useBannerManagement();
  const { formData, updateForm, resetForm, setFormDataFromBanner, isFormValid } = useBannerForm();

  const handleAddBanner = useCallback(async () => {
    try {
      await addBanner(formData);
      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  }, [addBanner, formData, resetForm]);

  const handleEditBanner = useCallback(async () => {
    if (editingBanner) {
      try {
        await updateBanner({ ...editingBanner, ...formData });
        setEditingBanner(null);
        setIsEditDialogOpen(false);
        resetForm();
      } catch (error) {
        // Error is handled in the hook
      }
    }
  }, [updateBanner, editingBanner, formData, resetForm]);

  const handleEditClick = useCallback((banner) => {
    setEditingBanner(banner);
    setFormDataFromBanner(banner);
    setIsEditDialogOpen(true);
  }, [setFormDataFromBanner]);

  const handleDeleteBanner = useCallback(async (bannerId) => {
    try {
      await deleteBanner(bannerId);
    } catch (error) {
      // Error is handled in the hook
    }
  }, [deleteBanner]);

  const handleToggleStatus = useCallback((bannerId) => {
    toggleBannerStatus(bannerId);
  }, [toggleBannerStatus]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Banners Management</h1>
            <p className="text-muted-foreground">Manage promotional banners and advertisements</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Banners Management</h1>
          <p className="text-muted-foreground">Manage promotional banners and advertisements</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Banner
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {banners.map((banner) => (
          <BannerCard
            key={banner.id}
            banner={banner}
            onEdit={handleEditClick}
            onDelete={handleDeleteBanner}
            onToggleStatus={handleToggleStatus}
          />
        ))}
      </div>

      {/* Add Banner Dialog */}
      <BannerDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        title="Add New Banner"
        description="Create a new promotional banner for the platform"
        formData={formData}
        onFormChange={updateForm}
        onSubmit={handleAddBanner}
        submitLabel="Create Banner"
      />

      {/* Edit Banner Dialog */}
      <BannerDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Banner"
        description="Update banner information and image"
        formData={formData}
        onFormChange={updateForm}
        onSubmit={handleEditBanner}
        submitLabel="Update Banner"
      />
    </div>
  );
}
