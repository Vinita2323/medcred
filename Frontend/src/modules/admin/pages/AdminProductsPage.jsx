import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../services/types';
import { compressImage } from '../../../utils/compressImage';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'other',
    price: '',
    discountedPrice: '',
    stockCount: '',
    brand: '',
    imageUrl: '',
    image: null,
    isAvailable: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(ENDPOINTS.ADMIN_PRODUCTS);
      if (res.data?.success) {
        setProducts(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const compressed = await compressImage(e.target.files[0]);
      setFormData(prev => ({
        ...prev,
        image: compressed
      }));
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        discountedPrice: product.discountedPrice || '',
        stockCount: product.stockCount || 0,
        brand: product.brand || '',
        imageUrl: product.imageUrl || '',
        image: null,
        isAvailable: product.isAvailable,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: 'other',
        price: '',
        discountedPrice: '',
        stockCount: '',
        brand: '',
        imageUrl: '',
        image: null,
        isAvailable: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData[key]) {
          payload.append('image', formData[key]);
        } else if (key !== 'image' && formData[key] !== null && formData[key] !== undefined) {
          payload.append(key, formData[key]);
        }
      });

      if (editingProduct) {
        await api.put(ENDPOINTS.ADMIN_PRODUCT_UPDATE(editingProduct._id), payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post(ENDPOINTS.ADMIN_PRODUCTS, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      fetchProducts();
      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(ENDPOINTS.ADMIN_PRODUCT_DELETE(id));
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#191b23]">Product Catalog</h1>
        <button
          onClick={() => openModal()}
          className="bg-[#0c56d0] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#003d9b] transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#c3c6d6]/30 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-[#516161]">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-[#516161]">
            <span className="material-symbols-outlined text-4xl mb-2 text-[#c3c6d6]">inventory_2</span>
            <p>No products found in the catalog.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#faf8ff] text-[#737685] border-b border-[#c3c6d6]/30">
                  <th className="px-6 py-4 font-bold">Product</th>
                  <th className="px-6 py-4 font-bold">Category</th>
                  <th className="px-6 py-4 font-bold">Price</th>
                  <th className="px-6 py-4 font-bold">Stock</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6d6]/20">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-[#f3f3fd]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#dae2ff] overflow-hidden flex-shrink-0 flex items-center justify-center border border-[#003d9b]/10">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-[#003d9b]">medical_services</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[#191b23]">{product.name}</div>
                          <div className="text-[10px] text-[#737685] font-mono">{product.productId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 uppercase text-[10px] font-bold text-[#516161] tracking-wider">
                      {product.category.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#191b23]">₹{product.price}</div>
                      {product.discountedPrice && <div className="text-xs text-green-600 font-semibold">Sale: ₹{product.discountedPrice}</div>}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#516161]">
                      {product.stockCount} units
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal(product)}
                          className="w-8 h-8 rounded-full bg-[#f3f3fd] text-[#0052cc] hover:bg-[#dae2ff] flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="w-8 h-8 rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-6 py-4 border-b border-[#c3c6d6]/30 flex justify-between items-center bg-[#faf8ff]">
              <h2 className="text-lg font-bold text-[#191b23]">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={closeModal} className="material-symbols-outlined text-[#737685] hover:bg-[#f3f3fd] rounded-full p-1">close</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#516161] uppercase tracking-wider mb-1">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-[#c3c6d6] rounded-xl focus:outline-none focus:border-[#0c56d0] text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#516161] uppercase tracking-wider mb-1">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-[#c3c6d6] rounded-xl focus:outline-none focus:border-[#0c56d0] text-sm"
                  >
                    <option value="bp_monitor">BP Monitor</option>
                    <option value="glucometer">Glucometer</option>
                    <option value="thermometer">Thermometer</option>
                    <option value="weighing_scale">Weighing Scale</option>
                    <option value="acupressure">Acupressure</option>
                    <option value="massager">Massager</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#516161] uppercase tracking-wider mb-1">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-[#c3c6d6] rounded-xl focus:outline-none focus:border-[#0c56d0] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#516161] uppercase tracking-wider mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-[#c3c6d6] rounded-xl focus:outline-none focus:border-[#0c56d0] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#516161] uppercase tracking-wider mb-1">Sale Price (₹)</label>
                  <input
                    type="number"
                    name="discountedPrice"
                    value={formData.discountedPrice}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-[#c3c6d6] rounded-xl focus:outline-none focus:border-[#0c56d0] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#516161] uppercase tracking-wider mb-1">Stock Count</label>
                  <input
                    type="number"
                    name="stockCount"
                    value={formData.stockCount}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-[#c3c6d6] rounded-xl focus:outline-none focus:border-[#0c56d0] text-sm"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#0c56d0] rounded"
                    />
                    <span className="text-sm font-semibold text-[#191b23]">Is Available</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#516161] uppercase tracking-wider mb-1">Image Upload</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-[#c3c6d6] rounded-xl focus:outline-none focus:border-[#0c56d0] text-sm bg-white"
                />
                {formData.imageUrl && !formData.image && (
                  <div className="mt-2 text-xs text-green-600 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Current image uploaded
                  </div>
                )}
                {formData.image && (
                  <div className="mt-2 text-xs text-[#0c56d0] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">photo</span>
                    New file selected: {formData.image.name}
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-[#434654] hover:bg-[#f3f3fd] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-[#0c56d0] text-white hover:bg-[#003d9b] shadow-sm transition-colors"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
