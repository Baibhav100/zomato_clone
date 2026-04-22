import React, { useState, useEffect } from 'react';
import api from '../api';
import {
    Plus, Trash, Edit, Utensils, Store, ShoppingBag,
    TrendingUp, LogOut, Activity, Users, LayoutDashboard,
    BarChart3, X, DollarSign, Sparkles
} from 'lucide-react';

import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#EF4F5F', '#FF7E5F', '#FFB347', '#4CAF50', '#2196F3', '#9C27B0'];

const categoryLabel = {
    delivery: 'Delivery',
    dine_out: 'Dine Out',
    nightlife: 'Nightlife',
    'Dining Out': 'Dine Out',
};

const AdminDashboard = () => {
    const [view, setView] = useState('overview');
    const [restaurants, setRestaurants] = useState([]);
    const [userData, setUserData] = useState([]);
    const [stats, setStats] = useState({ restaurantCount: 0, foodCount: 0, totalRevenue: 0, totalOrders: 0, totalUsers: 0 });
    const [dailySales, setDailySales] = useState([]);
    const [popularFoods, setPopularFoods] = useState([]);
    const [restaurantPerf, setRestaurantPerf] = useState([]);
    const [recentFoods, setRecentFoods] = useState([]);
    const [orders, setOrders] = useState([]);
    const [aiAnalysis, setAiAnalysis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);

    // Restaurant modal
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({
        name: '', description: '', image_url: '', price_for_two: 500,
        delivery_time: 30, address: '', category: 'delivery',
        lat: 26.1158, lng: 91.7086, is_promoted: false
    });

    // Food/menu management
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [foodSubTab, setFoodSubTab] = useState('by-restaurant');
    const [menuItems, setMenuItems] = useState([]);
    const [menuLoading, setMenuLoading] = useState(false);
    const [foodModal, setFoodModal] = useState({ isOpen: false, item: null });
    const [foodData, setFoodData] = useState({
        item_name: '', description: '', price: 200,
        image_url: '', type: 'veg', meal_type: 'lunch', category: ''
    });

    useEffect(() => {
        fetchData();
        fetchAnalytics();
        if (view === 'users') fetchUsers();
        if (view === 'orders') fetchOrders();
    }, [view]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [restRes, statsRes] = await Promise.all([
                api.get('/api/restaurants'),
                api.get('/api/admin/stats')
            ]);
            setRestaurants(restRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Admin fetch fail:', err);
            if (err.response?.status === 401) window.location.href = '/';
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const [salesRes, foodsRes, perfRes, recentRes] = await Promise.all([
                api.get('/api/admin/daily-sales'),
                api.get('/api/admin/popular-foods'),
                api.get('/api/admin/restaurant-performance'),
                api.get('/api/admin/recent-foods?limit=20')
            ]);
            setDailySales(salesRes.data.slice(0, 14).reverse());
            setPopularFoods(foodsRes.data.slice(0, 6));
            setRestaurantPerf(perfRes.data.slice(0, 5));
            setRecentFoods(recentRes.data);

            const aiRes = await api.get('/api/admin/ai/restaurant-analysis');
            setAiAnalysis(aiRes.data);
        } catch (err) {
            console.error('Analytics fetch fail:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/admin/users');
            setUserData(res.data);
        } catch (err) { console.error('Users fetch fail:', err); }
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get('/api/admin/orders');
            setOrders(res.data);
        } catch (err) { console.error('Orders fetch fail:', err); }
    };

    const fetchMenuItems = async (restaurantId) => {
        setMenuLoading(true);
        try {
            const res = await api.get(`/api/restaurants/${restaurantId}`);
            setMenuItems(res.data.menu || []);
        } catch (err) { console.error('Menu fetch fail:', err); }
        setMenuLoading(false);
    };

    // ─── Restaurant CRUD ─────────────────────────────────
    const resetRestaurantForm = () => setFormData({
        name: '', description: '', image_url: '', price_for_two: 500,
        delivery_time: 30, address: '', category: 'delivery',
        lat: 26.1158, lng: 91.7086, is_promoted: false
    });

    const handleRestaurantSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/api/admin/restaurants/${editing}`, formData);
                alert('Restaurant updated successfully!');
            } else {
                await api.post('/api/admin/restaurants', formData);
                alert('Restaurant added successfully!');
            }
            setShowModal(false);
            setEditing(null);
            resetRestaurantForm();
            fetchData();
        } catch (err) {
            console.error('Restaurant submit error:', err);
            alert('Action Failed: ' + (err.response?.data?.error || 'Check server logs'));
        }
    };

    const handleDeleteRestaurant = async (id) => {
        if (!window.confirm('Delete this restaurant and all its menu items?')) return;
        try {
            await api.delete(`/api/admin/restaurants/${id}`);
            if (selectedRestaurant == id) { setSelectedRestaurant(null); setMenuItems([]); }
            fetchData();
            alert('Restaurant deleted successfully!');
        } catch (err) {
            console.error('Delete error:', err);
            alert('Delete failed!');
        }
    };

    // ─── Food/Menu CRUD ───────────────────────────────────
    const resetFoodData = () => setFoodData({
        item_name: '', description: '', price: 200,
        image_url: '', type: 'veg', meal_type: 'lunch', category: ''
    });

    const openAddFood = () => { resetFoodData(); setFoodModal({ isOpen: true, item: null }); };

    const openEditFood = (item) => {
        setFoodData({
            item_name: item.item_name, description: item.description || '',
            price: item.price, image_url: item.image_url || '',
            type: item.type, meal_type: item.meal_type, category: item.category || ''
        });
        setFoodModal({ isOpen: true, item });
    };

    const handleFoodSubmit = async (e) => {
        e.preventDefault();
        try {
            if (foodModal.item) {
                await api.put(`/api/admin/menu/${foodModal.item.id}`, foodData);
                alert('Menu item updated!');
            } else {
                await api.post('/api/admin/menu', { ...foodData, restaurant_id: selectedRestaurant });
                alert('Menu item added!');
            }
            setFoodModal({ isOpen: false, item: null });
            resetFoodData();
            if (selectedRestaurant) fetchMenuItems(selectedRestaurant);
            fetchAnalytics();
        } catch (err) {
            console.error('Food submit error:', err);
            alert('Failed to save menu item!');
        }
    };

    const handleDeleteFood = async (itemId) => {
        if (!window.confirm('Delete this menu item?')) return;
        try {
            await api.delete(`/api/admin/menu/${itemId}`);
            if (selectedRestaurant) fetchMenuItems(selectedRestaurant);
            alert('Menu item deleted!');
        } catch (err) {
            console.error('Delete food error:', err);
            alert('Delete failed!');
        }
    };

    // ─── Chart data ───────────────────────────────────────
    const categoryPieData = restaurants.reduce((acc, r) => {
        const label = categoryLabel[r.category] || r.category || 'Other';
        const found = acc.find(x => x.name === label);
        if (found) found.value++;
        else acc.push({ name: label, value: 1 });
        return acc;
    }, []);

    const salesChartData = dailySales.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        Orders: Number(d.order_count) || 0,
        Revenue: Number(d.total_revenue) || 0
    }));

    const foodBarData = (popularFoods || []).map(f => {
        const name = f.item_name || 'Unknown';
        return {
            name: name.length > 12 ? name.slice(0, 12) + '…' : name,
            Likes: f.likes || 0,
            Orders: f.order_count || 0
        };
    });

    if (loading && view === 'overview') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-[#F8F9FB] font-sans w-full">
            {/* ── Sidebar ── */}
            <div className="w-full md:w-[240px] bg-white border-b md:border-b-0 md:border-r border-gray-200 p-6 flex flex-col gap-6 shrink-0">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ background: '#EF4F5F', padding: '0.4rem', borderRadius: '0.5rem' }}>
                        <LayoutDashboard color="white" size={22} />
                    </div>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800 }}>zomato<span style={{ color: '#EF4F5F' }}>.</span></span>
                </div>

                <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
                    <SidebarItem icon={<BarChart3 size={18}/>} label="Overview"     active={view === 'overview'}     onClick={() => setView('overview')} />
                    <SidebarItem icon={<Store size={18}/>}     label="Restaurants"  active={view === 'restaurants'}  onClick={() => setView('restaurants')} />
                    <SidebarItem icon={<Utensils size={18}/>}  label="Food Items"   active={view === 'food'}         onClick={() => setView('food')} />
                    <SidebarItem icon={<ShoppingBag size={18}/>} label="Orders"     active={view === 'orders'}       onClick={() => setView('orders')} />
                    <SidebarItem icon={<Users size={18}/>}     label="Users"        active={view === 'users'}        onClick={() => setView('users')} />
                    <SidebarItem icon={<Activity size={18}/>}  label="Analytics"    active={view === 'analytics'}    onClick={() => setView('analytics')} />
                    <SidebarItem icon={<Sparkles size={18}/>}  label="AI Insights"   active={view === 'ai_insights'}  onClick={() => setView('ai_insights')} />
                </nav>

                <div style={{ marginTop: 'auto' }}>
                    <button onClick={() => window.location.href = '/'}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', cursor: 'pointer', color: '#EF4F5F', fontWeight: 600, width: '100%', background: 'none', border: 'none', borderRadius: '0.5rem' }}>
                        <LogOut size={16} /> Back to Site
                    </button>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="flex-1 p-4 sm:p-6 md:p-10 overflow-x-hidden overflow-y-auto">
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>
                    { view === 'overview'     && 'Dashboard Overview' }
                    { view === 'restaurants'  && 'Manage Restaurants' }
                    { view === 'food'         && 'Manage Food Items' }
                    { view === 'orders'       && 'Live Orders' }
                    { view === 'users'        && 'User Insights' }
                    { view === 'analytics'    && 'Analytics & Reports' }
                    { view === 'ai_insights'  && 'AI Classification & Intelligence' }
                </h1>

                {/* ── OVERVIEW ── */}
                {view === 'overview' && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                            <StatCard label="Total Revenue"  value={`₹${Number(stats.totalRevenue||0).toLocaleString('en-IN')}`} icon={<DollarSign color="#10B981"/>} />
                            <StatCard label="Total Orders"   value={stats.totalOrders||0}   icon={<ShoppingBag color="#3B82F6"/>} />
                            <StatCard label="Platform Users" value={stats.totalUsers||0}     icon={<Users color="#8B5CF6"/>} />
                            <StatCard label="Active Venues"  value={stats.restaurantCount||0} icon={<Store color="#F59E0B"/>} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <ChartCard title="Daily Orders (Last 14 Days)">
                                <ResponsiveContainer width="100%" height={260}>
                                    <LineChart data={salesChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="Orders" stroke="#EF4F5F" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard title="Restaurant Categories">
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie data={categoryPieData} cx="50%" cy="50%" outerRadius={90}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name}: ${(percent*100).toFixed(0)}%`}
                                            labelLine={false}>
                                            {categoryPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>

                        <ChartCard title="Popular Foods — Likes vs Orders">
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={foodBarData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Likes" fill="#EF4F5F" radius={[4,4,0,0]} />
                                    <Bar dataKey="Orders" fill="#3B82F6" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        {/* Recently Added Foods */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E5E7EB', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ fontWeight: 700, color: '#111827' }}>🆕 Recently Added Foods</h3>
                                <button onClick={() => setView('food')} style={{ ...btnPrimary, fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>View All</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                    <thead>
                                        <tr style={{ background: '#F9FAFB' }}>
                                            <th style={thStyle}>Item</th>
                                            <th style={thStyle}>Restaurant</th>
                                            <th style={thStyle}>Price</th>
                                            <th style={thStyle}>Type</th>
                                            <th style={thStyle}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentFoods.slice(0, 10).map(item => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                                <td style={tdStyle}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        {item.image_url && <img src={item.image_url} style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} alt="" />}
                                                        <strong>{item.item_name}</strong>
                                                    </div>
                                                </td>
                                                <td style={{ ...tdStyle, color: '#6B7280' }}>{item.restaurant_name}</td>
                                                <td style={tdStyle}>₹{item.price}</td>
                                                <td style={tdStyle}>
                                                    <span style={{ padding: '0.15rem 0.5rem', borderRadius: '2rem', fontSize: '0.72rem', fontWeight: 700,
                                                        background: item.type === 'veg' ? '#e8f5e9' : '#ffebee',
                                                        color: item.type === 'veg' ? '#2e7d32' : '#c62828' }}>
                                                        {item.type}
                                                    </span>
                                                </td>
                                                <td style={tdStyle}>
                                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                        <button onClick={() => { setSelectedRestaurant(item.restaurant_id); setView('food'); openEditFood(item); }}
                                                            style={{ ...btnSm, background: '#F59E0B' }}><Edit size={12} /></button>
                                                        <button onClick={() => handleDeleteFood(item.id)}
                                                            style={{ ...btnSm, background: '#EF4F5F' }}><Trash size={12} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* ── RESTAURANTS ── */}
                {view === 'restaurants' && (
                    <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontWeight: 700 }}>All Restaurants</h2>
                            <button onClick={() => { resetRestaurantForm(); setEditing(null); setShowModal(true); }}
                                style={btnPrimary}>
                                <Plus size={15} /> Add Restaurant
                            </button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#F9FAFB' }}>
                                    <th style={thStyle}>Restaurant</th>
                                    <th style={thStyle}>Category</th>
                                    <th style={thStyle}>Rating</th>
                                    <th style={thStyle}>Price/2</th>
                                    <th style={thStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {restaurants.map(r => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <img src={r.image_url} style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover' }} alt="" />
                                                <strong>{r.name}</strong>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>{categoryLabel[r.category] || r.category}</td>
                                        <td style={tdStyle}><span style={{ color: '#10B981', fontWeight: 700 }}>{r.rating} ★</span></td>
                                        <td style={tdStyle}>₹{r.price_for_two}</td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                <button onClick={() => { setSelectedRestaurant(r.id); setView('food'); fetchMenuItems(r.id); }}
                                                    style={{ ...btnSm, background: '#3B82F6' }}><Utensils size={13} /> Menu</button>
                                                <button onClick={() => { setEditing(r.id); setFormData({ ...r }); setShowModal(true); }}
                                                    style={{ ...btnSm, background: '#F59E0B' }}><Edit size={13} /></button>
                                                <button onClick={() => handleDeleteRestaurant(r.id)}
                                                    style={{ ...btnSm, background: '#EF4F5F' }}><Trash size={13} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── FOOD ITEMS ── */}
                {view === 'food' && (
                    <div>
                        {/* Sub-tabs */}
                        <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', background: 'white', borderRadius: '0.75rem', border: '1px solid #E5E7EB', overflow: 'hidden', width: 'fit-content' }}>
                            {[['by-restaurant', '🍽 By Restaurant'], ['recent', '🆕 Recently Added']].map(([key, label]) => (
                                <button key={key} onClick={() => setFoodSubTab(key)}
                                    style={{ padding: '0.65rem 1.4rem', border: 'none', cursor: 'pointer', fontWeight: foodSubTab === key ? 800 : 500,
                                        background: foodSubTab === key ? '#EF4F5F' : 'transparent',
                                        color: foodSubTab === key ? 'white' : '#6B7280', fontSize: '0.88rem', transition: 'all 0.15s' }}>
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* ── By Restaurant sub-tab ── */}
                        {foodSubTab === 'by-restaurant' && (
                            <div>
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
                                    <select
                                        value={selectedRestaurant || ''}
                                        onChange={e => { setSelectedRestaurant(e.target.value); fetchMenuItems(e.target.value); }}
                                        className="w-full sm:w-[300px] p-3 rounded-xl border border-gray-200 outline-none focus:border-red-500 font-bold bg-gray-50 text-gray-700 shadow-sm"
                                    >
                                        <option value="">— Select a Restaurant —</option>
                                        {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>

                                    {selectedRestaurant ? (
                                        <button
                                            onClick={openAddFood}
                                            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-md active:scale-95"
                                        >
                                            <Plus size={18} /> Add New Dish to this Restaurant
                                        </button>
                                    ) : (
                                        <div className="text-gray-400 font-bold italic text-sm animate-pulse">
                                            👈 Select a restaurant first
                                        </div>
                                    )}
                                </div>

                                {selectedRestaurant && (
                                    <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #E5E7EB' }}>
                                            <h2 style={{ fontWeight: 700 }}>
                                                Menu — {restaurants.find(r => r.id == selectedRestaurant)?.name}
                                            </h2>
                                        </div>
                                        {menuLoading ? (
                                            <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Loading menu…</div>
                                        ) : menuItems.length === 0 ? (
                                            <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>No menu items yet. Add one!</div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <FoodTable items={menuItems} onEdit={openEditFood} onDelete={handleDeleteFood} showRestaurant={false} />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Recently Added sub-tab ── */}
                        {foodSubTab === 'recent' && (
                            <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 style={{ fontWeight: 700 }}>Recently Added Foods (All Restaurants)</h2>
                                    <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>{recentFoods.length} items</span>
                                </div>
                                {recentFoods.length === 0 ? (
                                    <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>No food items added yet.</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <FoodTable items={recentFoods} onEdit={(item) => { setSelectedRestaurant(item.restaurant_id); openEditFood(item); }} onDelete={handleDeleteFood} showRestaurant={true} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── USERS ── */}
                {view === 'users' && (
                    <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #E5E7EB' }}>
                            <h2 style={{ fontWeight: 700 }}>Registered Users</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                <thead>
                                    <tr style={{ background: '#F9FAFB' }}>
                                        <th style={thStyle}>Name</th>
                                        <th style={thStyle}>Email</th>
                                        <th style={thStyle}>Role</th>
                                        <th style={thStyle}>Last Login</th>
                                        <th style={thStyle}>Total Logins</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userData.map(u => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                            <td style={tdStyle}><strong>{u.name}</strong></td>
                                            <td style={tdStyle}>{u.email}</td>
                                            <td style={tdStyle}>
                                                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700,
                                                    background: u.role === 'admin' ? '#fff3e0' : '#e8f5e9',
                                                    color: u.role === 'admin' ? '#e65100' : '#2e7d32' }}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>{u.last_login ? new Date(u.last_login).toLocaleString('en-IN') : 'Never'}</td>
                                            <td style={tdStyle}>{u.total_logins || 0}</td>
                                        </tr>
                                    ))}
                                    {userData.length === 0 && (
                                        <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>No users found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── ORDERS ── */}
                {view === 'orders' && (
                    <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontWeight: 700 }}>Order History &amp; Live Orders</h2>
                            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>{orders.length} orders</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                                <thead>
                                    <tr style={{ background: '#F9FAFB' }}>
                                        <th style={thStyle}>Order</th>
                                        <th style={thStyle}>Customer</th>
                                        <th style={thStyle}>Restaurant</th>
                                        <th style={thStyle}>Items</th>
                                        <th style={thStyle}>Total</th>
                                        <th style={thStyle}>Status</th>
                                        <th style={thStyle}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o.id} style={{ borderBottom: '1px solid #F3F4F6', verticalAlign: 'top' }}>
                                            <td style={tdStyle}>
                                                <strong style={{ fontSize: '1rem' }}>#{o.id}</strong>
                                                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.2rem' }}>
                                                    {new Date(o.created_at).toLocaleString('en-IN')}
                                                </div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ fontWeight: 600 }}>{o.user_name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{o.user_email}</div>
                                                {o.address && (
                                                    <div style={{ fontSize: '0.72rem', color: '#4B5563', marginTop: '0.3rem', maxWidth: '180px' }}>
                                                        📍 {o.address}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ ...tdStyle, fontWeight: 600, color: '#374151' }}>{o.restaurant_name}</td>
                                            <td style={tdStyle}>
                                                <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.8rem', color: '#4B5563' }}>
                                                    {(o.items || []).map((item, idx) => (
                                                        <li key={idx}>
                                                            <strong>{item.quantity}×</strong> {item.item_name || 'Item'}
                                                            {item.price ? <span style={{ color: '#9CA3AF' }}> (₹{item.price})</span> : ''}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td style={{ ...tdStyle, fontWeight: 800, color: '#111827', fontSize: '1rem', whiteSpace: 'nowrap' }}>
                                                ₹{Number(o.total_price || 0).toLocaleString('en-IN')}
                                            </td>
                                            <td style={tdStyle}>
                                                <select
                                                    value={o.status || 'pending'}
                                                    onChange={async (e) => {
                                                        try {
                                                            await api.put(`/api/admin/orders/${o.id}/status`, { status: e.target.value });
                                                            fetchOrders();
                                                        } catch (err) { alert('Update failed: ' + (err.response?.data?.error || err.message)); }
                                                    }}
                                                    style={{ padding: '0.3rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700, border: '1px solid #E5E7EB', cursor: 'pointer', outline: 'none',
                                                        background: o.status === 'pending' ? '#fef3c7' : (o.status === 'delivered' ? '#d1fae5' : '#e0e7ff'),
                                                        color: o.status === 'pending' ? '#d97706' : (o.status === 'delivered' ? '#059669' : '#4f46e5') }}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="preparing">Preparing</option>
                                                    <option value="out_for_delivery">Out for Delivery</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                {o.payment_method && <div style={{ fontSize: '0.7rem', color: '#6B7280', marginTop: '0.4rem', fontWeight: 700 }}>💳 {o.payment_method.toUpperCase()}</div>}
                                            </td>
                                            <td style={tdStyle}>
                                                <button
                                                    onClick={async () => {
                                                        if (!window.confirm(`Delete order #${o.id}? This cannot be undone.`)) return;
                                                        try {
                                                            await api.delete(`/api/admin/orders/${o.id}`);
                                                            fetchOrders();
                                                        } catch (err) { alert('Delete failed: ' + (err.response?.data?.error || err.message)); }
                                                    }}
                                                    style={{ ...btnSm, background: '#EF4F5F', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                                >
                                                    <Trash size={12} /> Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>No orders found on the platform yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── ANALYTICS ── */}
                {view === 'analytics' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <ChartCard title="Daily Revenue (₹) — Last 14 Days">
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={salesChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={(v) => `₹${v}`} />
                                    <Bar dataKey="Revenue" fill="#EF4F5F" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard title="Restaurant Performance (Total Revenue ₹)">
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={restaurantPerf.map(r => ({ name: (r.name||'').length > 14 ? r.name.slice(0,14)+'…' : r.name, Revenue: Number(r.total_revenue)||0, Orders: Number(r.total_orders)||0 }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Revenue" fill="#3B82F6" radius={[4,4,0,0]} />
                                    <Bar dataKey="Orders" fill="#10B981" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ChartCard title="Category Mix">
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart>
                                        <Pie data={categoryPieData} cx="50%" cy="50%" outerRadius={90}
                                            dataKey="value" label={({ name, percent }) => `${name}: ${(percent*100).toFixed(0)}%`} labelLine={false}>
                                            {categoryPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard title="Most Ordered Foods">
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={foodBarData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                        <XAxis type="number" tick={{ fontSize: 11 }} />
                                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                                        <Tooltip />
                                        <Bar dataKey="Orders" fill="#EF4F5F" radius={[0,4,4,0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>
                    </div>
                )}

                {/* ── AI INSIGHTS ── */}
                {view === 'ai_insights' && (
                    <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #E5E7EB', padding: '2rem' }}>
                        <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>AI Restaurant Analysis</h2>
                        {aiAnalysis.length === 0 ? (
                            <p style={{ color: '#9CA3AF' }}>No AI analysis data available yet. Check back after more orders are placed.</p>
                        ) : (
                            <div className="space-y-4">
                                {aiAnalysis.map((item, idx) => (
                                    <div key={idx} style={{ padding: '1rem', background: '#F9FAFB', borderRadius: '0.75rem' }}>
                                        <strong>{item.name}</strong>
                                        <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>{item.analysis}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── RESTAURANT MODAL ── */}
            {showModal && (
                <Modal onClose={() => setShowModal(false)} title={editing ? 'Edit Restaurant' : 'Add Restaurant'} width="680px">
                    <form onSubmit={handleRestaurantSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ gridColumn: 'span 1' }}>
                            <label style={labelStyle}>Name</label>
                            <input style={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Restaurant name" />
                        </div>
                        <div>
                            <label style={labelStyle}>Category</label>
                            <select style={inputStyle} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                <option value="delivery">Delivery</option>
                                <option value="dine_out">Dine Out</option>
                                <option value="nightlife">Nightlife</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}>Description / Cuisines</label>
                            <input style={inputStyle} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="e.g. North Indian, Chinese" />
                        </div>
                        <div>
                            <label style={labelStyle}>Price for Two (₹)</label>
                            <input type="number" style={inputStyle} value={formData.price_for_two} onChange={e => setFormData({...formData, price_for_two: e.target.value})} />
                        </div>
                        <div>
                            <label style={labelStyle}>Delivery Time (min)</label>
                            <input type="number" style={inputStyle} value={formData.delivery_time} onChange={e => setFormData({...formData, delivery_time: e.target.value})} />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}>Address</label>
                            <input style={inputStyle} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full address" />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={labelStyle}>Image URL</label>
                            <input style={inputStyle} value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
                        </div>
                        <button type="submit" style={{ ...btnPrimary, gridColumn: 'span 2', justifyContent: 'center', padding: '0.9rem' }}>
                            {editing ? 'Update Restaurant' : 'Add Restaurant'}
                        </button>
                    </form>
                </Modal>
            )}

            {/* ── FOOD MODAL ── */}
            {foodModal.isOpen && (
                <Modal onClose={() => setFoodModal({ isOpen: false, item: null })} title={foodModal.item ? 'Edit Menu Item' : 'Add Menu Item'} width="480px">
                    <form onSubmit={handleFoodSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Item Name</label>
                            <input style={inputStyle} value={foodData.item_name} onChange={e => setFoodData({...foodData, item_name: e.target.value})} required placeholder="e.g. Chicken Biryani" />
                        </div>
                        <div>
                            <label style={labelStyle}>Description</label>
                            <input style={inputStyle} value={foodData.description} onChange={e => setFoodData({...foodData, description: e.target.value})} placeholder="Short description…" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Price (₹)</label>
                                <input type="number" style={inputStyle} value={foodData.price} onChange={e => setFoodData({...foodData, price: e.target.value})} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Type</label>
                                <select style={inputStyle} value={foodData.type} onChange={e => setFoodData({...foodData, type: e.target.value})}>
                                    <option value="veg">Veg</option>
                                    <option value="non-veg">Non-Veg</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Meal Type</label>
                                <select style={inputStyle} value={foodData.meal_type} onChange={e => setFoodData({...foodData, meal_type: e.target.value})}>
                                    <option value="breakfast">Breakfast</option>
                                    <option value="lunch">Lunch</option>
                                    <option value="dinner">Dinner</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Category (optional)</label>
                                <input style={inputStyle} value={foodData.category} onChange={e => setFoodData({...foodData, category: e.target.value})} placeholder="e.g. Main Course" />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Image URL (optional)</label>
                            <input style={inputStyle} value={foodData.image_url} onChange={e => setFoodData({...foodData, image_url: e.target.value})} placeholder="https://…" />
                        </div>
                        <button type="submit" style={{ ...btnPrimary, justifyContent: 'center', padding: '0.9rem' }}>
                            {foodModal.item ? 'Update Item' : 'Add Item'}
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

// ── Sub-components ──
const SidebarItem = ({ icon, label, active, onClick }) => (
    <div onClick={onClick} style={{
        padding: '0.7rem 1rem', borderRadius: 8, display: 'flex', alignItems: 'center',
        gap: '0.8rem', cursor: 'pointer', fontWeight: active ? 700 : 500,
        background: active ? '#FEE2E2' : 'transparent',
        color: active ? '#EF4F5F' : '#4B5563', transition: 'all 0.15s'
    }}>
        {icon}<span>{label}</span>
    </div>
);

const StatCard = ({ label, value, icon }) => (
    <div style={{ background: 'white', padding: '1.3rem', borderRadius: '1rem', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <p style={{ color: '#6B7280', fontSize: '0.8rem', margin: 0 }}>{label}</p>
            <h3 style={{ margin: '0.3rem 0 0', fontSize: '1.8rem', fontWeight: 800 }}>{value}</h3>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
    </div>
);

const ChartCard = ({ title, children }) => (
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #E5E7EB' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: '#111827' }}>{title}</h3>
        {children}
    </div>
);

const Modal = ({ onClose, title, width = '500px', children }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', width, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{title}</h2>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={22} /></button>
            </div>
            {children}
        </div>
    </div>
);

// ── Shared styles ──
const thStyle = { padding: '0.8rem 1.2rem', color: '#6B7280', fontSize: '0.73rem', fontWeight: 700, textTransform: 'uppercase', textAlign: 'left' };
const tdStyle = { padding: '0.85rem 1.2rem', fontSize: '0.88rem' };
const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#4B5563', marginBottom: '0.35rem' };
const inputStyle = { width: '100%', padding: '0.7rem 0.9rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB', outline: 'none', boxSizing: 'border-box', fontSize: '0.9rem' };
const btnPrimary = { display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#EF4F5F', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.55rem 1.1rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' };
const btnSm = { display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'white', border: 'none', borderRadius: '0.3rem', padding: '0.3rem 0.55rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem' };

// ── FoodTable component ──
const FoodTable = ({ items, onEdit, onDelete, showRestaurant = false }) => (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
            <tr style={{ background: '#F9FAFB' }}>
                <th style={thStyle}>Item</th>
                {showRestaurant && <th style={thStyle}>Restaurant</th>}
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Meal</th>
                <th style={thStyle}>Likes ❤️</th>
                <th style={thStyle}>Actions</th>
             </tr>
        </thead>
        <tbody>
            {items.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {item.image_url && (
                                <img src={item.image_url} style={{ width: 34, height: 34, borderRadius: 6, objectFit: 'cover' }} alt="" />
                            )}
                            <div>
                                <strong>{item.item_name}</strong>
                                {item.description && (
                                    <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {item.description}
                                    </p>
                                )}
                            </div>
                        </div>
                     </td>
                    {showRestaurant && (
                        <td style={{ ...tdStyle, color: '#6B7280', fontWeight: 600 }}>{item.restaurant_name}</td>
                    )}
                    <td style={{ ...tdStyle, fontWeight: 700 }}>₹{item.price}</td>
                    <td style={tdStyle}>
                        <span style={{
                            padding: '0.2rem 0.6rem', borderRadius: '2rem', fontSize: '0.73rem', fontWeight: 700,
                            background: item.type === 'veg' ? '#e8f5e9' : '#ffebee',
                            color: item.type === 'veg' ? '#2e7d32' : '#c62828'
                        }}>
                            {item.type}
                        </span>
                    </td>
                    <td style={{ ...tdStyle, color: '#6B7280' }}>{item.meal_type}</td>
                    <td style={tdStyle}>{item.likes || 0}</td>
                    <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => onEdit(item)} style={{ ...btnSm, background: '#F59E0B' }} title="Edit">
                                <Edit size={13} /> Edit
                            </button>
                            <button onClick={() => onDelete(item.id)} style={{ ...btnSm, background: '#EF4F5F' }} title="Delete">
                                <Trash size={13} />
                            </button>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

export default AdminDashboard;