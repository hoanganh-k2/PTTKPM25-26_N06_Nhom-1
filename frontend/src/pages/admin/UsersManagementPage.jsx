import { useState, useEffect } from 'react';
import { Search, Filter, UserPlus, Edit, UserX, ChevronLeft, ChevronRight, Mail, Users } from 'lucide-react';
import userService from '../../services/user.service';
import './AdminPages.css';

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
      const params = {
        page: currentPage,
        limit: 10,
        search: searchQuery
      };
      
      if (selectedRole) {
        params.role = selectedRole;
      }
      
      const result = await userService.getAllUsers(params);
      
      // Xử lý dữ liệu trả về từ API
      setUsers(result.users || result || []);
      
      // Tính tổng số trang từ total và limit
      const totalPages = Math.ceil((result.total || 0) / 10);
      setTotalPages(totalPages);
      
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      setUsers([]);
      setTotalPages(1);
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
      await userService.deleteUser(userToDelete.id);
      
      // Cập nhật UI sau khi xóa
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
      
      // Refresh lại danh sách để cập nhật pagination
      fetchUsers();
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      alert('Có lỗi xảy ra khi xóa người dùng. Vui lòng thử lại.');
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
        // Chuẩn bị dữ liệu cập nhật (không bao gồm password nếu trống)
        const updateData = {
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role
        };
        
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        await userService.updateUser(editingUser.id, updateData);
        alert('Cập nhật người dùng thành công!');
      } else {
        // Tạo người dùng mới
        const newUserData = {
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          password: formData.password
        };
        
        await userService.createUser(newUserData);
        alert('Thêm người dùng mới thành công!');
      }
      
      // Refresh lại danh sách và đóng form
      fetchUsers();
      setShowUserForm(false);
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'customer',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Lỗi khi lưu người dùng:', error);
      alert(`Có lỗi xảy ra: ${error.message || 'Vui lòng thử lại'}`);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <div className="admin-container fade-in">
      <div className="admin-header">
        <div className="admin-title">
          <span className="admin-title-icon"><Users size={20} /></span>
          <div>
            <h2>Quản lý Người dùng</h2> 
          </div>
        </div>
        <button 
          onClick={openAddUserForm}
          className="admin-btn admin-btn-primary"
        >
          <UserPlus className="h-4 w-4" /> Thêm người dùng
        </button>
      </div>

      <div className="admin-card slide-up">
        <div className="admin-card-content">
          <div className="admin-controls">
            <form onSubmit={handleSearch} className="admin-search">
              <Search className="admin-search-icon" />
              <input
                type="search"
                placeholder="Tìm theo tên, email, số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-form-input"
              />
            </form>
            
            <div className="admin-filters">
              <div className="flex items-center gap-2">
                <select
                  value={selectedRole}
                  onChange={handleRoleChange}
                  className="admin-form-select"
                >
                  <option value="">Tất cả vai trò</option>
                  <option value="admin">Admin</option>
                  <option value="customer">Khách hàng</option>
                </select>
                <button className="admin-filter-btn" onClick={fetchUsers}>
                  <Filter className="h-4 w-4" /> Lọc
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="admin-loading">
              <div className="admin-loading-spinner">
                <Search className="h-8 w-8" />
              </div>
              <span>Đang tải dữ liệu...</span>
            </div>
          ) : (
            <>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tên người dùng</th>
                      <th>Email</th>
                      <th>Số điện thoại</th>
                      <th className="text-center">Vai trò</th>
                      <th>Ngày đăng ký</th>
                      <th className="text-center">Trạng thái</th>
                      <th className="text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center">
                          <div className="admin-empty-state">
                            <Users size={24} />
                            <span>Không có người dùng nào được tìm thấy</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td className="font-medium">{user.fullName || user.full_name || user.name}</td>
                          <td>{user.email}</td>
                          <td>{user.phone || 'N/A'}</td>
                          <td className="text-center">
                            <span className={`admin-badge ${
                              user.role === 'admin' 
                                ? 'admin-badge-purple' 
                                : user.role === 'warehouse_manager'
                                ? 'admin-badge-orange'
                                : 'admin-badge-blue'
                            }`}>
                              {user.role === 'admin' ? 'Admin' : 
                               user.role === 'warehouse_manager' ? 'Quản lý kho' : 'Khách hàng'}
                            </span>
                          </td>
                          <td>{user.createdAt ? formatDate(user.createdAt) : formatDate(user.registeredDate || new Date())}</td>
                          <td className="text-center">
                            <span className={`admin-badge ${
                              (user.status || 'active') === 'active' 
                                ? 'admin-badge-green' 
                                : 'admin-badge-red'
                            }`}>
                              {(user.status || 'active') === 'active' ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                            </span>
                          </td>
                          <td>
                            <div className="admin-table-actions">
                              <button 
                                className="admin-btn-icon"
                                onClick={() => openEditUserForm(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                className="admin-btn-icon admin-btn-danger"
                                onClick={() => handleDeleteClick(user)}
                                disabled={user.role === 'admin'} // Không cho phép xóa admin
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="admin-pagination">
                <div className="admin-pagination-info">
                  Hiển thị {users.length} / {totalPages * users.length} kết quả
                </div>
                <div className="admin-pagination-controls">
                  <button
                    className="admin-btn admin-btn-outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {totalPages <= 5 ? (
                    [...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        className={`admin-btn ${currentPage === index + 1 ? 'admin-btn-active' : 'admin-btn-outline'}`}
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </button>
                    ))
                  ) : (
                    <>
                      {/* Hiển thị số trang đầu tiên */}
                      <button
                        className={`admin-btn ${currentPage === 1 ? 'admin-btn-active' : 'admin-btn-outline'}`}
                        onClick={() => setCurrentPage(1)}
                      >
                        1
                      </button>
                      
                      {/* Hiển thị ... nếu không ở những trang đầu */}
                      {currentPage > 3 && <span className="admin-pagination-ellipsis">...</span>}
                      
                      {/* Hiển thị các trang xung quanh trang hiện tại */}
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        if (
                          (pageNum !== 1 && pageNum !== totalPages) && // Không phải trang đầu tiên hoặc cuối cùng
                          (Math.abs(pageNum - currentPage) <= 1) // Trong phạm vi 1 trang so với trang hiện tại
                        ) {
                          return (
                            <button
                              key={index}
                              className={`admin-btn ${currentPage === pageNum ? 'admin-btn-active' : 'admin-btn-outline'}`}
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                        return null;
                      })}
                      
                      {/* Hiển thị ... nếu không ở những trang cuối */}
                      {currentPage < totalPages - 2 && <span className="admin-pagination-ellipsis">...</span>}
                      
                      {/* Hiển thị số trang cuối cùng */}
                      <button
                        className={`admin-btn ${currentPage === totalPages ? 'admin-btn-active' : 'admin-btn-outline'}`}
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    className="admin-btn admin-btn-outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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

      {/* User Form Modal */}
      {showUserForm && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>
                {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-group">
                <label htmlFor="name" className="admin-form-label">
                  Tên người dùng <span className="text-error">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className={`admin-form-input ${errors.name ? 'admin-form-input-error' : ''}`}
                />
                {errors.name && (
                  <p className="admin-form-error">{errors.name}</p>
                )}
              </div>

              <div className="admin-form-group">
                <label htmlFor="email" className="admin-form-label">
                  Email <span className="text-error">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className={`admin-form-input ${errors.email ? 'admin-form-input-error' : ''}`}
                />
                {errors.email && (
                  <p className="admin-form-error">{errors.email}</p>
                )}
              </div>

              <div className="admin-form-group">
                <label htmlFor="phone" className="admin-form-label">
                  Số điện thoại <span className="text-error">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className={`admin-form-input ${errors.phone ? 'admin-form-input-error' : ''}`}
                />
                {errors.phone && (
                  <p className="admin-form-error">{errors.phone}</p>
                )}
              </div>

              <div className="admin-form-group">
                <label htmlFor="role" className="admin-form-label">
                  Vai trò <span className="text-error">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  className="admin-form-select"
                >
                  <option value="customer">Khách hàng</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label htmlFor="password" className="admin-form-label">
                  Mật khẩu {!editingUser && <span className="text-error">*</span>}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  className={`admin-form-input ${errors.password ? 'admin-form-input-error' : ''}`}
                />
                {editingUser && (
                  <p className="text-text-tertiary text-sm">Để trống nếu không muốn thay đổi mật khẩu</p>
                )}
                {errors.password && (
                  <p className="admin-form-error">{errors.password}</p>
                )}
              </div>

              <div className="admin-form-group">
                <label htmlFor="confirmPassword" className="admin-form-label">
                  Xác nhận mật khẩu {!editingUser && <span className="text-error">*</span>}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleFormChange}
                  className={`admin-form-input ${errors.confirmPassword ? 'admin-form-input-error' : ''}`}
                />
                {errors.confirmPassword && (
                  <p className="admin-form-error">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="admin-form-actions">
                <button 
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => setShowUserForm(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editingUser ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>Xác nhận vô hiệu hóa tài khoản</h3>
            </div>
            <div className="admin-modal-content">
              <div className="admin-alert admin-alert-warning">
                <UserX className="h-5 w-5" />
                <div>
                  <p>
                    Bạn có chắc chắn muốn vô hiệu hóa tài khoản người dùng <strong>"{userToDelete?.name}"</strong>?
                  </p>
                  <p className="mt-2">
                    Người dùng sẽ không thể đăng nhập vào hệ thống.
                  </p>
                </div>
              </div>
              <div className="admin-form-actions mt-6">
                <button 
                  className="admin-btn admin-btn-outline"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Hủy
                </button>
                <button 
                  onClick={confirmDelete}
                  className="admin-btn admin-btn-danger"
                >
                  Vô hiệu hóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
