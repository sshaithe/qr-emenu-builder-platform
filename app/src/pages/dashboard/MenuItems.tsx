import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ClipboardList, Plus, Pencil, Trash2, Star, Eye, EyeOff, Check, X, ImageIcon } from 'lucide-react';
import { useDashLang } from '@/context/DashLangContext';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_popular: boolean;
  category_id: number;
  category?: { id: number; name: string };
}

export default function MenuItems() {
  const { t } = useDashLang();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: '',
    is_available: true,
    is_popular: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [itemsRes, catsRes] = await Promise.all([api.getItems(), api.getCategories()]);
      if (itemsRes?.success) setItems(itemsRes.data || []);
      if (catsRes?.success) setCategories(catsRes.data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category_id: '',
      is_available: true,
      is_popular: false,
    });
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      image_url: item.image_url || '',
      category_id: String(item.category_id),
      is_available: item.is_available,
      is_popular: item.is_popular,
    });
  };

  const handleAdd = async () => {
    if (!form.name.trim() || !form.price || !form.category_id) {
      toast.error(`${t.name}, ${t.price} ${t.required}`);
      return;
    }
    try {
      await api.createItem({
        name: form.name.trim(),
        description: form.description,
        price: parseFloat(form.price),
        image_url: form.image_url || null,
        category_id: parseInt(form.category_id),
        is_available: form.is_available,
        is_popular: form.is_popular,
      });
      toast.success('Item created');
      resetForm();
      setIsAdding(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!form.name.trim() || !form.price) {
      toast.error('Name and price are required');
      return;
    }
    try {
      await api.updateItem(id, {
        name: form.name.trim(),
        description: form.description,
        price: parseFloat(form.price),
        image_url: form.image_url || null,
        category_id: parseInt(form.category_id),
        is_available: form.is_available,
        is_popular: form.is_popular,
      });
      toast.success('Item updated');
      setEditingId(null);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api.deleteItem(id);
      toast.success('Item deleted');
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await api.updateItem(item.id, { is_available: !item.is_available });
      toast.success(item.is_available ? 'Item marked unavailable' : 'Item marked available');
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredItems = filterCategory === 'all'
    ? items
    : items.filter((item) => item.category_id === parseInt(filterCategory));

  const ItemForm = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">{t.name} *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t.name} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t.price} *</Label>
            <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Category *</Label>
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">{t.description}</Label>
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Image URL</Label>
          <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
              className="rounded"
            />
            {t.available}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_popular}
              onChange={(e) => setForm({ ...form, is_popular: e.target.checked })}
              className="rounded"
            />
            {t.popular}
          </label>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onSave} className="bg-amber-500 hover:bg-amber-600 text-white">
            <Check className="w-4 h-4 mr-1" /> {t.save}
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-1" /> {t.cancel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-amber-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.menuItemsTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">{items.length} {t.items} · {categories.length} {t.categories}</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAdding(!isAdding); }} className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          {t.addItem}
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${filterCategory === 'all' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          {t.all}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(String(cat.id))}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${filterCategory === String(cat.id) ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {isAdding && <ItemForm onSave={handleAdd} onCancel={() => { setIsAdding(false); resetForm(); }} />}

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className={`border-0 shadow-sm ${!item.is_available ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              {editingId === item.id ? (
                <ItemForm onSave={() => handleUpdate(item.id)} onCancel={() => { setEditingId(null); resetForm(); }} />
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{item.name}</p>
                      {item.is_popular && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />}
                      {!item.is_available && <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{t.unavailable}</span>}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-amber-600">{item.price} DA</span>
                      {item.category && <span className="text-xs text-gray-400">{item.category.name}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => toggleAvailability(item)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600" title={item.is_available ? 'Make unavailable' : 'Make available'}>
                      {item.is_available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => startEdit(item)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">{t.noItemsFound}</p>
          </div>
        )}
      </div>
    </div>
  );
}
