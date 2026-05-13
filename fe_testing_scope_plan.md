# 📋 Scope of Testing — agoda-fe (Frontend Unit Tests)

> **Nguyên tắc quan trọng:** Tất cả test đều dựa trên **specification/user-facing behavior** — KHÔNG dựa vào source code để tránh tình trạng test luôn pass 100% (tautological tests).

---

## 1. Testing Pattern

| Khía cạnh | Cách làm |
|---|---|
| **Render test** | Component render đúng heading, text, button mà user nhìn thấy |
| **API integration** | Mock API → verify gọi đúng params, render đúng data trả về |
| **Error handling** | API fail → page không crash, không hiện stale data |
| **Edge cases** | Data thiếu field → component xử lý graceful hay throw? |
| **Composition** | Index file render đủ child components |
| **Navigation** | Link/route trỏ đúng path expected |

---

## 2. Unit Test Cases — Bảng mẫu

> Điền **Notes** chỉ khi **Result = Fail** — ghi rõ lý do thất bại.

| TC ID | File / Class | Path | Function / Method | Test Objective | Input | Expected Output | Result | Notes |
|-------|-------------|------|-------------------|----------------|-------|-----------------|--------|-------|
| ACT-TC-001 | BackgroundActivity | Activity/BackgroundActivity.test.jsx | renders hero | Heading h1 và button "Tìm kiếm" hiển thị đúng | render `<BackgroundActivity />` | Heading level 1 + placeholder "Đà Nẵng" + button "Tìm kiếm" có mặt | Pass | |
| ACT-TC-002 | ExploreLocationNearby | Activity/ExploreLocationNearby.test.jsx | getTopVietNamHotel | Gọi API với limit=50, render city cards có link | mock trả `[{id:1, name:"Đà Nẵng"}]` | Link href="/activity/city/1" có mặt | Pass | |
| ACT-TC-003 | ExploreLocationNearby | Activity/ExploreLocationNearby.test.jsx | API isSuccess=false | Không render stale data khi API trả isSuccess=false | mock trả `{isSuccess:false, data:[...]}` | Không có link nào trên trang | Pass | |
| ACT-TC-004 | ExploreLocationNearby | Activity/ExploreLocationNearby.test.jsx | API reject | Page không crash khi network error | mock reject `Error("Network error")` | Heading vẫn hiển thị, không có link | Pass | |
| ACT-TC-005 | TopActivity | Activity/TopActivity.test.jsx | fetchActivity on mount | Dispatch fetchActivity với query recommended=true | render component | fetchActivity được gọi với `current=1&pageSize=10&recommended=true` | Pass | |
| ACT-TC-006 | TopActivity | Activity/TopActivity.test.jsx | renders activity cards | Card hiện đúng tên, sao, giá, link detail | store có 2 activities | Link href="/activity/detail/11", text "4.5", text "1.200.000" | Pass | |
| ACT-TC-007 | TopActivity | Activity/TopActivity.test.jsx | empty activities | Không crash khi store rỗng | store data=[] | Không có link, swiper vẫn render | Pass | |
| ACT-TC-008 | TopActivity | Activity/TopActivity.test.jsx | missing price field | Throw khi avg_price undefined | activity không có avg_price | Component throw error | Pass | |
| ACT-TC-009 | WhyChooseAgoda | Activity/WhyChooseAgoda.test.jsx | value propositions | 3 value prop đầy đủ heading + mô tả | render component | "Hơn 300.000 trải nghiệm", "Nhanh chóng và linh hoạt", "Trải nghiệm du lịch hợp nhất" | Pass | |
| ACT-TC-010 | Activity (index) | Activity/index.test.jsx | composition | Render đủ 4 child sections | render `<Activity />` | BackgroundActivity, TopActivity, ExploreLocationNearby, WhyChooseAgoda đều có mặt | Pass | |

> _(Bảng trên là mẫu cho Activity — mỗi folder sẽ có bảng tương tự sau khi implement và chạy test)_

---

## 3. Lệnh chạy test — lấy kết quả PASSED/FAILED từng case

### ▶ Frontend (Jest)

> [!IMPORTANT]
> Muốn terminal hiện **PASS/FAIL từng test case** như BE thì phải chạy với
> `--verbose`. Nên thêm `--silent` để ẩn log nhiễu từ React/JSDOM và
> `--runInBand` để output tuần tự, dễ chụp màn hình báo cáo.
>
> Lệnh phải chạy tại đúng thư mục `d:\SQA-UNIT-TEST\agoda-fe`, nếu chạy ở
> `d:\SQA-UNIT-TEST` thì Jest sẽ báo lỗi không tìm thấy `jest.config.js`.

```powershell
# Chạy TẤT CẢ test FE — hiện từng test case PASSED/FAILED
cd d:\SQA-UNIT-TEST\agoda-fe
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --verbose --silent --runInBand

# Chạy 1 folder cụ thể bằng Jest pattern
# Lưu ý: pattern "Activity" có thể match cả ActivityCity/ActivityDetail.
# Nếu chỉ muốn đúng folder Activity, ưu tiên dùng --runTestsByPath bên dưới.
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --verbose --silent --runInBand tests/components/Activity
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --verbose --silent --runInBand tests/components/ActivityCity
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --verbose --silent --runInBand tests/components/ActivityDetail
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --verbose --silent --runInBand tests/components/BookingVehicles
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --verbose --silent --runInBand tests/components/Cart
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --verbose --silent --runInBand tests/components/Chatbot
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --verbose --silent --runInBand tests/components/City
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --verbose --silent --runInBand tests/components/Favourite
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --verbose --silent --runInBand tests/components/Flight
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --verbose --silent --runInBand tests/components/Flight1
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --verbose --silent --runInBand tests/components/Home
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --verbose --silent --runInBand tests/components/HomeAndApartment
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --verbose --silent --runInBand tests/components/Hotel
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --verbose --silent --runInBand tests/components/Profile
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --verbose --silent --runInBand tests/components/Promotion
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --verbose --silent --runInBand tests/components/Search
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --verbose --silent --runInBand tests/components/TravelGuide

# Chạy chính xác folder Activity hiện tại — output rõ từng file + từng test case
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --verbose --silent --runInBand --runTestsByPath tests/components/Activity/BackgroundActivity.test.jsx tests/components/Activity/ExploreLocationNearby.test.jsx tests/components/Activity/TopActivity.test.jsx tests/components/Activity/WhyChooseAgoda.test.jsx tests/components/Activity/index.test.jsx

# Chạy 1 file cụ thể
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --verbose --silent --runInBand --runTestsByPath tests/components/Activity/TopActivity.test.jsx
```

> [!TIP]
> Để output hiện luôn mã test case giống BE, đặt tên `it(...)` bắt đầu bằng
> TC ID, ví dụ: `it("ACT-TC-009 - communicates all Agoda value propositions...", ...)`.

### ▶ Backend (Django/pytest)

```powershell
# Chạy TẤT CẢ test BE
cd d:\SQA-UNIT-TEST\agoda-be
python -m pytest -v

# Chạy 1 folder cụ thể
python -m pytest bookings/tests.py -v
python -m pytest flights/tests.py -v

# Chạy 1 test case cụ thể
python -m pytest bookings/tests.py::BookingModelTests::test_bkg_tc_001 -v
```

> **Output mẫu trong terminal:**
> ```
> PASS  tests/components/Activity/BackgroundActivity.test.jsx
>   BackgroundActivity
>     ✓ renders the activity landing hero with search controls (15 ms)
>
> PASS  tests/components/Activity/TopActivity.test.jsx
>   TopActivity
>     ✓ requests the first page of recommended activities (8 ms)
>     ✓ renders activity cards with user-visible details (5 ms)
>     ✗ exposes a robustness gap when price is missing (2 ms)
> ```

---

## 4. Code Coverage Report

> Mục tiêu: Sinh báo cáo dạng **File | statements | missing | excluded | coverage%** như screenshot — chụp lại để đưa vào báo cáo cuối.

### ▶ Backend — coverage.py (Django)

```powershell
# Bước 1: Cài coverage nếu chưa có
pip install coverage

# Bước 2: Chạy test qua coverage
cd d:\SQA-UNIT-TEST\agoda-be
coverage run -m pytest -v

# Bước 3: Xem báo cáo trên terminal (đúng format screenshot)
coverage report

# Bước 4 (tuỳ chọn): Sinh HTML report để xem chi tiết từng dòng
coverage html
# Mở file: htmlcov/index.html

# Chạy coverage cho 1 module cụ thể
coverage run -m pytest accounts/tests.py -v
coverage report --include="accounts/*"
```

> **Output mẫu trên terminal (giống screenshot):**
> ```
> Coverage report: 62%
>
> File                              statements   missing   excluded   coverage
> accounts/__init__.py                       0         0          0      100%
> accounts/models.py                        45         2          0       96%
> accounts/serializers.py                   38         4          0       89%
> accounts/views.py                         72        18          0       75%
> accounts/tests.py                         65         0          0      100%
> -----------------------------------------------------------------------
> TOTAL                                    220        24          0       89%
> ```

### ▶ Frontend — Jest Coverage

> [!IMPORTANT]
> Coverage cũng chạy giống test thường: dùng `--coverage --verbose` để vừa hiện
> **PASS/FAIL từng test case**, vừa in bảng coverage. Nên thêm `--silent`
> để ẩn log nhiễu và `--runInBand` để output ổn định khi chụp màn hình.
>
> Phải chạy tại `d:\SQA-UNIT-TEST\agoda-fe` để Jest đọc đúng `jest.config.js`
> và sinh report vào `agoda-fe\coverage`.

```powershell
# Chạy TẤT CẢ test FE + sinh coverage report + hiện từng test case
cd d:\SQA-UNIT-TEST\agoda-fe
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --coverage --verbose --silent --runInBand

# Coverage cho 1 folder bằng Jest pattern
# Lưu ý: pattern "Activity" có thể match cả ActivityCity/ActivityDetail.
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --coverage --verbose --silent --runInBand tests/components/Activity

# Coverage chính xác cho folder Activity hiện tại, hiển thị bảng giống mẫu
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --coverage --coverageReporters=json-summary --reporters=default --reporters=./tests/coverageReporters/activityCoverageTable.js --verbose --silent --runInBand --runTestsByPath tests/components/Activity/BackgroundActivity.test.jsx tests/components/Activity/ExploreLocationNearby.test.jsx tests/components/Activity/TopActivity.test.jsx tests/components/Activity/WhyChooseAgoda.test.jsx tests/components/Activity/index.test.jsx

# Chạy coverage cho 1 file cụ thể
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --coverage --verbose --silent --runInBand --runTestsByPath tests/components/Activity/TopActivity.test.jsx

# Chỉ xem coverage summary, không cần bảng chi tiết từng file
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --coverage --coverageReporters=text-summary --silent --runInBand

# Sinh HTML coverage report để mở bằng browser
node ../../SQA/agoda-fe/node_modules/jest/bin/jest.js --config jest.config.js --coverage --coverageReporters=html --silent --runInBand
# Mở file: d:\SQA-UNIT-TEST\agoda-fe\coverage\index.html
```

> [!TIP]
> Nếu muốn coverage chỉ tính riêng source của folder đang test, kiểm tra
> `collectCoverageFrom` trong `jest.config.js`. Hiện Activity đã có các file:
> `BackgroundActivity.jsx`, `ExploreLocationNearby.jsx`, `TopActivity.jsx`,
> `WhyChooseAgoda.jsx`, `index.jsx`.

> **Output mẫu trên terminal:**
> ```text
> Total: 96.43%
> Statements: 28
> Miss: 1
>
> Activity Coverage Summary
> ┌─────────┬─────────────────────────────┬────────────┬──────┬───────────┐
> │ (index) │ File                        │ Statements │ Miss │ Coverage  │
> ├─────────┼─────────────────────────────┼────────────┼──────┼───────────┤
> │ 0       │ 'BackgroundActivity.jsx'    │ 2          │ 0    │ '100.00%' │
> │ 1       │ 'ExploreLocationNearby.jsx' │ 12         │ 1    │ '91.67%'  │
> │ 2       │ 'TopActivity.jsx'           │ 8          │ 0    │ '100.00%' │
> │ 3       │ 'WhyChooseAgoda.jsx'        │ 4          │ 0    │ '100.00%' │
> │ 4       │ 'index.jsx'                 │ 2          │ 0    │ '100.00%' │
> │ 5       │ 'Total'                     │ 28         │ 1    │ '96.43%'  │
> └─────────┴─────────────────────────────┴────────────┴──────┴───────────┘
> ```

> [!TIP]
> **Mục tiêu coverage tối thiểu:** Statements ≥ 70% | Branches ≥ 60% | Functions ≥ 80%

---

## 5. Quy tắc viết code test (comment tiếng Việt)

> [!IMPORTANT]
> Mỗi test file phải có comment tiếng Việt đầy đủ để có thể **giải thích khi bị vấn đáp**.

### Cấu trúc comment bắt buộc:

```jsx
// ============================================================
// TÊN FILE TEST: TopActivity.test.jsx
// MÔ TẢ: Kiểm tra component hiển thị danh sách hoạt động nổi bật
//         từ Redux store và dispatch action fetchActivity khi mount
// ============================================================

describe("TopActivity", () => {

  // --- Setup chung ---
  beforeEach(() => {
    // Xóa toàn bộ mock trước mỗi test để tránh ảnh hưởng chéo
    jest.clearAllMocks();
    // Thiết lập URL ảnh giả để tránh lỗi khi build URL hình ảnh
    process.env.REACT_APP_BE_URL = "https://cdn.example.test";
  });

  // TC ID: ACT-TC-005
  // MỤC TIÊU: Kiểm tra khi component mount, nó phải dispatch action
  //           fetchActivity với đúng tham số recommended=true để lấy
  //           danh sách hoạt động được đề xuất cho user
  it("requests the first page of recommended activities when mounted", () => {
    renderWithActivities([]);

    // Kiểm tra fetchActivity được gọi với query string đúng định dạng
    expect(fetchActivity).toHaveBeenCalledWith({
      query: "current=1&pageSize=10&recommended=true",
    });

    // Kiểm tra dispatch thực sự được gọi (không chỉ fetchActivity)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "activity/fetchActivity",
    });
  });

  // TC ID: ACT-TC-008
  // MỤC TIÊU: Phát hiện lỗ hổng robustness — khi activity thiếu avg_price,
  //           component sẽ throw thay vì hiện giá trị mặc định.
  //           Đây là INTENTIONAL FAIL để document behavior hiện tại.
  it("exposes a robustness gap when activity price is missing", () => {
    // Truyền vào activity không có trường avg_price
    // Expected: component throw (hành vi hiện tại chưa xử lý edge case)
    expect(() =>
      renderWithActivities([{ id: 99, name: "Activity thiếu giá", avg_star: 4, images: [] }])
    ).toThrow();
  });
});
```

> [!TIP]
> **Comment phải trả lời được 3 câu hỏi:**
> 1. *Test này kiểm tra cái gì?* (TC ID + Mục tiêu)
> 2. *Tại sao phải test cái này?* (Reason — từ góc nhìn user/business)
> 3. *Expected output là gì?* (Inline assertion comment)

---

## 6. Tổng hợp Coverage Plan

| Folder | Số Files | Số TC | Test File(s) | Trạng thái |
|--------|----------|-------|-------------|------------|
| Activity | 5 | 10 | BackgroundActivity, ExploreLocationNearby, TopActivity, WhyChooseAgoda, index | ✅ Đã có |
| ActivityCity | 1 | 7 | index.test.jsx | ✅ Đã có |
| ActivityDetail | 4 | 10 | BookingContactActivity, BookingContactActivityStep2, BookingContactActivityStep4, ReivewActivity | ✅ Đã có (9 Pass, 1 Fail documented) |
| BookingVehicles | 2 | 5 | index, BookingContactInfomation | ✅ Đã có (4 Pass, 1 Fail documented) |
| Cart | 8 | 8 | index, ActivityTabs | 🔲 Cần làm |
| Chatbot | 3 | 11 | Chatbot, ChatbotMessage, MessageChatbotInput | 🔲 Cần làm |
| City | 11 | 11 | BannerFooter, TopHotel, TopHotelChildren | 🔲 Cần làm |
| Favourite | 2 | 6 | index, FavouriteRoom | 🔲 Cần làm |
| Flight | 6 | 13 | FilterSideBar, FlightList, FlightSortFilter, SearchBarSection | 🔲 Cần làm |
| Flight1 | 6 | 4 | FilterSideBar, FlightList, FlightSortFilter, SearchBarSection | 🔲 Cần làm |
| Home | 7 | 10 | Destinations, RecommendedAccommodation, SaleOffAll, index | 🔲 Cần làm |
| HomeAndApartment | 14 | 9 | FilterSection, ReviewTabView, SearchBarSection | 🔲 Cần làm |
| Hotel | 25 | 12 | FilterSection, NavigationBar, ReviewTabView, SearchBarSection | 🔲 Cần làm |
| Profile | 25 | 11 | Chat, ServiceTabs | 🔲 Cần làm |
| Promotion | 6 | 13 | PromotionActivities, PromotionFlights, PromotionHotels | 🔲 Cần làm |
| Search | 3 | 8 | SearchBar, HotelList, HotelCard | ✅ Đã có |
| TravelGuide | 5 | 14 | TravelGuide, TravelGuideCity, TravelGuideCountry, TravelGuideDetail | 🔲 Cần làm |
| **TỔNG** | **136** | **~172** | | |
