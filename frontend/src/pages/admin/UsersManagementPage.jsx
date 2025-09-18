import { useState, useEffect } from 'react';
import { Search, Filter, UserPlus, Edit, UserX, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';

export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, [currentPage, selectedRole, searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Gọi API thực từ service
      import('../../services/user.service').then(async (module) => {
        const { userService } = module;
        const result = await userService.getAllUsers({
          page: currentPage,
          limit: 10,
          role: selectedRole,
          search: searchQuery
        });
        
        // Xử lý dữ liệu trả về từ API
        setUsers(result.users || []);
        setTotalPages(result.totalPages || 1);
        setLoading(false);
      }).catch(error => {
        console.error('Lỗi khi import user service:', error);
        setLoading(false);
      });
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1);
  };

  const openAddUserForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'customer',
      password: '',
      confirmPassword: ''
    });
    setEditingUser(null);
    setErrors({});
    setShowUserForm(true);
  };

  const openEditUserForm = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: '',
      confirmPassword: ''
    });
    setEditingUser(user);
    setErrors({});
    setShowUserForm(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      // Gọi API xóa người dùng (giả lập)
      console.log('Xóa người dùng:', userToDelete);
      
      // Cập nhật UI sau khi xóa
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Vui lòng nhập tên';
    
    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải có 10-11 chữ số';
    }
    
    if (!editingUser) {
      if (!formData.password) {
        newErrors.password = 'Vui lòng nhập mật khẩu';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu không khớp';
      }
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (editingUser) {
        // Gọi API cập nhật người dùng (giả lập)
        console.log('Cập nhật người dùng:', { ...formData, id: editingUser.id });
        
        // Cập nhật UI
        setUsers(users.map(user => 
          user.id === editingUser.id 
            ? { ...user, name: formData.name, email: formData.email, phone: formData.phone, role: formData.role }
            : user
        ));
      } else {
        // Gọi API thêm người dùng mới (giả lập)
        console.log('Thêm người dùng mới:', formData);
        
        // Cập nhật UI với dữ liệu giả lập
        const newUser = {
          id: (Math.max(...users.map(u => parseInt(u.id))) + 1).toString(),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          registeredDate: new Date().toISOString().split('T')[0],
          status: 'active'
        };
        
        setUsers([...users, newUser]);
      }
      
      setShowUserForm(false);
    } catch (error) {
      console.error('Lỗi khi lưu người dùng:', error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quản lý Người dùng</h2>
          <p className="text-gray-500">Quản lý tài khoản người dùng</p>
        </div>
        <Button onClick={openAddUserForm}>
          <UserPlus className="mr-2 h-4 w-4" /> Thêm người dùng
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex w-full md:w-1/2 gap-2">
              <Input
                type="search"
                placeholder="Tìm theo tên, email, số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <Button type="submit">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedRole}
                  onChange={handleRoleChange}
                  className="border rounded-md px-3 py-1 bg-white"
                >
                  <option value="">Tất cả vai trò</option>
                  <option value="admin">Admin</option>
                  <option value="customer">Khách hàng</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium">ID</th>
                  <th className="pb-2 text-left font-medium">Tên người dùng</th>
                  <th className="pb-2 text-left font-medium">Email</th>
                  <th className="pb-2 text-left font-medium">Số điện thoại</th>
                  <th className="pb-2 text-center font-medium">Vai trò</th>
                  <th className="pb-2 text-left font-medium">Ngày đăng ký</th>
                  <th className="pb-2 text-center font-medium">Trạng thái</th>
                  <th className="pb-2 text-center font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-4 text-center">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-4 text-center">
                      Không có người dùng nào được tìm thấy.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-4">{user.id}</td>
                      <td className="py-4 font-medium">{user.name}</td>
                      <td className="py-4">{user.email}</td>
                      <td className="py-4">{user.phone}</td>
                      <td className="py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'Khách hàng'}
                        </span>
                      </td>
                      <td className="py-4">{formatDate(user.registeredDate)}</td>
                      <td className="py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status === 'active' ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex justify-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditUserForm(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteClick(user)}
                            disabled={user.role === 'admin'} // Không cho phép xóa admin
                          >
                            <UserX className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              Hiển thị {users.length} / {totalPages * users.length} kết quả
            </div>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {[...Array(totalPages)].map((_, index) => (
                <Button
                  key={index}
                  variant={currentPage === index + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block font-medium">
                  Tên người dùng <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="block font-medium">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="block font-medium">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  className="w-full border rounded-md px-3 py-2 border-gray-300"
                >
                  <option value="customer">Khách hàng</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block font-medium">
                  Mật khẩu {!editingUser && <span className="text-red-500">*</span>}
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {editingUser && (
                  <p className="text-gray-500 text-sm">Để trống nếu không muốn thay đổi mật khẩu</p>
                )}
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block font-medium">
                  Xác nhận mật khẩu {!editingUser && <span className="text-red-500">*</span>}
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleFormChange}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowUserForm(false)}
                >
                  Hủy
                </Button>
                <Button type="submit">
                  {editingUser ? 'Cập nhật' : 'Thêm'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Xác nhận vô hiệu hóa tài khoản</h3>
            <p>
              Bạn có chắc chắn muốn vô hiệu hóa tài khoản người dùng "{userToDelete?.name}"?
              Người dùng sẽ không thể đăng nhập vào hệ thống.
            </p>
            <div className="flex justify-end mt-6 gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy
              </Button>
              <Button 
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Vô hiệu hóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
