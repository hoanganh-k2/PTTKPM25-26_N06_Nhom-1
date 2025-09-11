import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import inventoryService from '../../services/inventory.service';

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản Lý Kho Hàng</h1>
      
      <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-2 items-center">
          <Input 
            placeholder="Tìm kiếm theo tên sách..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Button variant="outline" className="flex gap-2 items-center">
            <Search size={16} />
            Tìm kiếm
          </Button>
        </div>
        
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600">Hiển thị sản phẩm có tồn kho dưới:</span>
          <Input 
            type="number" 
            min="0" 
            value={lowStockFilter}
            onChange={e => setLowStockFilter(e.target.value)}
            className="w-20"
          />
          <Button onClick={fetchInventory} variant="outline" className="flex gap-1 items-center">
            <RefreshCw size={16} />
            Cập nhật
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải dữ liệu...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInventory.map(book => (
              <Card key={book.id} className={book.stock < 5 ? "border-red-300" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between items-start">
                    <span>{book.title}</span>
                    {book.stock < 5 && (
                      <AlertCircle size={18} className="text-red-500" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">ID: {book.id.substring(0, 8)}...</span>
                    <span 
                      className={`font-semibold ${
                        book.stock < 5 
                          ? 'text-red-600' 
                          : book.stock < 10 
                            ? 'text-amber-600' 
                            : 'text-green-600'
                      }`}
                    >
                      Tồn kho: {book.stock}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      min="0" 
                      defaultValue={book.stock}
                      id={`stock-${book.id}`}
                      className="w-24"
                    />
                    <Button 
                      onClick={() => {
                        const newStock = parseInt(document.getElementById(`stock-${book.id}`).value);
                        handleUpdateStock(book.id, newStock);
                      }}
                      variant="outline"
                    >
                      Cập nhật
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredInventory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Không tìm thấy sản phẩm nào phù hợp
            </div>
          )}

          <div className="flex justify-center mt-6">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <span className="py-2 px-4 border rounded">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
