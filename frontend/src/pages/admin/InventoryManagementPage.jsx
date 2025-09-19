import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import inventoryService from '../../services/inventory.service';
import './AdminPages.css';

export default function InventoryManagementPage() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lowStockFilter, setLowStockFilter] = useState(10); // Mặc định hiển thị các sản phẩm có tồn kho dưới 10

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

  const handleUpdateStock = async (bookId, newStock) => {
    try {
      await inventoryService.updateStock(bookId, newStock);
      // Refresh inventory after update
      fetchInventory();
    } catch (error) {
      console.error("Error updating stock:", error);
    }
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

                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      min="0" 
                      defaultValue={book.stock}
                      id={`stock-${book.id}`}
                      className="admin-form-input"
                      style={{width: '80px'}}
                    />
                    <button 
                      onClick={() => {
                        const newStock = parseInt(document.getElementById(`stock-${book.id}`).value);
                        handleUpdateStock(book.id, newStock);
                      }}
                      className="admin-filter-btn"
                    >
                      Cập nhật
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
    </div>
  );
}
