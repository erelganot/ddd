import React, { useState, useEffect } from "react";
import { BaseImage } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadFile } from "@/api/integrations";
import { Plus, Upload, Trash2, Eye, EyeOff, Monitor } from "lucide-react";

export default function BaseImageManager({ onUpdate }) {
  const [baseImages, setBaseImages] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newImage, setNewImage] = useState({
    name: '',
    description: '',
    image_url: '',
    is_active: true,
    display_page: 'display1'
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadBaseImages();
  }, []);

  const loadBaseImages = async () => {
    const images = await BaseImage.list('-created_date');
    setBaseImages(images);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setNewImage(prev => ({ ...prev, image_url: file_url }));
    } catch (error) {
      console.error("Upload failed:", error);
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newImage.name || !newImage.image_url) return;

    try {
      await BaseImage.create(newImage);
      setNewImage({ name: '', description: '', image_url: '', is_active: true, display_page: 'display1' });
      setIsAddingNew(false);
      loadBaseImages();
      onUpdate?.();
    } catch (error) {
      console.error("Failed to create base image:", error);
    }
  };

  const toggleActive = async (image) => {
    try {
      await BaseImage.update(image.id, { is_active: !image.is_active });
      loadBaseImages();
      onUpdate?.();
    } catch (error) {
      console.error("Failed to update image:", error);
    }
  };

  const updateDisplayPage = async (image, newDisplayPage) => {
    try {
      await BaseImage.update(image.id, { display_page: newDisplayPage });
      loadBaseImages();
      onUpdate?.();
    } catch (error) {
      console.error("Failed to update display page:", error);
    }
  };

  const deleteImage = async (id) => {
    if (confirm("Are you sure you want to delete this base image?")) {
      try {
        await BaseImage.delete(id);
        loadBaseImages();
        onUpdate?.();
      } catch (error) {
        console.error("Failed to delete image:", error);
      }
    }
  };

  const displayPageOptions = [
    { value: 'display1', label: 'Display 1' },
    { value: 'display2', label: 'Display 2' },
    { value: 'display3', label: 'Display 3' },
    { value: 'display4', label: 'Display 4' },
    { value: 'display5', label: 'Display 5' },
    { value: 'display6', label: 'Display 6' }
  ];

  const getDisplayPageColor = (displayPage) => {
    const colors = {
      display1: 'bg-red-100 text-red-800',
      display2: 'bg-blue-100 text-blue-800', 
      display3: 'bg-green-100 text-green-800',
      display4: 'bg-yellow-100 text-yellow-800',
      display5: 'bg-purple-100 text-purple-800',
      display6: 'bg-pink-100 text-pink-800'
    };
    return colors[displayPage] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-slate-900">Base Images & Display Assignment</h3>
        <Button
          onClick={() => setIsAddingNew(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Base Image
        </Button>
      </div>

      {isAddingNew && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-lg">Add New Base Image</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Image Name</Label>
                  <Input
                    id="name"
                    value={newImage.name}
                    onChange={(e) => setNewImage(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter image name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="image-upload">Upload Image</Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newImage.description}
                  onChange={(e) => setNewImage(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this base image..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="display-page">Display Page Assignment</Label>
                <Select
                  value={newImage.display_page}
                  onValueChange={(value) => setNewImage(prev => ({ ...prev, display_page: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select display page" />
                  </SelectTrigger>
                  <SelectContent>
                    {displayPageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {newImage.image_url && (
                <div>
                  <Label>Preview</Label>
                  <img 
                    src={newImage.image_url} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingNew(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!newImage.name || !newImage.image_url || uploading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {uploading ? "Uploading..." : "Add Image"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {baseImages.map((image) => (
          <Card key={image.id} className={`${image.is_active ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-gray-50/30'}`}>
            <CardContent className="p-4">
              <img 
                src={image.image_url} 
                alt={image.name}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <h4 className="font-semibold text-slate-900 mb-2">{image.name}</h4>
              {image.description && (
                <p className="text-sm text-slate-600 mb-4">{image.description}</p>
              )}
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={image.is_active}
                      onCheckedChange={() => toggleActive(image)}
                    />
                    <span className="text-sm text-slate-600">
                      {image.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteImage(image.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Display Assignment
                  </Label>
                  <Select
                    value={image.display_page || 'display1'}
                    onValueChange={(value) => updateDisplayPage(image, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {displayPageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className={`text-xs px-2 py-1 rounded-full inline-block ${getDisplayPageColor(image.display_page || 'display1')}`}>
                    Currently: {displayPageOptions.find(opt => opt.value === (image.display_page || 'display1'))?.label}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {baseImages.length === 0 && (
        <div className="text-center py-12">
          <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Base Images</h3>
          <p className="text-slate-600 mb-4">Add your first base image to start generating content</p>
          <Button
            onClick={() => setIsAddingNew(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Base Image
          </Button>
        </div>
      )}
    </div>
  );
}