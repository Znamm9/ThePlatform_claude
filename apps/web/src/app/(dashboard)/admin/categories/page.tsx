'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { CardSkeleton } from '@/components/ui/skeleton';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  _count?: {
    courses: number;
  };
}

export default function CategoriesManagementPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/categories');
      setCategories(response.data);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/categories', formData);
      showToast('Category created successfully', 'success');
      setFormData({ name: '', description: '' });
      setShowCreateForm(false);
      fetchCategories();
    } catch (error: any) {
      console.error('Error creating category:', error);
      showToast('Failed to create category', 'error');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      await apiClient.patch(`/categories/${editingCategory.id}`, formData);
      showToast('Category updated successfully', 'success');
      setFormData({ name: '', description: '' });
      setEditingCategory(null);
      fetchCategories();
    } catch (error: any) {
      console.error('Error updating category:', error);
      showToast('Failed to update category', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/categories/${id}`);
      showToast('Category deleted successfully', 'success');
      fetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      showToast('Failed to delete category. It may have courses associated with it.', 'error');
    }
  };

  const handleReorder = async (categoryId: string, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex((c) => c.id === categoryId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === categories.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const reordered = [...categories];
    const [removed] = reordered.splice(currentIndex, 1);
    reordered.splice(newIndex, 0, removed);

    // Optimistic update
    setCategories(reordered);

    try {
      const categoryIds = reordered.map((c) => c.id);
      await apiClient.post('/categories/reorder', { categoryIds });
      showToast('Categories reordered successfully', 'success');
    } catch (error: any) {
      console.error('Error reordering categories:', error);
      showToast('Failed to reorder categories', 'error');
      fetchCategories(); // Revert on error
    }
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setShowCreateForm(false);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Category Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage course categories ({categories.length} total)
          </p>
        </div>
        <Button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
          }}
        >
          {showCreateForm ? 'Cancel' : 'Create Category'}
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingCategory) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingCategory ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Programming Fundamentals"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this category..."
                  className="w-full px-3 py-2 border dark:border-gray-700 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingCategory ? 'Update' : 'Create'} Category
                </Button>
                {editingCategory && (
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No categories yet</p>
              <Button onClick={() => setShowCreateForm(true)} className="mt-4">
                Create First Category
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleReorder(category.id, 'up')}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleReorder(category.id, 'down')}
                        disabled={index === categories.length - 1}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        ▼
                      </button>
                    </div>

                    {/* Category Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{category.name}</h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {category._count?.courses || 0} courses
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{category.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Slug: {category.slug}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(category)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(category.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
