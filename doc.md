# YouTube Live Chat Fullscreen Extension - Tài liệu dự án

## 📋 Tổng quan dự án

### Mục tiêu
Xây dựng một Chrome Extension đơn giản cho phép người dùng xem và tương tác với chat YouTube Live ngay cả khi đang ở chế độ fullscreen.

### Vấn đề cần giải quyết
Khi xem livestream YouTube ở chế độ fullscreen, người dùng không thể theo dõi và tham gia chat mà không phải thoát khỏi chế độ fullscreen, gây gián đoạn trải nghiệm xem.

### Giải pháp
Extension sẽ hiển thị một popup chat overlay trên video fullscreen, cho phép người dùng:
- Xem tin nhắn chat real-time
- Gửi tin nhắn trực tiếp từ popup
- Duy trì trải nghiệm xem không bị gián đoạn

## 🎯 Phạm vi tính năng

### Tính năng core (Bắt buộc)
1. **Phát hiện chế độ fullscreen**
   - Tự động kích hoạt khi video chuyển sang fullscreen
   - Tự động ẩn khi thoát fullscreen

2. **Hiển thị chat overlay**
   - Popup chat nổi trên video
   - Hiển thị danh sách tin nhắn real-time
   - Tự động cuộn khi có tin nhắn mới

3. **Gửi tin nhắn**
   - Input field để nhập tin nhắn
   - Gửi tin nhắn trực tiếp từ overlay
   - Xác thực với tài khoản YouTube hiện tại

### Tính năng đã loại bỏ
- Các settings phức tạp
- Tùy chỉnh giao diện chi tiết
- Lọc/block tin nhắn
- Thống kê chat
- Các tính năng không thiết yếu khác

## 🏗️ Kiến trúc kỹ thuật

### Cấu trúc thư mục
```
youtube-live-chat-fullscreen/
├── manifest.json           # Chrome extension manifest
├── content.js             # Content script chính
├── popup.html             # HTML cho chat overlay
├── popup.css              # Styles cho overlay
├── popup.js               # Logic xử lý chat
└── icons/                 # Icon extension
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### Components chính

#### 1. Content Script (`content.js`)
- **Chức năng**: 
  - Theo dõi sự kiện fullscreen
  - Inject chat overlay vào DOM
  - Kết nối với YouTube Live Chat API
  
- **Nhiệm vụ**:
  - Detect khi user vào/thoát fullscreen
  - Tạo và quản lý iframe cho chat overlay
  - Handle communication giữa overlay và YouTube page

#### 2. Chat Overlay (`popup.html/js`)
- **Chức năng**:
  - Hiển thị giao diện chat
  - Xử lý input từ user
  - Cập nhật messages real-time

- **Components**:
  - Message list container
  - Message input field
  - Send button

#### 3. Styling (`popup.css`)
- **Yêu cầu**:
  - Responsive với các kích thước màn hình
  - Không che khuất nội dung video quan trọng
  - Dễ đọc trên video
  

## 📝 Chi tiết implementation

### Manifest Configuration
```json
{
  "manifest_version": 3,
  "permissions": [
    "activeTab",
    "storage"
  ],
  "content_scripts": [{
    "matches": ["*://*.youtube.com/*"],
    "js": ["content.js"],
    "css": ["popup.css"]
  }]
}
```

### Flow hoạt động

1. **Khởi tạo**
   - Extension load khi user vào YouTube
   - Content script được inject vào page
   - Listener cho fullscreen events được setup

2. **Kích hoạt fullscreen**
   - User click fullscreen button
   - Content script detect sự kiện
   - Chat overlay được tạo và hiển thị
   - Kết nối với chat stream được thiết lập

3. **Tương tác chat**
   - Messages được fetch từ YouTube chat API
   - Hiển thị real-time trong overlay
   - User input được capture và gửi về YouTube

4. **Thoát fullscreen**
   - Overlay được remove khỏi DOM
   - Cleanup resources
   - Return to normal YouTube interface

## 🔧 Technical Considerations

### Performance
- Minimize DOM manipulation
- Efficient message rendering (virtual scrolling nếu cần)
- Debounce/throttle update events

### Security
- Sanitize user input
- Validate messages trước khi hiển thị
- Respect YouTube's CSP policies

### Compatibility
- Chrome version 88+
- YouTube Live streams only
- Responsive cho các screen sizes

## 🚀 Development Steps

### Phase 1: Setup cơ bản
1. Tạo extension structure
2. Setup manifest.json
3. Implement fullscreen detection

### Phase 2: Chat overlay
1. Design và implement UI
2. Position overlay properly
3. Handle show/hide logic

### Phase 3: Chat integration
1. Connect với YouTube chat
2. Fetch và display messages
3. Implement send functionality

### Phase 4: Testing & Polish
1. Test trên các live streams khác nhau
2. Fix bugs và edge cases
3. Optimize performance

## 🐛 Known Challenges

### Technical
- YouTube DOM structure có thể thay đổi
- Chat API không có documentation chính thức
- Xử lý authentication phức tạp

### UX
- Không che khuất nội dung video quan trọng
- Đảm bảo chat dễ đọc
- Balance giữa visibility và non-intrusive

## 📚 Resources & References

### APIs & Documentation
- Chrome Extensions API
- YouTube iframe API (nếu applicable)
- MutationObserver cho DOM changes

### Tools
- Chrome Developer Tools
- Extension reload tools
- YouTube test streams

## ✅ Testing Checklist

### Functional Testing
- [ ] Overlay xuất hiện khi vào fullscreen
- [ ] Overlay biến mất khi thoát fullscreen
- [ ] Messages hiển thị correctly
- [ ] Gửi message hoạt động
- [ ] Auto-scroll hoạt động

### Compatibility Testing
- [ ] Các YouTube live stream khác nhau
- [ ] Các screen resolutions
- [ ] Các Chrome versions

### Edge Cases
- [ ] Stream không có chat
- [ ] User chưa login
- [ ] Network issues
- [ ] Rapid fullscreen toggle

## 🎨 UI/UX Guidelines

### Design Principles
- **Minimal**: Không làm rối trải nghiệm xem
- **Readable**: Text rõ ràng trên mọi background
- **Intuitive**: Dễ sử dụng không cần học
- **Responsive**: Adapt với mọi screen size

### Layout Recommendations
- Position: Fixed ở góc phải màn hình
- Width: 300-400px (có thể điều chỉnh)
- Height: 40-60% screen height
- Opacity: 80-90% cho nền
- Z-index: Đủ cao để nổi trên video controls

---

*Tài liệu này cung cấp overview và guidelines cho việc phát triển YouTube Live Chat Fullscreen Extension. Tập trung vào simplicity và core functionality để đảm bảo trải nghiệm người dùng tốt nhất.*