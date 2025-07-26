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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Eye, Edit, Trash2, Package, Star, TrendingUp, Phone, Mail, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// API functions
async function fetchProducts() {
  try {
    const res = await fetch('/api/organic-products');
    if (!res.ok) {
      console.error('Failed to fetch products:', res.status);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function deleteProduct(id) {
  try {
    const res = await fetch('/api/organic-products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      console.error('Failed to delete product:', res.status);
      throw new Error('Failed to delete product');
    }
    return await res.json();
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

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

// Add API function for update
async function updateProduct(product) {
  try {
    const res = await fetch('/api/organic-products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!res.ok) {
      console.error('Failed to update product:', res.status);
      throw new Error('Failed to update product');
    }
    return await res.json();
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export function OrganicProductsManagement() {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [activeTab, setActiveTab] = useState("all")
  const [farmers, setFarmers] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "Vegetables", // default to Vegetables
    price: 0,
    unit: "",
    quantity: 0,
    harvest_date: "",
    expiry_date: "",
    status: "Available",
    image_url: "",
    id: null,
  });
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts().then(setProducts).catch(error => {
      console.error('Error setting products:', error);
      setProducts([]);
    });
    fetchFarmers().then(setFarmers).catch(error => {
      console.error('Error setting farmers:', error);
      setFarmers([]);
    });
  }, []);

  // Update tab values to match category values
  const tabCategoryMap = {
    vegetables: "Vegetables",
    grains: "Grains",
    "dairy & others": "Dairy & Others",
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.farmer.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab !== "all" && product.category === tabCategoryMap[activeTab]);

    return matchesSearch && matchesTab;
  });

  // Calculate counts for each category after filtering by search
  const vegetablesCount = filteredProducts.filter((p) => p.category === "Vegetables").length;
  const grainsCount = filteredProducts.filter((p) => p.category === "Grains").length;
  const dairyCount = filteredProducts.filter((p) => p.category === "Dairy & Others").length;

  const handleDeleteProduct = (productId) => {
    deleteProduct(productId)
      .then(() => {
        setProducts(products.filter((product) => product.id !== productId))
        toast({
          title: "Product Deleted",
          description: "Organic product has been removed from the catalog.",
          variant: "destructive",
        })
      })
      .catch((error) => {
        console.error('Error deleting product:', error);
        toast({
          title: "Error Deleting Product",
          description: "Failed to delete the organic product. Please try again.",
          variant: "destructive",
        })
      })
  }

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      description: product.description,
      category: product.category || "Vegetables",
      price: product.price,
      unit: product.unit,
      quantity: product.quantity,
      harvest_date: product.harvest_date,
      expiry_date: product.expiry_date,
      status: product.status,
      image_url: product.image_url,
      id: product.id,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = () => {
    updateProduct(editForm)
      .then((updated) => {
        setProducts(products.map((p) => (p.id === updated.id ? updated : p)));
        setEditingProduct(null);
        toast({
          title: "Product Updated",
          description: "Organic product has been updated.",
          variant: "default",
        });
      })
      .catch(() => {
        toast({
          title: "Error Updating Product",
          description: "Failed to update organic product.",
          variant: "destructive",
        });
      });
  };

  const handleEditCancel = () => {
    setEditingProduct(null);
  };

  const getStatusBadge = (status, quantity) => {
    if (quantity === 0) {
      return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
    } else if (quantity < 30) {
      return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
    } else {
      return <Badge className="bg-green-100 text-green-800">Available</Badge>
    }
  }

  const getCategoryBadge = (category) => {
    const colors = {
      Vegetables: "bg-green-100 text-green-800",
      Grains: "bg-yellow-100 text-yellow-800",
      "Dairy & Others": "bg-blue-100 text-blue-800",
    }
    return <Badge className={colors[category] || "bg-gray-100 text-gray-800"}>{category}</Badge>
  }

  const getExperienceBadge = (experience) => {
    return experience === "Experienced" ? (
      <Badge className="bg-blue-100 text-blue-800">Experienced</Badge>
    ) : (
      <Badge className="bg-purple-100 text-purple-800">Fresher</Badge>
    )
  }

  function getFarmerById(id) {
    return farmers.find(f => f.id === id);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organic Products Management</h1>
        <p className="text-muted-foreground">Manage organic products added by farmers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Organic products listed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter((p) => p.quantity > 0).length}</div>
            <p className="text-xs text-muted-foreground">In stock products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter((p) => p.quantity > 0 && p.quantity < 30).length}</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(products.reduce((acc, p) => acc + p.rating, 0) / products.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Customer satisfaction</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organic Products Catalog</CardTitle>
          <CardDescription>View and manage organic products added by farmers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products or farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All ({filteredProducts.length})</TabsTrigger>
              <TabsTrigger value="vegetables">
                Vegetables ({vegetablesCount})
              </TabsTrigger>
              <TabsTrigger value="grains">
                Grains ({grainsCount})
              </TabsTrigger>
              <TabsTrigger value="dairy & others">
                Dairy & Others ({dairyCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.imageUrl || "/placeholder.svg"}
                          alt={product.name}
                          className="w-12 h-12 rounded-md object-cover"
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.description.substring(0, 40)}...</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {(() => {
                          const farmer = getFarmerById(product.farmer_id);
                          return (
                            <>
                        <Avatar className="h-8 w-8">
                                <AvatarImage src={farmer?.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                                  {(farmer?.name || "F").split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                                <div className="font-medium text-sm">{farmer?.name || "Unknown"}</div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                                  {farmer?.location || "Unknown"}
                          </div>
                        </div>
                            </>
                          );
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryBadge(product.category)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">₹{product.price}</div>
                        <div className="text-sm text-muted-foreground">{product.unit}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{product.quantity}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(product.status, product.quantity)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="font-medium">{product.rating}</span>
                        <span className="text-sm text-muted-foreground ml-1">({product.reviews})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(product)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Product Details</DialogTitle>
                              <DialogDescription>
                                Detailed information about the organic product and farmer
                              </DialogDescription>
                            </DialogHeader>
                            {selectedProduct && (
                              <div className="grid gap-6">
                                {/* Product Information */}
                                <div className="grid md:grid-cols-2 gap-6">
                                  <div>
                                    <img
                                      src={selectedProduct.imageUrl || "/placeholder.svg"}
                                      alt={selectedProduct.name}
                                      className="w-full h-64 rounded-lg object-cover"
                                    />
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <h3 className="text-xl font-semibold">{selectedProduct.name}</h3>
                                      <p className="text-muted-foreground">{selectedProduct.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">Category</label>
                                        <div className="mt-1">{getCategoryBadge(selectedProduct.category)}</div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Status</label>
                                        <div className="mt-1">
                                          {getStatusBadge(selectedProduct.status, selectedProduct.quantity)}
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Price</label>
                                        <p className="text-sm text-muted-foreground">
                                          ₹{selectedProduct.price} {selectedProduct.unit}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Quantity</label>
                                        <p className="text-sm text-muted-foreground">{selectedProduct.quantity}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Harvest Date</label>
                                        <p className="text-sm text-muted-foreground">{selectedProduct.harvestDate}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Expiry Date</label>
                                        <p className="text-sm text-muted-foreground">{selectedProduct.expiryDate}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Rating</label>
                                      <div className="flex items-center mt-1">
                                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                        <span className="font-medium">{selectedProduct.rating}</span>
                                        <span className="text-sm text-muted-foreground ml-1">
                                          ({selectedProduct.reviews} reviews)
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Farmer Information */}
                                <div className="border-t pt-6">
                                  <h4 className="text-lg font-semibold mb-4">Farmer Information</h4>
                                  <div className="flex items-start space-x-4">
                                    {(() => {
                                      const farmer = getFarmerById(selectedProduct.farmer_id);
                                      return (
                                        <>
                                    <Avatar className="h-16 w-16">
                                            <AvatarImage src={farmer?.avatar || "/placeholder.svg"} />
                                      <AvatarFallback className="text-lg">
                                              {(farmer?.name || "F").split(" ").map((n) => n[0]).join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 grid md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">Name</label>
                                              <p className="text-sm text-muted-foreground">{farmer?.name || "Unknown"}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Location</label>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                          <MapPin className="h-3 w-3 mr-1" />
                                                {farmer?.location || "Unknown"}
                                        </div>
                                      </div>
                                            {/* Add more fields as needed */}
                                    </div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(product)}>
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
                                This action cannot be undone. This will permanently delete the organic product from the
                                catalog.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
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

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={setEditingProduct}>
        <DialogContent className="max-w-lg min-w-[350px] max-h-[90vh] overflow-y-auto z-50">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update organic product details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input name="name" value={editForm.name} onChange={handleEditChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input name="description" value={editForm.description} onChange={handleEditChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                name="category"
                value={editForm.category}
                onChange={handleEditChange}
                className="w-full border rounded px-2 py-1"
              >
                <option value="Vegetables">Vegetables</option>
                <option value="Grains">Grains</option>
                <option value="Dairy & Others">Dairy & Others</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Price</label>
              <Input name="price" type="number" value={editForm.price} onChange={handleEditChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Unit</label>
              <Input name="unit" value={editForm.unit} onChange={handleEditChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <Input name="quantity" type="number" value={editForm.quantity} onChange={handleEditChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Harvest Date</label>
              <Input name="harvest_date" type="date" value={editForm.harvest_date} onChange={handleEditChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Expiry Date</label>
              <Input name="expiry_date" type="date" value={editForm.expiry_date} onChange={handleEditChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Input name="status" value={editForm.status} onChange={handleEditChange} />
            </div>
            <div>
              <label className="text-sm font-medium">Image URL</label>
              <Input name="image_url" value={editForm.image_url} onChange={handleEditChange} />
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
