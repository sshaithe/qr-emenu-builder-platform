import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { FolderOpen, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { useDashLang } from '@/context/DashLangContext';

export default function MenuCategories() {
  const { t } = useDashLang();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.getCategories();
      if (response?.success) {
        setCategories(response.data || []);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    try {
      await api.createCategory({ name: form.name.trim(), description: form.description });
      toast.success('Category created');
      setForm({ name: '', description: '' });
      setIsAdding(false);
      loadCategories();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    try {
      await api.updateCategory(id, { name: form.name.trim(), description: form.description });
      toast.success('Category updated');
      setEditingId(null);
      loadCategories();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.deleteConfirmCat)) return;
    try {
      await api.deleteCategory(id);
      toast.success('Category deleted');
      loadCategories();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || '' });
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-amber-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.categoriesTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">{t.organizeMenu}</p>
        </div>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-amber-500 hover:bg-amber-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.addCategory}
        </Button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4 space-y-3">
            <Input placeholder={`${t.categoryName} *`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Textarea placeholder={`${t.description} (${t.optional})`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} className="bg-amber-500 hover:bg-amber-600 text-white">
                <Check className="w-4 h-4 mr-1" /> {t.create}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setIsAdding(false); setForm({ name: '', description: '' }); }}>
                <X className="w-4 h-4 mr-1" /> {t.cancel}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <Card key={cat.id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              {editingId === cat.id ? (
                <div className="space-y-3">
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Category name"
                  />
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Description"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(cat.id)} className="bg-amber-500 hover:bg-amber-600 text-white">
                      <Check className="w-4 h-4 mr-1" /> {t.save}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setForm({ name: '', description: '' }); }}>
                      <X className="w-4 h-4 mr-1" /> {t.cancel}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{cat.name}</p>
                      {cat.description && <p className="text-xs text-gray-500">{cat.description}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">{cat.items?.length || 0} {t.items}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(cat)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">{t.noCategoriesYet}</p>
            <p className="text-xs text-gray-400 mt-1">{t.addFirstCategory}</p>
          </div>
        )}
      </div>
    </div>
  );
}
