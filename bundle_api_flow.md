# Bundle Management API Flow

This document details the API request and response flow for the **Bundle Management** feature. Frontend agents can use this as a reference for integrating Bundle-related screens (Admin Bundle CRUD, displaying bundles on the customer storefront, etc.).

## 📌 Base URL
`/api/v1/bundles`

---

## 1. Lấy danh sách Bundles (Get All Bundles)
*Trả về danh sách các bundles hỗ trợ phân trang.*

**[GET]** `/api/v1/bundles`

### Tham số (Query Parameters):
| Tham số | Kiểu dữ liệu | Mặc định | Mô tả |
| :--- | :--- | :--- | :--- |
| `page` | integer | `0` | Trang hiện tại (Bắt đầu từ 0) |
| `size` | integer | `10` | Số lượng phần tử trên 1 trang |
| `sortBy` | string | `createdAt` | Trường để sắp xếp |
| `sortDir` | string | `desc` | Chiều sắp xếp (`asc` / `desc`) |

### Response: `200 OK`
```json
{
  "status": 200,
  "message": "Bundles fetched successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Combo Quà Tết Tài Lộc",
        "description": "Phần quà mang lại tài lộc may mắn.",
        "price": 500000,
        "image": "https://res.cloudinary.com/...",
        "isCustom": false,
        "isActive": true,
        "products": [
          {
            "id": 101,
            "productId": 5,
            "productName": "Bánh quy Đan Mạch",
            "productPrice": 150000,
            "quantity": 2
          }
        ]
      }
    ],
    "pageNo": 0,
    "pageSize": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

---

## 2. Lấy Chi Tiết Bundle (Get Bundle by ID)
*Lấy thông tin chi tiết của 1 bundle cùng danh sách sản phẩm bên trong.*

**[GET]** `/api/v1/bundles/{id}`

### Response: `200 OK`
```json
{
  "status": 200,
  "message": "Bundle fetched successfully",
  "data": {
    "id": 1,
    "name": "Combo Quà Tết Tài Lộc",
    "description": "Phần quà mang lại tài lộc may mắn.",
    "price": 500000,
    "image": "https://res.cloudinary.com/...",
    "isCustom": false,
    "isActive": true,
    "products": [
      {
        "id": 101,
        "productId": 5,
        "productName": "Bánh quy Đan Mạch",
        "productPrice": 150000,
        "quantity": 2
      }
    ]
  }
}
```

---

## 3. Tạo Mới Bundle (Create Bundle)

Có 2 cách tạo mới do hỗ trợ upload ảnh hoặc chỉ gửi JSON thuần. *(Lưu ý: Chỉ định giá trị `isCustom: false` thì lúc lưu hệ thống sẽ tự động tính toán tổng `price` dựa trên giá và số lượng các products. Nếu bạn điền tay `price` và muốn fix giá đó thì cần để `isCustom: true`)*

### Lựa chọn A: Tạo có kèm theo Ảnh (Multipart Form-Data)
**[POST]** `/api/v1/bundles`
**Header**: `Content-Type: multipart/form-data`

Body (`form-data`):
- `request`: *JSON String* chứa thông tin `BundleRequest`
- `image`: *File ảnh* (Nhận `null` tuỳ chọn)

**JSON Object của `request` (`BundleRequest`)**:
```json
{
  "name": "Combo Quà Cáp",
  "price": 300000,
  "isCustom": false,
  "description": "Bao gồm mứt bánh siêu ngon",
  "products": [
    {
      "productId": 5,
      "quantity": 1
    },
    {
      "productId": 8,
      "quantity": 2
    }
  ]
}
```

### Lựa chọn B: Tạo không chứa Ảnh (JSON)
**[POST]** `/api/v1/bundles`
**Header**: `Content-Type: application/json`

Body (chính là object như `BundleRequest` bên trên).

---

## 4. Cập Nhật Bundle (Update Bundle)

Phương thức cập nhật cũng có 2 sự lựa chọn y như lúc tạo (kèm upload ảnh hoặc không). Gửi danh sách `products` mới sẽ tiến hành Ghi đè (Xóa list product cũ và thay bằng list product mới được cung cấp).

### Kèm theo Ảnh (Multipart Form-Data)
**[PUT]** `/api/v1/bundles/{id}`
**Header**: `Content-Type: multipart/form-data`

Body (`form-data`):
- `request`: *JSON String* chứa `BundleRequest`
- `image`: *File ảnh* (Gửi lên ảnh mới sẽ ghi đè link cũ, nếu không upload thì URL ảnh cũ vẫn giữ nguyên)

### JSON Thuần
**[PUT]** `/api/v1/bundles/{id}`
**Header**: `Content-Type: application/json`

Body chứa thông tin JSON `BundleRequest`.

---

## 5. Xoá Bundle (Soft Delete)
*Thực hiện kịch bản soft-delete: chuyển `isActive = false`.*

**[DELETE]** `/api/v1/bundles/{id}`

### Response: `200 OK`
```json
{
  "status": 200,
  "message": "Bundle deleted successfully",
  "data": null
}
```
