# Hiệu Sách Trực Tuyến (React + NestJS)

> Ứng dụng web quản lý và bán sách: frontend React (Vite, Tailwind) và backend NestJS (Supabase).

## Cấu trúc thư mục

- `frontend/` – React + Vite + TailwindCSS, React Router, Axios
- `backend/` – NestJS 11, Supabase SDK, JWT Auth

```
frontend/
	src/
		pages/            # Trang Books, Cart, Profile, Admin...
		contexts/         # AuthContext, CartContext
		services/         # api.js, *.service.js
	public/assets/      # Ảnh tĩnh, placeholders

backend/
	src/
		models/           # Kiểu dữ liệu (Order, Book, User...)
		orders/ books/    # Module NestJS
		data/             # seed.command.ts, seed-data.ts
		migration/        # scripts tạo bảng (Supabase RPC)
```

## Yêu cầu môi trường

- Node.js 18+ (khuyến nghị)
- npm hoặc yarn
- Supabase project (cloud hoặc local). Bạn cần 2 biến môi trường:
	- `SUPABASE_URL`
	- `SUPABASE_KEY`

## Cấu hình môi trường

Tạo file `.env` trong thư mục `backend/`:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_or_anon_key
JWT_SECRET=super_secret_key
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

Tạo file `.env` trong thư mục `frontend/`:

```
VITE_API_URL=http://localhost:3000/api
```

## Cài đặt & chạy nhanh (Windows CMD)

1) Cài dependencies

```
cd backend && npm i
cd ..\frontend && npm i
```

2) Chạy backend (NestJS)

```
cd ..\backend
npm run start:dev    # http://localhost:3000
```

3) Chạy frontend (Vite)

```
cd ..\frontend
npm run dev          # http://localhost:5173
```

Truy cập web tại: http://localhost:5173

## Dữ liệu mẫu (tùy chọn)

- Thư mục `backend/src/data/` chứa dữ liệu seed (người dùng, tác giả, sách...).
- Tùy vào cách tích hợp `nest-commander`, lệnh seed có thể khác nhau. Nếu đã cấu hình, bạn có thể:

```
# (Ví dụ) build rồi chạy command seed
cd backend
npm run build
node dist/src/data/seed.command.js
```

Nếu dùng Supabase trực tiếp, có thể seed thủ công bằng SQL/CSV theo các bảng tương ứng.

Tài khoản mẫu (nếu seed):

- Admin: `admin@bookstore.com` / `Admin@123`
- Thủ kho: `thukho@gmail.com` / `Admin@123`
- User: `user@gmail.com` / `Admin@123`

## Ghi chú & mẹo khắc phục lỗi

- CORS: đảm bảo `CORS_ORIGIN` trong backend `.env` khớp với URL Vite (`http://localhost:5173`).
- API URL: đảm bảo `VITE_API_URL` trùng với backend (`http://localhost:3000/api`).
- Ảnh bìa sách: frontend ưu tiên lấy từ API (`coverImage/cover_image`). Nếu không có, sẽ fallback về ảnh trong `public/assets`.
- Nếu hình ảnh không hiển thị ở trang Hồ sơ (Profile), hãy kiểm tra `VITE_API_URL` và endpoint `/books/:id` của backend.

## Scripts hữu ích

Frontend:

- `npm run dev` – chạy dev server Vite
- `npm run build` – build production
- `npm run preview` – xem trước build
- `npm run lint` – ESLint

Backend:

- `npm run start:dev` – Nest watch mode
- `npm run build` – build Nest
- `npm run test` – Jest unit tests
- `npm run lint` – ESLint + Prettier config

## License

Private/UNLICENSED – chỉ phục vụ mục đích học tập và demo.

