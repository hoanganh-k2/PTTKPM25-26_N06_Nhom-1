import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { FormModal } from '../../components/ui/modal';
import inventoryService from '../../services/inventory.service';
import './AdminPages.css';

export default function InventoryManagementPage() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lowStockFilter, setLowStockFilter] = useState(50); // Mặc định hiển thị các sản phẩm có tồn kho dưới 10
  
  // Modal states
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [newStock, setNewStock] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [currentPage, lowStockFilter]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getInventory({
        page: currentPage,
        limit: 10,
        lowStock: lowStockFilter > 0 ? lowStockFilter : undefined,
      });
      
      setInventory(response.books);
      setTotalPages(Math.ceil(response.total / 10));
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedBook || !newStock || newStock < 0) return;
    
    setSubmitting(true);
    try {
      await inventoryService.updateStock(selectedBook.id, parseInt(newStock));
      // Refresh inventory after update
      await fetchInventory();
      setShowStockModal(false);
      setSelectedBook(null);
      setNewStock('');
      setSubmitting(false);
    } catch (error) {
      console.error("Error updating stock:", error);
      alert('Có lỗi xảy ra khi cập nhật tồn kho');
      setSubmitting(false);
    }
  };

  const openStockModal = (book) => {
    setSelectedBook(book);
    setNewStock(book.stock.toString());
    setShowStockModal(true);
  };

  const filteredInventory = searchQuery 
    ? inventory.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : inventory;

  return (
    <div className="admin-container fade-in">
      <div className="admin-header">
        <div className="admin-title">
          <span className="admin-title-icon"><Package size={20} /></span>
          <div>
            <h2>Quản lý Kho Hàng</h2>
          </div>
        </div>
      </div>
      
      <div className="admin-card slide-up">
        <div className="admin-card-content">
          <div className="admin-controls">
            <div className="admin-search">
              <Search className="admin-search-icon" />
              <input 
                type="search" 
                placeholder="Tìm kiếm theo tên sách..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="admin-form-input"
              />
            </div>
            
            <div className="admin-filters">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Tồn kho dưới:</span>
                <input 
                  type="number" 
                  min="0" 
                  value={lowStockFilter}
                  onChange={e => setLowStockFilter(e.target.value)}
                  className="admin-form-input"
                  style={{width: '80px'}}
                />
              </div>
              <button 
                onClick={fetchInventory} 
                className="admin-filter-btn active"
              >
                <RefreshCw size={16} />
                Cập nhật
              </button>
            </div>
          </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-loading-spinner">
            <RefreshCw className="h-8 w-8" />
          </div>
          <span>Đang tải dữ liệu...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInventory.map(book => (
              <div key={book.id} className={`admin-card ${book.stock < 5 ? "border-red-300" : ""}`}>
                <div className="admin-card-header">
                  <div className="admin-card-title">
                    <span>{book.title}</span>
                    {book.stock < 5 && (
                      <AlertCircle size={18} className="text-red-500" />
                    )}
                  </div>
                </div>
                <div className="admin-card-content">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-text-tertiary text-sm">ID: {book.id.substring(0, 8)}...</span>
                    <span 
                      className={
                        book.stock < 5 
                          ? 'stock-level stock-low' 
                          : book.stock < 10 
                            ? 'stock-level stock-medium' 
                            : 'stock-level stock-good'
                      }
                    >
                      Tồn kho: {book.stock}
                    </span>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      onClick={() => openStockModal(book)}
                      className="admin-btn-icon"
                      title="Cập nhật tồn kho"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredInventory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Không tìm thấy sản phẩm nào phù hợp
            </div>
          )}

          <div className="admin-pagination">
            <div className="pagination-info">
              Trang {currentPage} / {totalPages}
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="pagination-btn active">
                {currentPage}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
        </div>
      </div>

      {/* Stock Update Modal */}
      <FormModal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        title={`Cập nhật tồn kho - ${selectedBook?.title}`}
        onSubmit={handleUpdateStock}
        isSubmitting={submitting}
        size="small"
        submitText="Cập nhật"
      >
        <div className="form-group">
          <label htmlFor="currentStock" className="form-label">
            Tồn kho hiện tại
          </label>
          <input
            id="currentStock"
            type="number"
            value={selectedBook?.stock || 0}
            disabled
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="newStock" className="form-label">
            Tồn kho mới <span className="text-danger">*</span>
          </label>
          <input
            id="newStock"
            type="number"
            min="0"
            value={newStock}
            onChange={(e) => setNewStock(e.target.value)}
            className="form-control"
            placeholder="Nhập số lượng tồn kho mới"
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Thay đổi</label>
          <div className="d-flex align-items-center">
            <span className={`badge ${(parseInt(newStock) || 0) - (selectedBook?.stock || 0) >= 0 ? 'bg-success' : 'bg-danger'}`}>
              {(parseInt(newStock) || 0) - (selectedBook?.stock || 0) >= 0 ? '+' : ''}
              {(parseInt(newStock) || 0) - (selectedBook?.stock || 0)}
            </span>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
