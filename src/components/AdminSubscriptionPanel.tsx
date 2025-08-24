'use client';

import { useState, useEffect } from 'react';
import { SubscriptionPlan } from '@/types/user';
import { Edit3, Plus, Trash2, Save, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminSubscriptionPanel() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Yeni plan form state'i
  const [newPlan, setNewPlan] = useState({
    name: 'premium',
    displayName: '',
    description: '', // Açıklama eklendi
    price: 29.99,
    currency: 'TRY' as 'TRY' | 'USD' | 'EUR',
    duration: 30,
    features: [] as string[], // Dinamik features
    maxUsage: -1,
    isActive: true,
    isDefault: false,
    permissions: [] as string[]
  });

  // Düzenleme form state'i
  const [editForm, setEditForm] = useState<Partial<SubscriptionPlan>>({
    permissions: [],
    features: []
  });

  // Mevcut tool permissions
  const availablePermissions = [
    { id: 'question-generator', name: 'Soru Üretici', description: 'AI ile soru üretme' },
    { id: 'writing-evaluator', name: 'Yazı Değerlendirici', description: 'Yazı analizi ve değerlendirme' },
    { id: 'text-question-analysis', name: 'Metin Analizi', description: 'Metin tabanlı soru analizi' }
  ];

  // Yeni feature ekleme state'i
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/subscription', {
        headers: {
          'Authorization': 'Bearer admin-super-token-2024' // Admin token
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      } else {
        setError('Abonelik planları getirilemedi');
      }
    } catch {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async () => {
    try {
      const response = await fetch('/api/admin/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-super-token-2024'
        },
        body: JSON.stringify(newPlan)
      });

      if (response.ok) {
        setSuccess('Abonelik planı oluşturuldu');
        setShowCreateForm(false);
        setNewPlan({
          name: 'premium',
          displayName: '',
          description: '',
          price: 29.99,
          currency: 'TRY',
          duration: 30,
          features: [],
          maxUsage: -1,
          isActive: true,
          isDefault: false,
          permissions: []
        });
        fetchPlans();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Plan oluşturulamadı');
      }
    } catch {
      setError('Bağlantı hatası');
    }
  };

  const updatePlan = async (planId: string) => {
    try {
      const response = await fetch('/api/admin/subscription', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-super-token-2024'
        },
        body: JSON.stringify({
          planId,
          updates: editForm
        })
      });

      if (response.ok) {
        setSuccess('Abonelik planı güncellendi');
        setEditingPlan(null);
        setEditForm({});
        fetchPlans();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Plan güncellenemedi');
      }
    } catch {
      setError('Bağlantı hatası');
    }
  };

  const startEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan.id);
    setEditForm({
      displayName: plan.displayName,
      price: plan.price,
      currency: plan.currency,
      duration: plan.duration,
      features: plan.features,
      maxUsage: plan.maxUsage,
      isActive: plan.isActive,
      isDefault: plan.isDefault,
      permissions: plan.permissions || [],
      description: plan.description || ''
    });
  };

  const cancelEdit = () => {
    setEditingPlan(null);
    setEditForm({
      permissions: [],
      features: []
    });
  };

  const deletePlan = async (planId: string) => {
    try {
      const response = await fetch(`/api/admin/subscription?planId=${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer admin-super-token-2024'
        }
      });

      if (response.ok) {
        setSuccess('Abonelik planı silindi');
        fetchPlans();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Plan silinemedi');
      }
    } catch {
      setError('Bağlantı hatası');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Abonelik Planları Yönetimi</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Plan
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700">{success}</span>
          </div>
        </div>
      )}

      {/* Yeni Plan Oluşturma Formu */}
      {showCreateForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Yeni Abonelik Planı</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Adı</label>
              <select
                value={newPlan.name}
                onChange={(e) => setNewPlan({...newPlan, name: e.target.value as any})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black"
              >
                <option value="trial">Trial</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Görünen Ad</label>
              <input
                type="text"
                value={newPlan.displayName}
                onChange={(e) => setNewPlan({...newPlan, displayName: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black"
                placeholder="Premium Abonelik"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <textarea
                value={newPlan.description}
                onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black"
                rows={2}
                placeholder="Abonelik planının açıklaması"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat</label>
              <input
                type="number"
                step="0.01"
                value={newPlan.price}
                onChange={(e) => setNewPlan({...newPlan, price: parseFloat(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Para Birimi</label>
              <select
                value={newPlan.currency}
                onChange={(e) => setNewPlan({...newPlan, currency: e.target.value as any})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black"
              >
                <option value="TRY">TRY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Süre (Gün)</label>
              <input
                type="number"
                value={newPlan.duration}
                onChange={(e) => setNewPlan({...newPlan, duration: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={newPlan.isActive}
                onChange={(e) => setNewPlan({...newPlan, isActive: e.target.checked})}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Aktif</label>
            </div>
          </div>

          {/* Tool Permissions */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tool Erişimleri</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {availablePermissions.map((perm) => (
                <button
                  key={perm.id}
                  type="button"
                  onClick={() => setNewPlan({
                    ...newPlan, 
                    permissions: [...newPlan.permissions, perm.id]
                  })}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    newPlan.permissions.includes(perm.id)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {newPlan.permissions.includes(perm.id) ? '✅ ' : '❌ '}
                  {perm.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dinamik Features */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Özel Özellikler</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {newPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded border border-blue-200">
                  <span>{feature}</span>
                  <button
                    type="button"
                    onClick={() => setNewPlan({
                      ...newPlan,
                      features: newPlan.features.filter((_, i) => i !== index)
                    })}
                    className="ml-1 text-blue-600 hover:text-blue-800 text-xs"
                  >
                    ✖️
                  </button>
                </div>
              ))}
              <div className="flex items-center">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setNewPlan({
                        ...newPlan,
                        features: [...newPlan.features, newFeature]
                      });
                      setNewFeature('');
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm text-black"
                  placeholder="Yeni özellik ekle"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={createPlan}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Oluştur
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Mevcut Planlar Listesi */}
      <div className="space-y-4">
        {plans.map((plan) => (
          <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
            {editingPlan === plan.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Görünen Ad</label>
                    <input
                      type="text"
                      value={editForm.displayName || ''}
                      onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                    <textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm text-black"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.price || 0}
                      onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Para Birimi</label>
                    <select
                      value={editForm.currency || 'TRY'}
                      onChange={(e) => setEditForm({...editForm, currency: e.target.value as any})}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm text-black"
                    >
                      <option value="TRY">TRY</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>

                {/* Tool Permissions Edit */}
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tool Erişimleri</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {availablePermissions.map((perm) => (
                      <button
                        key={perm.id}
                        type="button"
                        onClick={() => setEditForm({
                          ...editForm, 
                          permissions: editForm.permissions?.includes(perm.id) 
                            ? editForm.permissions.filter(p => p !== perm.id)
                            : [...editForm.permissions || [], perm.id]
                        })}
                        className={`px-3 py-1 rounded text-sm border-2 transition-all ${
                          editForm.permissions?.includes(perm.id)
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {editForm.permissions?.includes(perm.id) ? '✅ ' : '❌ '}
                        {perm.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dinamik Features Edit */}
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Özel Özellikler</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {editForm.features?.map((feature, index) => (
                      <div key={index} className="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded border border-blue-200">
                        <span>{feature}</span>
                        <button
                          type="button"
                          onClick={() => setEditForm({
                            ...editForm,
                            features: editForm.features?.filter((_, i) => i !== index)
                          })}
                          className="ml-1 text-blue-600 hover:text-blue-800 text-xs"
                        >
                          ✖️
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            setEditForm({
                              ...editForm,
                              features: [...editForm.features || [], newFeature]
                            });
                            setNewFeature('');
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm text-black"
                        placeholder="Yeni özellik ekle"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updatePlan(plan.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Kaydet
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center"
                  >
                    <X className="h-3 w-3 mr-1" />
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{plan.displayName}</h3>
                  <p className="text-gray-600">
                    {plan.price} {plan.currency} / {plan.duration} gün
                  </p>
                  <p className="text-sm text-gray-500">
                    {plan.isActive ? 'Aktif' : 'Pasif'} • {plan.isDefault ? 'Varsayılan' : 'Özel'}
                  </p>
                  {/* Tool Permissions Display */}
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Tool Erişimleri:</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.permissions?.map((permId) => {
                        const perm = availablePermissions.find(p => p.id === permId);
                        if (perm) {
                          return (
                            <span key={perm.id} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded border border-green-200">
                              ✅ {perm.name}
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>

                  {/* Dinamik Features Display */}
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Özel Özellikler:</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.features?.map((feature, index) => (
                        <span key={`${feature}-${index}`} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded border border-blue-200">
                          ✅ {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(plan)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Düzenle
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Bu planı silmek istediğinize emin misiniz?')) {
                        deletePlan(plan.id);
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Sil
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Henüz abonelik planı oluşturulmamış
        </div>
      )}
    </div>
  );
}
