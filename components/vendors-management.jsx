"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Search, Eye, Trash2, Store, MapPin, Star, ShoppingCart, Calendar, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// API functions with error handling
const api = {
  async fetchVendors() {
    try {
      const res = await fetch('/api/vendors');
      if (!res.ok) {
        throw new Error(`Failed to fetch vendors: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  },

  async updateVendor(vendor) {
    try {
      const res = await fetch('/api/vendors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendor),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || `Failed to update vendor: ${res.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }
  },

  async deleteVendor(id) {
    try {
      const res = await fetch('/api/vendors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        throw new Error(`Failed to delete vendor: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  }
};

// Custom hook for vendor management
const useVendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchVendors();
      setVendors(data);
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error Loading Vendors",
        description: "Failed to load vendors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateVendor = useCallback(async (vendorData) => {
    try {
      const updated = await api.updateVendor(vendorData);
      setVendors(prev => prev.map(v => v.id === updated.id ? updated : v));
      toast({
        title: "Vendor Updated",
        description: "Vendor details have been updated successfully.",
      });
      return updated;
    } catch (error) {
      console.error('Update vendor error:', error);
      toast({
        title: "Error Updating Vendor",
        description: error.message || "Failed to update vendor details. Please check your database connection.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const deleteVendor = useCallback(async (vendorId) => {
    try {
      await api.deleteVendor(vendorId);
      setVendors(prev => prev.filter(vendor => vendor.id !== vendorId));
      toast({
        title: "Vendor Deleted",
        description: "Vendor has been removed from the system.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error Deleting Vendor",
        description: "Failed to delete the vendor. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  return {
    vendors,
    loading,
    error,
    updateVendor,
    deleteVendor,
    refetch: fetchVendors
  };
};

// Custom hook for search and filtering
const useVendorFiltering = (vendors) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVendors = useMemo(() => {
    return vendors.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.category.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [vendors, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredVendors
  };
};

// Custom hook for form management
const useVendorForm = (initialData = {}) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    category: "",
    rating: 0,
    total_purchase: 0,
    joinDate: "",
    avatar: "",
    ...initialData
  });

  const updateForm = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      address: "",
      category: "",
      rating: 0,
      total_purchase: 0,
      joinDate: "",
      avatar: "",
    });
  }, []);

  const setFormDataFromVendor = useCallback((vendor) => {
    setFormData({
      name: vendor.name || "",
      address: vendor.address || "",
      category: vendor.category || "",
      rating: vendor.rating || 0,
      total_purchase: vendor.total_purchase || 0,
      joinDate: vendor.joinDate || "",
      avatar: vendor.avatar || "",
    });
  }, []);

  const isFormValid = useMemo(() => {
    return formData.name.trim() && formData.address.trim();
  }, [formData.name, formData.address]);

  return {
    formData,
    updateForm,
    resetForm,
    setFormDataFromVendor,
    isFormValid
  };
};

// Category badge component
const CategoryBadge = ({ category }) => {
  const colors = {
    Grains: "bg-yellow-100 text-yellow-800",
    Vegetables: "bg-green-100 text-green-800",
    "Dairy & Other Products": "bg-blue-100 text-blue-800",
  };
  return <Badge className={colors[category] || "bg-gray-100 text-gray-800"}>{category}</Badge>;
};

// Vendor row component
const VendorRow = ({ vendor, onView, onEdit, onDelete }) => (
  <TableRow>
    <TableCell>
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={vendor.avatar || "/placeholder.svg"} />
          <AvatarFallback>
            <Store className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{vendor.name}</div>
          <div className="text-sm text-muted-foreground">Joined {vendor.joinDate}</div>
        </div>
      </div>
    </TableCell>
    <TableCell>
      <div className="flex items-center">
        <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
        {vendor.address}
      </div>
    </TableCell>
    <TableCell>
      <CategoryBadge category={vendor.category} />
    </TableCell>
    <TableCell>
      <div className="font-medium">{vendor.total_purchase}</div>
    </TableCell>
    <TableCell>
      <div className="flex items-center">
        <Star className="h-4 w-4 text-yellow-400 mr-1" />
        <span className="font-medium">{vendor.rating}</span>
      </div>
    </TableCell>
    <TableCell>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={() => onView(vendor)}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit(vendor)}>
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
                This action cannot be undone. This will permanently delete the vendor account and remove
                their purchase history from the platform.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(vendor.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TableCell>
  </TableRow>
);

// Vendor detail dialog component
const VendorDetailDialog = ({ vendor, open, onOpenChange }) => {
  if (!vendor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Vendor Details</DialogTitle>
          <DialogDescription>
            Detailed information about the vendor and their purchasing history
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={vendor.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-lg">
                <Store className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{vendor.name}</h3>
              <div className="flex items-center text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {vendor.address}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category Interest</label>
              <div className="mt-1">
                <CategoryBadge category={vendor.category} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Rating</label>
              <div className="flex items-center mt-1">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="font-medium">{vendor.rating}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Total Purchases</label>
              <p className="text-sm text-muted-foreground mt-1">
                {vendor.total_purchase} products
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Join Date</label>
              <p className="text-sm text-muted-foreground mt-1">{vendor.joinDate}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-lg font-semibold mb-2">Purchase Summary</h4>
            <div className="text-sm text-muted-foreground">
              This vendor specializes in purchasing{" "}
              <strong>{vendor.category.toLowerCase()}</strong> from farmers and has made{" "}
              <strong>{vendor.total_purchase}</strong> successful purchases since joining
              the platform.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Edit vendor dialog component
const EditVendorDialog = ({ vendor, open, onOpenChange, onSave }) => {
  const [editForm, setEditForm] = useState({
    name: "",
    address: "",
    category: "",
    rating: 0,
    total_purchase: 0,
    joinDate: "",
    avatar: "",
  });

  useEffect(() => {
    if (vendor) {
      setEditForm({
        name: vendor.name || "",
        address: vendor.address || "",
        category: vendor.category || "",
        rating: vendor.rating || 0,
        total_purchase: vendor.total_purchase || 0,
        joinDate: vendor.joinDate || "",
        avatar: vendor.avatar || "",
      });
    }
  }, [vendor]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = useCallback(() => {
    const updatedVendor = {
      ...vendor,
      ...editForm,
      rating: parseFloat(editForm.rating),
      total_purchase: parseInt(editForm.total_purchase, 10)
    };
    onSave(updatedVendor);
  }, [vendor, editForm, onSave]);

  if (!vendor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Vendor</DialogTitle>
          <DialogDescription>Update vendor details below.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input name="name" value={editForm.name} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Address</label>
            <Input name="address" value={editForm.address} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <Input name="category" value={editForm.category} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Rating</label>
            <Input name="rating" type="number" step="0.1" value={editForm.rating} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Total Purchases</label>
            <Input name="total_purchase" type="number" value={editForm.total_purchase} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Join Date</label>
            <Input name="joinDate" type="date" value={editForm.joinDate} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Avatar URL</label>
            <Input name="avatar" value={editForm.avatar} onChange={handleChange} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Stats cards component
const VendorStats = ({ vendors }) => {
  const stats = useMemo(() => {
    const totalVendors = vendors.length;
    const totalPurchases = vendors.reduce((acc, v) => acc + (v.total_purchase || 0), 0);
    const avgRating = vendors.length > 0 
      ? (vendors.reduce((acc, v) => acc + v.rating, 0) / vendors.length).toFixed(1)
      : 0;
    const categories = new Set(vendors.map(v => v.category)).size;
    
    return { totalVendors, totalPurchases, avgRating, categories };
  }, [vendors]);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
          <Store className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalVendors}</div>
          <p className="text-xs text-muted-foreground">Active buyers</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPurchases}</div>
          <p className="text-xs text-muted-foreground">Products purchased</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgRating}</div>
          <p className="text-xs text-muted-foreground">Vendor satisfaction</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categories</CardTitle>
          <Badge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.categories}</div>
          <p className="text-xs text-muted-foreground">Product categories</p>
        </CardContent>
      </Card>
    </div>
  );
};

export function VendorsManagement() {
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { vendors, loading, updateVendor, deleteVendor } = useVendorManagement();
  const { searchTerm, setSearchTerm, filteredVendors } = useVendorFiltering(vendors);

  // Check if Supabase is configured
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const handleViewVendor = useCallback((vendor) => {
    setSelectedVendor(vendor);
    setShowDetailDialog(true);
  }, []);

  const handleEditVendor = useCallback((vendor) => {
    setEditingVendor(vendor);
    setShowEditDialog(true);
  }, []);

  const handleSaveVendor = useCallback(async (updatedVendor) => {
    try {
      await updateVendor(updatedVendor);
      setShowEditDialog(false);
      setEditingVendor(null);
    } catch (error) {
      // Error is handled in the hook
    }
  }, [updateVendor]);

  const handleDeleteVendor = useCallback(async (vendorId) => {
    try {
      await deleteVendor(vendorId);
    } catch (error) {
      // Error is handled in the hook
    }
  }, [deleteVendor]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vendors Management</h1>
            <p className="text-muted-foreground">Manage vendors who buy organic products from farmers</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Vendors Management</h1>
          <p className="text-muted-foreground">Manage vendors who buy organic products from farmers</p>
        </div>
      </div>

      {!isSupabaseConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Database Not Configured</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>To enable edit and delete operations, please configure your Supabase database:</p>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Create a <code className="bg-yellow-100 px-1 rounded">.env.local</code> file in the admin directory</li>
                  <li>Add your Supabase credentials:</li>
                  <li><code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL=your_project_url</code></li>
                  <li><code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key</code></li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      <VendorStats vendors={vendors} />

      <Card>
        <CardHeader>
          <CardTitle>Vendor Database</CardTitle>
          <CardDescription>View and manage vendors who purchase organic products from farmers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Total Purchases</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <VendorRow
                    key={vendor.id}
                    vendor={vendor}
                    onView={handleViewVendor}
                    onEdit={handleEditVendor}
                    onDelete={handleDeleteVendor}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Detail Dialog */}
      <VendorDetailDialog
        vendor={selectedVendor}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />

      {/* Edit Vendor Dialog */}
      <EditVendorDialog
        vendor={editingVendor}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleSaveVendor}
      />
    </div>
  );
}
