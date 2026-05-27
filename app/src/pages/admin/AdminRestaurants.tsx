import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Building2, Search, Plus, Ban, CheckCircle, Pencil, UserCog, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({
    name: '', owner_name: '', owner_email: '', owner_password: '',
    description: '', phone: '', address: '', status: 'active',
  });

  // Modal states
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [restaurantStaff, setRestaurantStaff] = useState<any[]>([]);
  const [isEditingUser, setIsEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    loadRestaurants();
  }, [search, statusFilter]);

  const loadRestaurants = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await api.getAdminRestaurants(params);
      if (response?.success) {
        setRestaurants(response.data?.restaurants || []);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.owner_email.trim()) { toast.error('Owner email is required'); return; }
    if (!form.owner_password) { toast.error('Owner password is required'); return; }
    try {
      await api.createRestaurant(form);
      toast.success('Restaurant created');
      setIsAdding(false);
      setForm({ name: '', owner_name: '', owner_email: '', owner_password: '', description: '', phone: '', address: '', status: 'active' });
      loadRestaurants();
    } catch (error: any) { toast.error(error.message); }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.updateRestaurant(id, { status: newStatus });
      toast.success(`Restaurant ${newStatus}`);
      loadRestaurants();
    } catch (error: any) { toast.error(error.message); }
  };

  const openRestaurantDetails = async (restaurant: any) => {
    setSelectedRestaurant(restaurant);
    setRestaurantStaff([]);
    try {
      const res = await api.getAdminRestaurantStaff(restaurant.id);
      if (res?.success) setRestaurantStaff(res.data);
    } catch (e: any) { toast.error('Failed to load staff: ' + e.message); }
  };

  const handleEditUserClick = (user: any, role: string) => {
    setIsEditingUser({ ...user, _displayRole: role });
    setUserForm({ name: user.name || '', email: user.email || '', password: '' });
  };

  const handleUpdateUser = async () => {
    if (!userForm.name.trim() || !userForm.email.trim()) {
      toast.error('Name and email are required'); return;
    }
    try {
      const res = await api.updateAdminUser(isEditingUser.id, userForm);
      if (res?.success) {
        toast.success('User updated successfully');
        setIsEditingUser(null);
        // Refresh data
        loadRestaurants();
        if (selectedRestaurant) openRestaurantDetails(selectedRestaurant);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to update user');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-red-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all restaurants on the platform</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-red-500 hover:bg-red-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Restaurant
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search restaurants..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {['all', 'active', 'suspended'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                statusFilter === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isAdding && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Restaurant name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Owner name" value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Owner email *" value={form.owner_email} onChange={(e) => setForm({ ...form, owner_email: e.target.value })} />
              <Input type="password" placeholder="Owner password *" value={form.owner_password} onChange={(e) => setForm({ ...form, owner_password: e.target.value })} />
            </div>
            <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <Button size="sm" onClick={handleCreate} className="bg-red-500 hover:bg-red-600 text-white">Create</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {restaurants.map((r) => (
          <Card key={r.id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    r.status === 'active' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <Building2 className={`w-5 h-5 ${r.status === 'active' ? 'text-green-500' : 'text-red-500'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openRestaurantDetails(r)}
                        className="text-sm font-semibold hover:text-blue-600 hover:underline cursor-pointer"
                      >
                        {r.name}
                      </button>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{r.slug} | {r.owner?.email} | {r.stats?.total_orders || 0} orders</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleStatus(r.id, r.status)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100" title={r.status === 'active' ? 'Suspend' : 'Activate'}>
                    {r.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {restaurants.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No restaurants found</p>
          </div>
        )}
      </div>

      {/* Restaurant Details Modal */}
      <Dialog open={!!selectedRestaurant} onOpenChange={(open) => !open && setSelectedRestaurant(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-500" />
              {selectedRestaurant?.name} Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedRestaurant && (
            <div className="space-y-6 mt-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div><p className="text-xs text-gray-500">Status</p><p className="font-medium capitalize">{selectedRestaurant.status}</p></div>
                <div><p className="text-xs text-gray-500">Currency</p><p className="font-medium">{selectedRestaurant.currency}</p></div>
                <div><p className="text-xs text-gray-500">Total Orders</p><p className="font-medium">{selectedRestaurant.stats?.total_orders || 0}</p></div>
                <div><p className="text-xs text-gray-500">Total Views</p><p className="font-medium">{selectedRestaurant.stats?.total_views || 0}</p></div>
              </div>

              {/* Owner Info */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 border-b pb-2 mb-3">Restaurant Owner</h3>
                {selectedRestaurant.owner ? (
                  <Card className="border-0 shadow-sm bg-blue-50/50">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{selectedRestaurant.owner.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Mail className="w-3 h-3"/> {selectedRestaurant.owner.email}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleEditUserClick(selectedRestaurant.owner, 'Owner')}>
                        <Pencil className="w-3 h-3 mr-1" /> Edit Owner
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <p className="text-sm text-gray-500 italic">No owner assigned.</p>
                )}
              </div>

              {/* Staff List */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 border-b pb-2 mb-3">Staff Members</h3>
                {restaurantStaff.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {restaurantStaff.map(staff => (
                      <Card key={staff.id} className="border shadow-sm">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">{staff.user?.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 capitalize font-medium">{staff.role}</span>
                              <span className="text-xs text-gray-500">{staff.user?.email}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600" onClick={() => handleEditUserClick(staff.user, staff.role)}>
                            <UserCog className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No staff members found.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={!!isEditingUser} onOpenChange={(open) => !open && setIsEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User: {isEditingUser?.name}</DialogTitle>
            <p className="text-xs text-gray-500">Role: <span className="font-medium capitalize">{isEditingUser?._displayRole}</span></p>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>New Password <span className="text-gray-400 font-normal">(Leave blank to keep current)</span></Label>
              <Input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} placeholder="••••••••" />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditingUser(null)}>Cancel</Button>
              <Button onClick={handleUpdateUser} className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
