"use client"

import { useEffect, useState, useCallback, useMemo } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Eye, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// API functions with error handling
const api = {
  async fetchFarmers() {
    try {
      const res = await fetch('/api/farmers');
      if (!res.ok) {
        throw new Error(`Failed to fetch farmers: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching farmers:', error);
      throw error;
    }
  },

  async addFarmer(farmer) {
    try {
      const res = await fetch('/api/farmers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(farmer),
      });
      if (!res.ok) {
        throw new Error(`Failed to add farmer: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error adding farmer:', error);
      throw error;
    }
  },

  async updateFarmer(farmer) {
    try {
      const res = await fetch('/api/farmers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(farmer),
      });
      if (!res.ok) {
        throw new Error(`Failed to update farmer: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error updating farmer:', error);
      throw error;
    }
  },

  async deleteFarmer(id) {
    try {
      const res = await fetch('/api/farmers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        throw new Error(`Failed to delete farmer: ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error deleting farmer:', error);
      throw error;
    }
  }
};

// Custom hook for farmer management
const useFarmerManagement = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchFarmers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchFarmers();
      setFarmers(data);
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error Loading Farmers",
        description: "Failed to load farmers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addFarmer = useCallback(async (farmerData) => {
    try {
      const created = await api.addFarmer(farmerData);
      setFarmers(prev => [...prev, created]);
      toast({
        title: "Farmer Added",
        description: "New farmer has been successfully added.",
      });
      return created;
    } catch (error) {
      toast({
        title: "Error Adding Farmer",
        description: "Failed to add the farmer. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const updateFarmer = useCallback(async (farmerData) => {
    try {
      const updated = await api.updateFarmer(farmerData);
      setFarmers(prev => prev.map(farmer => farmer.id === updated.id ? updated : farmer));
      toast({
        title: "Farmer Updated",
        description: "Farmer details have been updated.",
      });
      return updated;
    } catch (error) {
      toast({
        title: "Error Updating Farmer",
        description: "Failed to update farmer details.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const deleteFarmer = useCallback(async (farmerId) => {
    try {
      await api.deleteFarmer(farmerId);
      setFarmers(prev => prev.filter(farmer => farmer.id !== farmerId));
      toast({
        title: "Farmer Deleted",
        description: "Farmer has been removed from the system.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error Deleting Farmer",
        description: "Failed to delete the farmer. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  useEffect(() => {
    fetchFarmers();
  }, [fetchFarmers]);

  return {
    farmers,
    loading,
    error,
    addFarmer,
    updateFarmer,
    deleteFarmer,
    refetch: fetchFarmers
  };
};

// Custom hook for search and filtering
const useFarmerFiltering = (farmers) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredFarmers = useMemo(() => {
    return farmers.filter((farmer) => {
      const matchesSearch =
        (farmer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (farmer.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (farmer.phone || '').includes(searchTerm);

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "experienced" && getExperienceLabel(farmer) === "Experienced") ||
        (activeTab === "freshers" && getExperienceLabel(farmer) === "Fresher");

      return matchesSearch && matchesTab;
    });
  }, [farmers, searchTerm, activeTab]);

  const tabCounts = useMemo(() => {
    const experiencedCount = farmers.filter(f => getExperienceLabel(f) === "Experienced").length;
    const freshersCount = farmers.filter(f => getExperienceLabel(f) === "Fresher").length;
    return { experiencedCount, freshersCount };
  }, [farmers]);

  return {
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    filteredFarmers,
    tabCounts
  };
};

// Helper function to determine experience label
const getExperienceLabel = (farmer) => {
  if (typeof farmer.experience === 'number') {
    return farmer.experience >= 7 ? 'Experienced' : 'Fresher';
  }
  if (typeof farmer.experience === 'string') {
    const num = parseInt(farmer.experience, 10);
    if (!isNaN(num)) {
      return num >= 7 ? 'Experienced' : 'Fresher';
    }
    return farmer.experience;
  }
  return 'Fresher';
};

// Experience badge component
const ExperienceBadge = ({ experience, farmer }) => {
  const label = getExperienceLabel(farmer);
  return label === "Experienced" ? (
    <Badge className="bg-blue-100 text-blue-800">Experienced</Badge>
  ) : (
    <Badge className="bg-purple-100 text-purple-800">Fresher</Badge>
  );
};

// Farmer row component
const FarmerRow = ({ farmer, onView, onEdit, onDelete }) => (
  <TableRow>
    <TableCell>
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
          <AvatarFallback>
            {farmer.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{farmer.name}</div>
          <div className="text-sm text-muted-foreground">{farmer.location}</div>
        </div>
      </div>
    </TableCell>
    <TableCell>
      <div>
        <div className="text-sm">{farmer.email}</div>
        <div className="text-sm text-muted-foreground">{farmer.phone}</div>
      </div>
    </TableCell>
    <TableCell>
      <ExperienceBadge experience={farmer.experience} farmer={farmer} />
    </TableCell>
    <TableCell>
      {farmer.joinDate ? new Date(farmer.joinDate).toLocaleDateString() : "-"}
    </TableCell>
    <TableCell>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={() => onView(farmer)}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit(farmer)}>
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
                This action cannot be undone. This will permanently delete the farmer account and remove
                their data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(farmer.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TableCell>
  </TableRow>
);

// Farmer detail dialog component
const FarmerDetailDialog = ({ farmer, open, onOpenChange }) => {
  if (!farmer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Farmer Profile</DialogTitle>
          <DialogDescription>Detailed information about the farmer</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`/placeholder.svg?height=64&width=64`} />
              <AvatarFallback className="text-lg">
                {farmer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{farmer.name}</h3>
              <p className="text-muted-foreground">{farmer.location}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground">{farmer.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <p className="text-sm text-muted-foreground">{farmer.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Aadhar</label>
              <p className="text-sm text-muted-foreground">{farmer.aadhar}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Experience</label>
              <p className="text-sm text-muted-foreground">
                <ExperienceBadge experience={farmer.experience} farmer={farmer} />
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Join Date</label>
              <p className="text-sm text-muted-foreground">
                {farmer.joinDate ? new Date(farmer.joinDate).toLocaleDateString() : "-"}
              </p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Crops</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {farmer.crops?.map((crop, index) => (
                <Badge key={index} variant="outline">
                  {crop}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Edit farmer dialog component
const EditFarmerDialog = ({ farmer, open, onOpenChange, onSave }) => {
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "Experienced",
    location: "",
    crops: "",
  });

  useEffect(() => {
    if (farmer) {
      setEditForm({
        name: farmer.name || "",
        email: farmer.email || "",
        phone: farmer.phone || "",
        experience: farmer.experience || "Experienced",
        location: farmer.location || "",
        crops: Array.isArray(farmer.crops) ? farmer.crops.join(", ") : "",
      });
    }
  }, [farmer]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = useCallback(() => {
    const updatedFarmer = {
      ...farmer,
      ...editForm,
      crops: editForm.crops.split(",").map(c => c.trim()).filter(Boolean)
    };
    onSave(updatedFarmer);
  }, [farmer, editForm, onSave]);

  if (!farmer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Farmer</DialogTitle>
          <DialogDescription>Update farmer details below.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input name="name" value={editForm.name} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input name="email" value={editForm.email} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <Input name="phone" value={editForm.phone} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Experience</label>
            <select
              name="experience"
              value={editForm.experience}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            >
              <option value="Experienced">Experienced</option>
              <option value="Fresher">Fresher</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Location</label>
            <Input name="location" value={editForm.location} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Crops (comma separated)</label>
            <Input name="crops" value={editForm.crops} onChange={handleChange} />
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

export function FarmersManagement() {
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [editingFarmer, setEditingFarmer] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { farmers, loading, updateFarmer, deleteFarmer } = useFarmerManagement();
  const { 
    searchTerm, 
    setSearchTerm, 
    activeTab, 
    setActiveTab, 
    filteredFarmers, 
    tabCounts 
  } = useFarmerFiltering(farmers);

  const handleViewFarmer = useCallback((farmer) => {
    setSelectedFarmer(farmer);
    setShowDetailDialog(true);
  }, []);

  const handleEditFarmer = useCallback((farmer) => {
    setEditingFarmer(farmer);
    setShowEditDialog(true);
  }, []);

  const handleSaveFarmer = useCallback(async (updatedFarmer) => {
    try {
      await updateFarmer(updatedFarmer);
      setShowEditDialog(false);
      setEditingFarmer(null);
    } catch (error) {
      // Error is handled in the hook
    }
  }, [updateFarmer]);

  const handleDeleteFarmer = useCallback(async (farmerId) => {
    try {
      await deleteFarmer(farmerId);
    } catch (error) {
      // Error is handled in the hook
    }
  }, [deleteFarmer]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Farmers Management</h1>
          <p className="text-muted-foreground">Manage farmer registrations, verifications, and profiles</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Farmers Management</h1>
        <p className="text-muted-foreground">Manage farmer registrations, verifications, and profiles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Farmers Database</CardTitle>
          <CardDescription>View and manage all registered farmers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All ({farmers.length})</TabsTrigger>
              <TabsTrigger value="experienced">
                Experienced ({tabCounts.experiencedCount})
              </TabsTrigger>
              <TabsTrigger value="freshers">
                Freshers ({tabCounts.freshersCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFarmers.map((farmer) => (
                  <FarmerRow
                    key={farmer.id}
                    farmer={farmer}
                    onView={handleViewFarmer}
                    onEdit={handleEditFarmer}
                    onDelete={handleDeleteFarmer}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Farmer Detail Dialog */}
      <FarmerDetailDialog
        farmer={selectedFarmer}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />

      {/* Edit Farmer Dialog */}
      <EditFarmerDialog
        farmer={editingFarmer}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleSaveFarmer}
      />
    </div>
  );
}
