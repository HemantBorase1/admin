"use client"

import { useEffect, useState } from "react";
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

// const farmersData = [
//   {
//     id: 1,
//     name: "Rajesh Kumar",
//     email: "rajesh@example.com",
//     phone: "+91 9876543210",
//     aadhar: "1234-5678-9012",
//     experience: "Experienced",
//     status: "Verified",
//     joinDate: "2024-01-15",
//     location: "Punjab",
//     crops: ["Wheat", "Rice"],
//   },
//   {
//     id: 2,
//     name: "Priya Sharma",
//     email: "priya@example.com",
//     phone: "+91 9876543211",
//     aadhar: "2345-6789-0123",
//     experience: "Fresher",
//     status: "Pending",
//     joinDate: "2024-02-20",
//     location: "Haryana",
//     crops: ["Corn", "Sugarcane"],
//   },
//   {
//     id: 3,
//     name: "Amit Patel",
//     email: "amit@example.com",
//     phone: "+91 9876543212",
//     aadhar: "3456-7890-1234",
//     experience: "Experienced",
//     status: "Verified",
//     joinDate: "2024-01-10",
//     location: "Gujarat",
//     crops: ["Cotton", "Groundnut"],
//   },
//   {
//     id: 4,
//     name: "Sunita Devi",
//     email: "sunita@example.com",
//     phone: "+91 9876543213",
//     aadhar: "4567-8901-2345",
//     experience: "Fresher",
//     status: "Rejected",
//     joinDate: "2024-03-05",
//     location: "Bihar",
//     crops: ["Rice", "Wheat"],
//   },
// ]

async function fetchFarmers() {
  try {
    const res = await fetch('/api/farmers');
    if (!res.ok) {
      console.error('Failed to fetch farmers:', res.status);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching farmers:', error);
    return [];
  }
}

async function addFarmer(farmer) {
  try {
    const res = await fetch('/api/farmers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(farmer),
    });
    if (!res.ok) {
      console.error('Failed to add farmer:', res.status);
      throw new Error('Failed to add farmer');
    }
    return await res.json();
  } catch (error) {
    console.error('Error adding farmer:', error);
    throw error;
  }
}

async function updateFarmer(farmer) {
  try {
    const res = await fetch('/api/farmers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(farmer),
    });
    if (!res.ok) {
      console.error('Failed to update farmer:', res.status);
      throw new Error('Failed to update farmer');
    }
    return await res.json();
  } catch (error) {
    console.error('Error updating farmer:', error);
    throw error;
  }
}

async function deleteFarmer(id) {
  try {
    const res = await fetch('/api/farmers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      console.error('Failed to delete farmer:', res.status);
      throw new Error('Failed to delete farmer');
    }
    return await res.json();
  } catch (error) {
    console.error('Error deleting farmer:', error);
    throw error;
  }
}

export function FarmersManagement() {
  const [farmers, setFarmers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFarmer, setSelectedFarmer] = useState(null)
  const [activeTab, setActiveTab] = useState("all")
  const [editingFarmer, setEditingFarmer] = useState(null)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "Experienced",
    location: "",
    crops: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchFarmers().then(setFarmers).catch(error => {
      console.error('Error setting farmers:', error);
      setFarmers([]);
    });
  }, []);

  // Helper to determine experience label
  function getExperienceLabel(farmer) {
    if (typeof farmer.experience === 'number') {
      return farmer.experience >= 7 ? 'Experienced' : 'Fresher';
    }
    if (typeof farmer.experience === 'string') {
      // If it's a string that can be parsed as a number
      const num = parseInt(farmer.experience, 10);
      if (!isNaN(num)) {
        return num >= 7 ? 'Experienced' : 'Fresher';
      }
      // Otherwise, return the string as-is (for legacy data)
      return farmer.experience;
    }
    return 'Fresher';
  }

  // Calculate counts for tabs
  const experiencedCount = farmers.filter(f => getExperienceLabel(f) === "Experienced").length;
  const freshersCount = farmers.filter(f => getExperienceLabel(f) === "Fresher").length;

  const filteredFarmers = farmers.filter((farmer) => {
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

  const handleDelete = (farmerId) => {
    deleteFarmer(farmerId)
      .then(() => {
        setFarmers(farmers.filter((farmer) => farmer.id !== farmerId));
        toast({
          title: "Farmer Deleted",
          description: "Farmer has been removed from the system.",
          variant: "destructive",
        })
      })
      .catch((error) => {
        console.error('Error deleting farmer:', error);
        toast({
          title: "Error Deleting Farmer",
          description: "Failed to delete the farmer. Please try again.",
          variant: "destructive",
        })
      })
  }

  const handleEditClick = (farmer) => {
    setEditingFarmer(farmer)
    setEditForm({
      name: farmer.name,
      email: farmer.email,
      phone: farmer.phone,
      experience: farmer.experience,
      location: farmer.location,
      crops: farmer.crops.join(", "),
    })
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSave = () => {
    updateFarmer({ ...editingFarmer, ...editForm, crops: editForm.crops.split(",").map((c) => c.trim()).filter(Boolean) })
      .then(() => {
        setFarmers(farmers.map((f) => (f.id === editingFarmer.id ? { ...f, ...editForm, crops: editForm.crops.split(",").map((c) => c.trim()).filter(Boolean) } : f)));
        setEditingFarmer(null);
        toast({
          title: "Farmer Updated",
          description: "Farmer details have been updated.",
          variant: "default",
        });
      })
      .catch(() => {
        toast({
          title: "Error Updating Farmer",
          description: "Failed to update farmer details.",
          variant: "destructive",
        });
      });
  }

  const handleEditCancel = () => {
    setEditingFarmer(null)
  }

  const getExperienceBadge = (experience, farmer) => {
    const label = getExperienceLabel(farmer);
    return label === "Experienced" ? (
      <Badge className="bg-blue-100 text-blue-800">Experienced</Badge>
    ) : (
      <Badge className="bg-purple-100 text-purple-800">Fresher</Badge>
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
                Experienced ({experiencedCount})
              </TabsTrigger>
              <TabsTrigger value="freshers">
                Freshers ({freshersCount})
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
                  <TableRow key={farmer.id}>
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
                    <TableCell>{getExperienceBadge(farmer.experience, farmer)}</TableCell>
                    <TableCell>{farmer.joinDate ? new Date(farmer.joinDate).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedFarmer(farmer)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Farmer Profile</DialogTitle>
                              <DialogDescription>Detailed information about the farmer</DialogDescription>
                            </DialogHeader>
                            {selectedFarmer && (
                              <div className="grid gap-4">
                                <div className="flex items-center space-x-4">
                                  <Avatar className="h-16 w-16">
                                    <AvatarImage src={`/placeholder.svg?height=64&width=64`} />
                                    <AvatarFallback className="text-lg">
                                      {selectedFarmer.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="text-lg font-semibold">{selectedFarmer.name}</h3>
                                    <p className="text-muted-foreground">{selectedFarmer.location}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <p className="text-sm text-muted-foreground">{selectedFarmer.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Phone</label>
                                    <p className="text-sm text-muted-foreground">{selectedFarmer.phone}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Aadhar</label>
                                    <p className="text-sm text-muted-foreground">{selectedFarmer.aadhar}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Experience</label>
                                    <p className="text-sm text-muted-foreground">{getExperienceLabel(selectedFarmer)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Join Date</label>
                                    <p className="text-sm text-muted-foreground">{selectedFarmer.joinDate ? new Date(selectedFarmer.joinDate).toLocaleDateString() : "-"}</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Crops</label>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {selectedFarmer.crops.map((crop, index) => (
                                      <Badge key={index} variant="outline">
                                        {crop}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(farmer)}>
                          <Edit className="h-4 w-4" />
                        </Button>

                        {/* Approval buttons removed */}

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
                              <AlertDialogAction onClick={() => handleDelete(farmer.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Farmer Dialog */}
      <Dialog open={!!editingFarmer} onOpenChange={setEditingFarmer}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Farmer</DialogTitle>
            <DialogDescription>Update farmer details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input name="name" value={editForm.name} onChange={handleEditChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input name="email" value={editForm.email} onChange={handleEditChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input name="phone" value={editForm.phone} onChange={handleEditChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Experience</label>
              <select
                name="experience"
                value={editForm.experience}
                onChange={handleEditChange}
                className="w-full border rounded px-2 py-1"
              >
                <option value="Experienced">Experienced</option>
                <option value="Fresher">Fresher</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input name="location" value={editForm.location} onChange={handleEditChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Crops (comma separated)</label>
              <Input name="crops" value={editForm.crops} onChange={handleEditChange} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleEditCancel}>Cancel</Button>
            <Button onClick={handleEditSave}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
