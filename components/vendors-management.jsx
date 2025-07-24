"use client"

import { useEffect, useState } from "react"
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

// API functions
async function fetchVendors() {
  const res = await fetch('/api/vendors');
  if (!res.ok) throw new Error('Failed to fetch vendors');
  return await res.json();
}

async function updateVendor(vendor) {
  const res = await fetch('/api/vendors', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vendor),
  });
  if (!res.ok) throw new Error('Failed to update vendor');
  return await res.json();
}

async function deleteVendor(id) {
  const res = await fetch('/api/vendors', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error('Failed to delete vendor');
  return await res.json();
}

export function VendorsManagement() {
  const [vendors, setVendors] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [editingVendor, setEditingVendor] = useState(null)
  const [editForm, setEditForm] = useState({
    name: "",
    address: "",
    category: "",
    rating: 0,
    total_purchase: 0,
    joinDate: "",
    avatar: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchVendors().then(setVendors)
  }, [])

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteVendor = (vendorId) => {
    deleteVendor(vendorId).then(() => {
    setVendors(vendors.filter((vendor) => vendor.id !== vendorId))
    toast({
      title: "Vendor Deleted",
      description: "Vendor has been removed from the system.",
      variant: "destructive",
    })
    })
  }

  const handleEditClick = (vendor) => {
    setEditingVendor(vendor)
    setEditForm({
      name: vendor.name,
      address: vendor.address,
      category: vendor.category,
      rating: vendor.rating,
      total_purchase: vendor.total_purchase,
      joinDate: vendor.joinDate,
      avatar: vendor.avatar,
    })
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSave = () => {
    updateVendor({ ...editingVendor, ...editForm, rating: parseFloat(editForm.rating), total_purchase: parseInt(editForm.total_purchase, 10) })
      .then((updated) => {
        setVendors(vendors.map((v) => (v.id === editingVendor.id ? updated : v)))
        setEditingVendor(null)
        toast({
          title: "Vendor Updated",
          description: "Vendor details have been updated.",
          variant: "default",
        })
      })
      .catch(() => {
        toast({
          title: "Error Updating Vendor",
          description: "Failed to update vendor details.",
          variant: "destructive",
        })
      })
  }

  const handleEditCancel = () => {
    setEditingVendor(null)
  }

  const getCategoryBadge = (category) => {
    const colors = {
      Grains: "bg-yellow-100 text-yellow-800",
      Vegetables: "bg-green-100 text-green-800",
      "Dairy & Other Products": "bg-blue-100 text-blue-800",
    }
    return <Badge className={colors[category] || "bg-gray-100 text-gray-800"}>{category}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors Management</h1>
          <p className="text-muted-foreground">Manage vendors who buy organic products from farmers</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors.length}</div>
            <p className="text-xs text-muted-foreground">Active buyers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors.reduce((acc, v) => acc + (v.total_purchase || 0), 0)}</div>
            <p className="text-xs text-muted-foreground">Products purchased</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(vendors.reduce((acc, v) => acc + v.rating, 0) / vendors.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Vendor satisfaction</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Product categories</p>
          </CardContent>
        </Card>
      </div>

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
                  <TableRow key={vendor.id}>
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
                    <TableCell>{getCategoryBadge(vendor.category)}</TableCell>
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedVendor(vendor)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Vendor Details</DialogTitle>
                              <DialogDescription>
                                Detailed information about the vendor and their purchasing history
                              </DialogDescription>
                            </DialogHeader>
                            {selectedVendor && (
                              <div className="grid gap-6">
                                <div className="flex items-center space-x-4">
                                  <Avatar className="h-16 w-16">
                                    <AvatarImage src={selectedVendor.avatar || "/placeholder.svg"} />
                                    <AvatarFallback className="text-lg">
                                      <Store className="h-8 w-8" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="text-xl font-semibold">{selectedVendor.name}</h3>
                                    <div className="flex items-center text-muted-foreground mt-1">
                                      <MapPin className="h-4 w-4 mr-1" />
                                      {selectedVendor.address}
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Category Interest</label>
                                    <div className="mt-1">{getCategoryBadge(selectedVendor.category)}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Rating</label>
                                    <div className="flex items-center mt-1">
                                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                      <span className="font-medium">{selectedVendor.rating}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Total Purchases</label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {selectedVendor.total_purchase} products
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Join Date</label>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedVendor.joinDate}</p>
                                  </div>
                                </div>

                                <div className="border-t pt-4">
                                  <h4 className="text-lg font-semibold mb-2">Purchase Summary</h4>
                                  <div className="text-sm text-muted-foreground">
                                    This vendor specializes in purchasing{" "}
                                    <strong>{selectedVendor.category.toLowerCase()}</strong> from farmers and has made{" "}
                                    <strong>{selectedVendor.total_purchase}</strong> successful purchases since joining
                                    the platform.
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(vendor)}>
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
                              <AlertDialogAction onClick={() => handleDeleteVendor(vendor.id)}>
                                Delete
                              </AlertDialogAction>
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

      {/* Edit Vendor Dialog */}
      <Dialog open={!!editingVendor} onOpenChange={setEditingVendor}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
            <DialogDescription>Update vendor details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input name="name" value={editForm.name} onChange={handleEditChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <Input name="address" value={editForm.address || ""} onChange={handleEditChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input name="category" value={editForm.category} onChange={handleEditChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Rating</label>
              <Input name="rating" type="number" step="0.1" value={editForm.rating} onChange={handleEditChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Total Purchases</label>
              <Input name="total_purchase" type="number" value={editForm.total_purchase} onChange={handleEditChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Join Date</label>
              <Input name="joinDate" type="date" value={editForm.joinDate} onChange={handleEditChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Avatar URL</label>
              <Input name="avatar" value={editForm.avatar} onChange={handleEditChange} />
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
