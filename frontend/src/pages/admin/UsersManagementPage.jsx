import { useState, useEffect } from 'react';
import { Search, Filter, UserPlus, Edit, UserX, ChevronLeft, ChevronRight, Mail, Users, UserCheck } from 'lucide-react';
import userService from '../../services/user.service';
import { FormModal, ConfirmModal } from '../../components/ui/modal';
import './AdminPages.css';

export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  const openAddUserModal = () => {
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
    setShowUserModal(true);
  };

  const openEditUserModal = (user) => {
    setFormData({
      name: user.fullName || user.full_name || user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'customer',
      password: '',
      confirmPassword: ''
    });
    setEditingUser(user);
    setErrors({});
    setShowUserModal(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleActivateUser = async (user) => {
    if (!window.confirm(`Bạn có chắc chắn muốn kích hoạt lại tài khoản người dùng "${user.fullName || user.full_name || user.name}"?`)) {
      return;
    }

    try {
      await userService.activateUser(user.id);
      
      // Cập nhật UI
      setUsers(users.map(u => 
        u.id === user.id 
          ? { ...u, status: 'active' } 
          : u
      ));
      
      alert('Đã kích hoạt tài khoản người dùng thành công!');
      
      // Refresh lại danh sách
      fetchUsers();
    } catch (error) {
      console.error('Lỗi khi kích hoạt người dùng:', error);
      alert(error.message || 'Có lỗi xảy ra khi kích hoạt người dùng. Vui lòng thử lại.');
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      // Sử dụng deactivateUser thay vì deleteUser
      await userService.deactivateUser(userToDelete.id);
      
      // Cập nhật UI sau khi vô hiệu hóa
      setUsers(users.map(user => 
        user.id === userToDelete.id 
          ? { ...user, status: 'inactive' } 
          : user
      ));
      setShowDeleteModal(false);
      setUserToDelete(null);
      
      alert('Đã vô hiệu hóa tài khoản người dùng thành công!');
      
      // Refresh lại danh sách để cập nhật từ server
      fetchUsers();
    } catch (error) {
      console.error('Lỗi khi vô hiệu hóa người dùng:', error);
      alert(error.message || 'Có lỗi xảy ra khi vô hiệu hóa người dùng. Vui lòng thử lại.');
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
    
    // Số điện thoại không bắt buộc, chỉ validate nếu có nhập
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải có 10-11 chữ số';
    }
    
    // Validation mật khẩu - chỉ validate nếu có nhập
    if (formData.password && formData.password.trim()) {
      if (formData.password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
      
      // Chỉ kiểm tra confirm password nếu đã nhập password
      if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = 'Mật khẩu không khớp';
      }
    } else if (formData.confirmPassword && formData.confirmPassword.trim()) {
      // Nếu password trống nhưng confirmPassword có giá trị
      newErrors.confirmPassword = 'Vui lòng nhập mật khẩu trước';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    try {
      if (editingUser) {
        // Chuẩn bị dữ liệu cập nhật
        const updateData = {
          fullName: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role
        };
        
        // Chỉ thêm phone nếu có nhập
        if (formData.phone && formData.phone.trim()) {
          updateData.phone = formData.phone.trim();
        }
        
        // Chỉ thêm mật khẩu nếu người dùng có nhập và không rỗng
        if (formData.password && formData.password.trim() && formData.password.length > 0) {
          updateData.password = formData.password.trim();
        }
        
        await userService.updateUser(editingUser.id, updateData);
        alert('Cập nhật thông tin người dùng thành công!');
      } else {
        // Tạo người dùng mới
        const newUserData = {
          fullName: formData.name.trim(),
          email: formData.email.trim(),
          role: formData.role
        };
        
        // Chỉ thêm phone nếu có nhập
        if (formData.phone && formData.phone.trim()) {
          newUserData.phone = formData.phone.trim();
        }
        
        // Chỉ thêm password nếu có nhập và không rỗng
        if (formData.password && formData.password.trim() && formData.password.length > 0) {
          newUserData.password = formData.password.trim();
        }
        
        await userService.createUser(newUserData);
        alert('Thêm người dùng mới thành công!');
      }
      
      // Refresh lại danh sách và đóng form
      await fetchUsers();
      setShowUserModal(false);
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'customer',
        password: '',
        confirmPassword: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Lỗi khi lưu người dùng:', error);
      alert(`Có lỗi xảy ra: ${error.message || 'Vui lòng thử lại'}`);
    } finally {
      setSubmitting(false);
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
          onClick={openAddUserModal}
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
                                onClick={() => openEditUserModal(user)}
                                title="Chỉnh sửa"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              
                              {(user.status || 'active') === 'active' ? (
                                <button 
                                  className="admin-btn-icon admin-btn-danger"
                                  onClick={() => handleDeleteClick(user)}
                                  disabled={user.role === 'admin'} // Không cho phép vô hiệu hóa admin
                                  title={user.role === 'admin' ? 'Không thể vô hiệu hóa admin' : 'Vô hiệu hóa tài khoản'}
                                >
                                  <UserX className="h-4 w-4" />
                                </button>
                              ) : (
                                <button 
                                  className="admin-btn-icon admin-btn-success"
                                  onClick={() => handleActivateUser(user)}
                                  title="Kích hoạt lại tài khoản"
                                >
                                  <UserCheck className="h-4 w-4" />
                                </button>
                              )}
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
      <FormModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        size="medium"
        submitText={editingUser ? 'Cập nhật' : 'Thêm'}
      >
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Tên người dùng <span className="text-danger">*</span>
          </label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            placeholder="Nhập tên người dùng"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email <span className="text-danger">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="Nhập email"
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Số điện thoại
              </label>
              <input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                placeholder="Nhập số điện thoại (tùy chọn)"
              />
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="role" className="form-label">
            Vai trò <span className="text-danger">*</span>
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleFormChange}
            className="form-select"
          >
            <option value="customer">Khách hàng</option>
            <option value="admin">Admin</option>
            <option value="warehouse_manager">Quản lý kho</option>
          </select>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleFormChange}
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder={editingUser ? "Để trống nếu không muốn thay đổi" : "Nhập mật khẩu (tùy chọn)"}
              />
              {editingUser && (
                <small className="form-text text-muted">Để trống nếu không muốn thay đổi mật khẩu</small>
              )}
              {!editingUser && (
                <small className="form-text text-muted">Để trống nếu muốn tạo tài khoản không có mật khẩu</small>
              )}
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleFormChange}
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder={editingUser ? "Để trống nếu không đổi mật khẩu" : "Nhập lại mật khẩu (nếu có)"}
              />
              {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
            </div>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Xác nhận vô hiệu hóa tài khoản"
        message={`Bạn có chắc chắn muốn vô hiệu hóa tài khoản người dùng "${userToDelete?.fullName || userToDelete?.full_name || userToDelete?.name}"? Người dùng sẽ không thể đăng nhập vào hệ thống.`}
        confirmText="Vô hiệu hóa"
        variant="danger"
      />
    </div>
  );
}
