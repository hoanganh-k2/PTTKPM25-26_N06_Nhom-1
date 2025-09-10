// src/data/seed-data.ts

// Data mẫu cho các bảng

export const usersSeed = [
  {
    full_name: 'Admin User',
    email: 'admin@example.com',
    password: '$2b$10$H9EHCsFSNwV3ZNE36BVHme4UPYoIfBBpY6ooCgMCYnIyn5kBmeuzW', // hashed 'password123'
    is_admin: true,
  },
  {
    full_name: 'Khách hàng',
    email: 'user@example.com',
    password: '$2b$10$H9EHCsFSNwV3ZNE36BVHme4UPYoIfBBpY6ooCgMCYnIyn5kBmeuzW', // hashed 'password123'
    is_admin: false,
  },
];

export const authorsSeed = [
  {
    name: 'Dale Carnegie',
    biography: 'Dale Carnegie là một nhà văn và nhà thuyết trình người Mỹ và là người phát triển các lớp tự giáo dục, nghệ thuật bán hàng, huấn luyện đoàn thể, nói trước công chúng và các kỹ năng giao tiếp giữa mọi người.',
    nationality: 'Mỹ',
  },
  {
    name: 'Paulo Coelho',
    biography: 'Paulo Coelho là một nhà văn người Brazil, được biết đến nhiều nhất với cuốn tiểu thuyết "Nhà Giả Kim".',
    nationality: 'Brazil',
  },
  {
    name: 'Nguyễn Nhật Ánh',
    biography: 'Nguyễn Nhật Ánh là nhà văn Việt Nam chuyên viết cho tuổi mới lớn và được biết đến rộng rãi với nhiều tác phẩm văn học về đề tài tuổi học trò.',
    nationality: 'Việt Nam',
  },
  {
    name: 'Tô Hoài',
    biography: 'Tô Hoài là nhà văn Việt Nam nổi tiếng với nhiều tác phẩm văn học, đặc biệt là "Dế Mèn Phiêu Lưu Ký".',
    nationality: 'Việt Nam',
  },
];

export const publishersSeed = [
  {
    name: 'NXB Trẻ',
    description: 'Nhà xuất bản Trẻ là một trong những nhà xuất bản lớn nhất Việt Nam',
    website: 'https://nxbtre.vn',
  },
  {
    name: 'NXB Kim Đồng',
    description: 'Nhà xuất bản Kim Đồng chuyên về sách thiếu nhi và truyện tranh',
    website: 'https://nxbkimdong.com.vn',
  },
  {
    name: 'First News',
    description: 'First News - Trí Việt chuyên xuất bản và phát hành sách bản quyền nước ngoài',
    website: 'https://www.firstnews.com.vn',
  },
];

export const categoriesSeed = [
  {
    name: 'Tự lực',
    description: 'Sách về phát triển bản thân, tư duy, kỹ năng sống',
  },
  {
    name: 'Tiểu thuyết',
    description: 'Các thể loại tiểu thuyết, truyện dài',
  },
  {
    name: 'Thiếu nhi',
    description: 'Sách dành cho trẻ em và thanh thiếu niên',
  },
  {
    name: 'Kinh tế',
    description: 'Sách về kinh doanh, tài chính, quản lý',
  },
];

export const booksSeed = [
  {
    title: 'Đắc Nhân Tâm',
    description: 'Đắc nhân tâm của Dale Carnegie là quyển sách của mọi thời đại và một trong những cuốn sách bán chạy nhất mọi thời đại.',
    price: 120000,
    stock: 50,
    author_id: '1', // Sẽ được thay thế bằng ID thực tế từ database
    publisher_id: '3', // Sẽ được thay thế bằng ID thực tế từ database
    category_ids: ['1'], // Sẽ được thay thế bằng ID thực tế từ database
    isbn: '9786045634332',
    publish_year: 2016,
    language: 'Vietnamese',
    page_count: 320,
    cover_image: 'https://placehold.co/600x900',
  },
  {
    title: 'Nhà Giả Kim',
    description: 'Tác phẩm được xem là một trong những cuốn sách hay nhất mọi thời đại. Được xuất bản lần đầu vào năm 1988, Nhà Giả Kim đã trở thành một hiện tượng văn học toàn cầu.',
    price: 90000,
    stock: 40,
    author_id: '2',
    publisher_id: '3',
    category_ids: ['2'],
    isbn: '9786049943133',
    publish_year: 2020,
    language: 'Vietnamese',
    page_count: 227,
    cover_image: 'https://placehold.co/600x900',
  },
  {
    title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh',
    description: 'Tôi thấy hoa vàng trên cỏ xanh là một tiểu thuyết của nhà văn Nguyễn Nhật Ánh, xuất bản lần đầu năm 2010, tái bản năm 2018.',
    price: 85000,
    stock: 35,
    author_id: '3',
    publisher_id: '1',
    category_ids: ['2', '3'],
    isbn: '8935235217775',
    publish_year: 2018,
    language: 'Vietnamese',
    page_count: 378,
    cover_image: 'https://placehold.co/600x900',
  },
  {
    title: 'Dế Mèn Phiêu Lưu Ký',
    description: 'Dế Mèn phiêu lưu ký là tác phẩm văn xuôi đặc sắc và nổi tiếng nhất của nhà văn Tô Hoài viết về loài vật, được viết vào mùa thu năm 1941.',
    price: 78000,
    stock: 60,
    author_id: '4',
    publisher_id: '2',
    category_ids: ['3'],
    isbn: '8934974170556',
    publish_year: 2019,
    language: 'Vietnamese',
    page_count: 144,
    cover_image: 'https://placehold.co/600x900',
  },
];

// Function để seed data vào Supabase
export const seedData = async (supabase) => {
  try {
    // Seed users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .upsert(usersSeed)
      .select();
    
    if (usersError) throw usersError;
    console.log('Seeded users:', users.length);

    // Seed authors
    const { data: authors, error: authorsError } = await supabase
      .from('authors')
      .upsert(authorsSeed)
      .select();
    
    if (authorsError) throw authorsError;
    console.log('Seeded authors:', authors.length);

    // Seed publishers
    const { data: publishers, error: publishersError } = await supabase
      .from('publishers')
      .upsert(publishersSeed)
      .select();
    
    if (publishersError) throw publishersError;
    console.log('Seeded publishers:', publishers.length);

    // Seed categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .upsert(categoriesSeed)
      .select();
    
    if (categoriesError) throw categoriesError;
    console.log('Seeded categories:', categories.length);

    // Replace IDs in books seed data
    const booksWithRealIds = booksSeed.map(book => {
      const authorId = authors.find(a => a.name === authorsSeed.find((_, i) => i + 1 === parseInt(book.author_id)).name)?.id;
      const publisherId = publishers.find(p => p.name === publishersSeed.find((_, i) => i + 1 === parseInt(book.publisher_id)).name)?.id;
      const categoryIds = book.category_ids.map(catId => 
        categories.find(c => c.name === categoriesSeed.find((_, i) => i + 1 === parseInt(catId)).name)?.id
      );

      return {
        ...book,
        author_id: authorId,
        publisher_id: publisherId,
        category_ids: categoryIds,
      };
    });

    // Seed books
    const { data: books, error: booksError } = await supabase
      .from('books')
      .upsert(booksWithRealIds)
      .select();
    
    if (booksError) throw booksError;
    console.log('Seeded books:', books.length);

    return { success: true, message: 'Dữ liệu đã được seed thành công' };
  } catch (error) {
    console.error('Lỗi khi seed data:', error);
    return { success: false, message: `Seed data thất bại: ${error.message}` };
  }
};
