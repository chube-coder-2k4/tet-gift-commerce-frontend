# Refund Flow API Documentation

Tài liệu mô tả các API cho luồng hoàn tiền khi khách hàng hủy đơn hàng đã thanh toán.

---

## Trạng thái đơn hàng mới

| Enum Value | Ý nghĩa |
|---|---|
| `CANCELLED_PENDING_REFUND` | Đã hủy - Chờ hoàn tiền |
| `CANCELLED_REFUNDED` | Đã hủy - Đã hoàn tiền |

---

## 1. Khách hàng hủy đơn & yêu cầu hoàn tiền

### `PUT /api/v1/orders/{id}/cancel-refund`

> **Ai gọi:** Khách hàng (USER)
> **Điều kiện:** Đơn hàng phải ở trạng thái `PAID` (đã thanh toán)

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "bankName": "Vietcombank",
  "bankAccount": "1234567890",
  "accountHolder": "NGUYEN VAN A"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `bankName` | String | ✅ | Tên ngân hàng |
| `bankAccount` | String | ✅ | Số tài khoản ngân hàng |
| `accountHolder` | String | ✅ | Tên chủ tài khoản |

**Response (200):**
```json
{
  "status": 200,
  "message": "Order cancelled. Refund is pending.",
  "data": {
    "id": 1,
    "status": "CANCELLED_PENDING_REFUND",
    "totalAmount": 500000,
    "customerName": "Nguyen Van A",
    "customerEmail": "a@email.com",
    "receiverName": "Nguyen Van A",
    "receiverPhone": "0901234567",
    "shippingAddress": "123 ABC, HCM",
    "discountCode": null,
    "discountAmount": 0,
    "vatCompanyName": null,
    "vatTaxCode": null,
    "vatPhone": null,
    "vatAddress": null,
    "refundBankName": "Vietcombank",
    "refundBankAccount": "1234567890",
    "refundAccountHolder": "NGUYEN VAN A",
    "refundConfirmedAt": null,
    "items": [...],
    "createdAt": "2026-03-26T10:00:00"
  }
}
```

**Errors:**
| HTTP | Message | Khi nào |
|---|---|---|
| 403 | `You can only cancel your own orders` | Đơn không thuộc user hiện tại |
| 400 | `Only paid orders can be cancelled with refund...` | Đơn không ở trạng thái `PAID` |
| 404 | `Order not found: {id}` | Không tìm thấy đơn |

**UI Flow:**
1. Kiểm tra `order.status === "PAID"` → Hiển thị nút **"Hủy đơn hàng"**
2. User click → Popup form nhập: Tên ngân hàng, Số tài khoản, Tên chủ tài khoản
3. Submit → Gọi API → Cập nhật UI: trạng thái = `CANCELLED_PENDING_REFUND`

---

## 2. Admin xem danh sách yêu cầu hoàn tiền

### `GET /api/v1/refunds?page={page}&size={size}`

> **Ai gọi:** Admin
> **Mô tả:** Lấy danh sách các đơn hàng đang chờ hoàn tiền (phân trang)

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Params:**
| Param | Type | Default | Description |
|---|---|---|---|
| `page` | int | `0` | Trang hiện tại (0-indexed) |
| `size` | int | `10` | Số item mỗi trang |

**Response (200):**
```json
{
  "status": 200,
  "message": "Refund orders fetched",
  "data": {
    "data": [
      {
        "id": 1,
        "status": "CANCELLED_PENDING_REFUND",
        "totalAmount": 500000,
        "customerName": "Nguyen Van A",
        "customerEmail": "a@email.com",
        "refundBankName": "Vietcombank",
        "refundBankAccount": "1234567890",
        "refundAccountHolder": "NGUYEN VAN A",
        "refundConfirmedAt": null,
        "items": [...],
        "createdAt": "2026-03-26T10:00:00"
      }
    ],
    "pageNo": 0,
    "pageSize": 10,
    "totalItems": 5,
    "totalPages": 1
  }
}
```

**UI Flow:**
- Tạo tab **"Yêu cầu hoàn tiền"** trong trang Admin
- Hiển thị bảng với các cột: Order ID, Tên KH, Email, Tổng tiền, Ngày đặt, Ngân hàng, STK, Chủ TK
- Mỗi dòng có nút **"Xác nhận đã hoàn tiền"**

---

## 3. Admin xác nhận đã hoàn tiền

### `PUT /api/v1/refunds/{id}/confirm`

> **Ai gọi:** Admin
> **Mô tả:** Đánh dấu đã hoàn tiền cho đơn hàng

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
{
  "status": 200,
  "message": "Refund confirmed",
  "data": {
    "id": 1,
    "status": "CANCELLED_REFUNDED",
    "refundBankName": "Vietcombank",
    "refundBankAccount": "1234567890",
    "refundAccountHolder": "NGUYEN VAN A",
    "refundConfirmedAt": "2026-03-27T14:30:00",
    ...
  }
}
```

**Errors:**
| HTTP | Message | Khi nào |
|---|---|---|
| 400 | `Order is not in pending refund status...` | Đơn không ở trạng thái `CANCELLED_PENDING_REFUND` |
| 404 | `Order not found: {id}` | Không tìm thấy đơn |

**UI Flow:**
1. Admin click **"Xác nhận đã hoàn tiền"** → Gọi API
2. Thành công → Ẩn đơn khỏi danh sách chờ hoàn tiền (hoặc đổi badge sang "Đã hoàn tiền")

---

## 4. Admin xuất báo cáo Excel/CSV

### `GET /api/v1/refunds/export?startDate={date}&endDate={date}&format={format}`

> **Ai gọi:** Admin
> **Mô tả:** Xuất danh sách đơn chờ hoàn tiền ra file Excel hoặc CSV

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Params:**
| Param | Type | Required | Example | Description |
|---|---|---|---|---|
| `startDate` | LocalDate (ISO) | ✅ | `2026-03-01` | Ngày bắt đầu |
| `endDate` | LocalDate (ISO) | ✅ | `2026-03-31` | Ngày kết thúc |
| `format` | String | ❌ | `xlsx` hoặc `csv` | Mặc định: `xlsx` |

**Response:** File download trực tiếp (binary)
- `xlsx` → Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- `csv` → Content-Type: `text/csv; charset=UTF-8`

**Các cột trong file:**

| # | Column | Mô tả |
|---|---|---|
| 1 | Order ID | Mã đơn hàng |
| 2 | Customer Name | Tên khách hàng |
| 3 | Customer Email | Email khách hàng |
| 4 | Total Amount | Số tiền cần hoàn |
| 5 | Order Date | Ngày đặt hàng |
| 6 | Bank Name | Tên ngân hàng |
| 7 | Bank Account | Số tài khoản |
| 8 | Account Holder | Tên chủ tài khoản |

**UI Flow:**
1. Admin chọn khoảng thời gian (date picker: startDate, endDate)
2. Chọn định dạng (xlsx / csv)
3. Click **"Xuất báo cáo"** → Tải file về

**Gọi API từ FE (ví dụ):**
```javascript
const downloadRefundReport = async (startDate, endDate, format = 'xlsx') => {
  const response = await fetch(
    `/api/v1/refunds/export?startDate=${startDate}&endDate=${endDate}&format=${format}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `refund_orders.${format}`;
  a.click();
  window.URL.revokeObjectURL(url);
};
```

---

## Tổng hợp Endpoints

| Method | Endpoint | Role | Mô tả |
|---|---|---|---|
| `PUT` | `/api/v1/orders/{id}/cancel-refund` | USER | Hủy đơn + yêu cầu hoàn tiền |
| `GET` | `/api/v1/refunds` | ADMIN | Danh sách đơn chờ hoàn tiền |
| `PUT` | `/api/v1/refunds/{id}/confirm` | ADMIN | Xác nhận đã hoàn tiền |
| `GET` | `/api/v1/refunds/export` | ADMIN | Xuất Excel/CSV |

---

## WebSocket Notifications

Khi trạng thái đơn thay đổi, server gửi thông báo qua WebSocket:

| Event | Destination | Message |
|---|---|---|
| Hủy đơn + yêu cầu hoàn tiền | `/user/{username}/queue/order-status` | `Order #{id} has been cancelled. Refund is pending.` |
| Admin xác nhận hoàn tiền | `/user/{username}/queue/order-status` | `Order #{id} refund has been completed.` |
