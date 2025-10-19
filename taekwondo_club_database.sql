-- =====================================================
-- TAEKWONDO CLUB MANAGEMENT SYSTEM - COMPLETE DATABASE
-- =====================================================

-- Drop existing tables if they exist (for fresh installation)
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- CORE TABLES (Original tables)
-- =====================================================

-- Tạo bảng câu lạc bộ (CLB)
CREATE TABLE cau_lac_bo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    club_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(100),
    head_coach_id INT,
    description TEXT,
    logo_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (head_coach_id) REFERENCES huan_luyen_vien(id)
);

-- Tạo bảng cấp đai
CREATE TABLE cap_dai (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(20),
    order_sequence INT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng chi nhánh
CREATE TABLE chi_nhanh (
    id INT PRIMARY KEY AUTO_INCREMENT,
    club_id INT NOT NULL,
    branch_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES cau_lac_bo(id)
);

-- Tạo bảng quản lý chi nhánh (1 thầy có thể quản lý nhiều chi nhánh)
CREATE TABLE quan_ly_chi_nhanh (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT NOT NULL,
    manager_id INT NOT NULL,
    role ENUM('main_manager', 'assistant_manager') DEFAULT 'main_manager',
    is_active BOOLEAN DEFAULT TRUE,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES chi_nhanh(id),
    FOREIGN KEY (manager_id) REFERENCES huan_luyen_vien(id),
    UNIQUE KEY unique_branch_manager (branch_id, manager_id)
);

-- Tạo bảng trợ giảng chi nhánh (mỗi chi nhánh có nhiều trợ giảng)
CREATE TABLE tro_giang_chi_nhanh (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT NOT NULL,
    assistant_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES chi_nhanh(id),
    FOREIGN KEY (assistant_id) REFERENCES huan_luyen_vien(id),
    UNIQUE KEY unique_branch_assistant (branch_id, assistant_id)
);

-- Tạo bảng võ sinh
CREATE TABLE vo_sinh (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ho_va_ten VARCHAR(100) NOT NULL COMMENT 'Họ và tên đầy đủ',
    ngay_thang_nam_sinh DATE NOT NULL COMMENT 'Ngày tháng năm sinh',
    ma_hoi_vien VARCHAR(50) UNIQUE NOT NULL COMMENT 'Mã hội viên',
    ma_clb VARCHAR(20) NOT NULL COMMENT 'Mã câu lạc bộ',
    ma_don_vi VARCHAR(20) NOT NULL COMMENT 'Mã đơn vị',
    quyen_so INT NOT NULL COMMENT 'Quyền số',
    cap_dai_id INT NOT NULL COMMENT 'Cấp đai hiện tại',
    gioi_tinh ENUM('Nam', 'Nữ') NOT NULL COMMENT 'Giới tính',
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(15),
    active_status BOOLEAN DEFAULT TRUE,
    profile_image_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cap_dai_id) REFERENCES cap_dai(id)
);

-- Tạo bảng admin (tách riêng khỏi võ sinh)
CREATE TABLE admin (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'super_admin') DEFAULT 'admin',
    phone VARCHAR(15),
    active_status BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng huấn luyện viên (HLV)
CREATE TABLE huan_luyen_vien (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ma_hoi_vien VARCHAR(50) UNIQUE NOT NULL COMMENT 'Mã hội viên HLV',
    ho_va_ten VARCHAR(100) NOT NULL COMMENT 'Họ và tên đầy đủ',
    ngay_thang_nam_sinh DATE NOT NULL COMMENT 'Ngày tháng năm sinh',
    ma_clb VARCHAR(20) NOT NULL COMMENT 'Mã câu lạc bộ',
    ma_don_vi VARCHAR(20) NOT NULL COMMENT 'Mã đơn vị',
    quyen_so INT NOT NULL COMMENT 'Quyền số',
    cap_dai_id INT NOT NULL COMMENT 'Cấp đai hiện tại',
    gioi_tinh ENUM('Nam', 'Nữ') NOT NULL COMMENT 'Giới tính',
    photo_url VARCHAR(255),
    phone VARCHAR(15),
    email VARCHAR(100),
    password VARCHAR(255),
    role ENUM('head_coach', 'main_manager', 'assistant_manager', 'assistant') DEFAULT 'assistant',
    experience_years INT,
    specialization VARCHAR(100),
    bio TEXT,
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(15),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cap_dai_id) REFERENCES cap_dai(id)
);

-- Tạo bảng khóa học / lớp học
CREATE TABLE khoa_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    level ENUM('beginner', 'intermediate', 'advanced'),
    quarter ENUM('Q1', 'Q2', 'Q3', 'Q4'),
    year INT,
    coach_id INT,
    club_id INT,
    branch_id INT,
    start_date DATE,
    end_date DATE,
    current_students INT DEFAULT 0,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (coach_id) REFERENCES huan_luyen_vien(id),
    FOREIGN KEY (club_id) REFERENCES cau_lac_bo(id),
    FOREIGN KEY (branch_id) REFERENCES chi_nhanh(id)
);

-- Tạo bảng đăng ký học viên vào lớp
CREATE TABLE dang_ky_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    course_id INT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES vo_sinh(id),
    FOREIGN KEY (course_id) REFERENCES khoa_hoc(id)
);

-- Tạo bảng lịch học
CREATE TABLE lich_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT,
    day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'),
    start_time TIME,
    end_time TIME,
    location VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES khoa_hoc(id)
);

-- Tạo bảng bài viết / tin tức
CREATE TABLE tin_tuc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    author_id INT,
    featured_image_url VARCHAR(255),
    is_published BOOLEAN DEFAULT FALSE,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES admin(id)
);

-- Tạo bảng liên hệ / phản hồi
CREATE TABLE tin_nhan_lien_he (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng thanh toán học phí
CREATE TABLE thanh_toan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE,
    month INT,
    year INT,
    status ENUM('paid', 'pending', 'late') DEFAULT 'paid',
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES nguoi_dung(id)
);

-- =====================================================
-- ADDITIONAL TABLES (Suggested tables)
-- =====================================================

-- Tạo bảng lịch sử thăng cấp đai
CREATE TABLE thang_cap_dai (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    from_belt_id INT,
    to_belt_id INT,
    promotion_date DATE,
    coach_id INT,
    test_score DECIMAL(5,2),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES vo_sinh(id),
    FOREIGN KEY (from_belt_id) REFERENCES cap_dai(id),
    FOREIGN KEY (to_belt_id) REFERENCES cap_dai(id),
    FOREIGN KEY (coach_id) REFERENCES huan_luyen_vien(id)
);

-- Tạo bảng điểm danh
CREATE TABLE diem_danh (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    course_id INT,
    attendance_date DATE,
    status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES vo_sinh(id),
    FOREIGN KEY (course_id) REFERENCES khoa_hoc(id)
);

-- Tạo bảng đánh giá học viên
CREATE TABLE danh_gia_hoc_vien (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    coach_id INT,
    course_id INT,
    evaluation_date DATE,
    technique_score DECIMAL(3,1),
    attitude_score DECIMAL(3,1),
    progress_score DECIMAL(3,1),
    overall_score DECIMAL(3,1),
    comments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES vo_sinh(id),
    FOREIGN KEY (coach_id) REFERENCES huan_luyen_vien(id),
    FOREIGN KEY (course_id) REFERENCES khoa_hoc(id)
);


-- Tạo bảng sự kiện/giải đấu
CREATE TABLE su_kien (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_type ENUM('tournament', 'seminar', 'graduation', 'social', 'other'),
    start_date DATETIME,
    end_date DATETIME,
    location VARCHAR(255),
    club_id INT,
    status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES cau_lac_bo(id)
);


-- Tạo bảng thông báo
CREATE TABLE thong_bao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    type ENUM('general', 'payment', 'event', 'course', 'promotion'),
    target_audience ENUM('all', 'students', 'coaches', 'admins', 'HLV'),
    club_id INT,
    is_urgent BOOLEAN DEFAULT FALSE,
    published_at DATETIME,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES cau_lac_bo(id)
);




-- Tạo bảng quản lý học phí và gói học
CREATE TABLE goi_hoc_phi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_months INT,
    classes_per_week INT,
    club_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES cau_lac_bo(id)
);

-- Tạo bảng chi tiết thanh toán
CREATE TABLE chi_tiet_thanh_toan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id INT,
    tuition_package_id INT,
    amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'bank_transfer', 'card', 'other'),
    transaction_id VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES thanh_toan(id),
    FOREIGN KEY (tuition_package_id) REFERENCES goi_hoc_phi(id)
);

-- Tạo bảng lịch sử học tập
CREATE TABLE tien_trinh_hoc_tap (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    course_id INT,
    lesson_date DATE,
    lesson_content TEXT,
    skills_learned TEXT,
    homework TEXT,
    coach_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES vo_sinh(id),
    FOREIGN KEY (course_id) REFERENCES khoa_hoc(id)
);

-- Tạo bảng quản lý phụ huynh (cho học viên nhỏ tuổi)
CREATE TABLE phu_huynh (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(15),
    relationship ENUM('father', 'mother', 'guardian', 'other'),
    address VARCHAR(255),
    emergency_contact BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng liên kết học viên - phụ huynh
CREATE TABLE hoc_vien_phu_huynh (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    parent_id INT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES phu_huynh(id)
);

-- Tạo bảng quản lý kỳ thi thăng cấp
CREATE TABLE ky_thi_thang_cap (
    id INT PRIMARY KEY AUTO_INCREMENT,
    test_name VARCHAR(100) NOT NULL,
    test_date DATE,
    location VARCHAR(255),
    examiner_id INT,
    club_id INT,
    max_participants INT,
    registration_deadline DATE,
    test_fee DECIMAL(10,2) DEFAULT 0,
    status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (examiner_id) REFERENCES coaches(id),
    FOREIGN KEY (club_id) REFERENCES cau_lac_bo(id)
);

-- Tạo bảng đăng ký thi thăng cấp
CREATE TABLE dang_ky_thi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    test_id INT,
    user_id INT,
    current_belt_id INT,
    target_belt_id INT,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_status ENUM('paid', 'pending') DEFAULT 'pending',
    test_result ENUM('pass', 'fail', 'pending') DEFAULT 'pending',
    score DECIMAL(5,2),
    examiner_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES ky_thi_thang_cap(id),
    FOREIGN KEY (user_id) REFERENCES vo_sinh(id),
    FOREIGN KEY (current_belt_id) REFERENCES cap_dai(id),
    FOREIGN KEY (target_belt_id) REFERENCES cap_dai(id)
);

-- Tạo bảng quản lý chứng chỉ
CREATE TABLE chung_chi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    belt_level_id INT,
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    issued_by VARCHAR(100),
    certificate_image_url VARCHAR(255),
    is_valid BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES vo_sinh(id),
    FOREIGN KEY (belt_level_id) REFERENCES cap_dai(id)
);


-- Tạo bảng quản lý feedback/đánh giá
CREATE TABLE danh_gia_phan_hoi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    course_id INT,
    coach_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    feedback_type ENUM('course', 'coach', 'facility', 'general'),
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES vo_sinh(id),
    FOREIGN KEY (course_id) REFERENCES khoa_hoc(id),
    FOREIGN KEY (coach_id) REFERENCES huan_luyen_vien(id)
);

-- =====================================================
-- FUNCTIONS FOR CODE GENERATION
-- =====================================================

-- Function to generate member code (mã hội viên)
DELIMITER //
CREATE FUNCTION generate_member_code(
    full_name VARCHAR(255),
    birth_date DATE,
    member_type VARCHAR(10) -- 'HV' for võ sinh, 'HLV' for huấn luyện viên
) RETURNS VARCHAR(100)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE last_name VARCHAR(100);
    DECLARE middle_names VARCHAR(255);
    DECLARE first_name VARCHAR(100);
    DECLARE name_parts TEXT;
    DECLARE name_count INT;
    DECLARE i INT DEFAULT 1;
    DECLARE result_code VARCHAR(100);
    DECLARE initials VARCHAR(10);
    
    -- Remove extra spaces and split name
    SET full_name = TRIM(REGEXP_REPLACE(full_name, '\\s+', ' '));
    SET name_parts = full_name;
    
    -- Count number of name parts
    SET name_count = (LENGTH(full_name) - LENGTH(REPLACE(full_name, ' ', '')) + 1);
    
    -- Extract last name (last part)
    SET last_name = SUBSTRING_INDEX(full_name, ' ', -1);
    SET last_name = LOWER(last_name);
    
    -- Extract middle names (all parts except first and last)
    SET middle_names = '';
    SET i = 1;
    WHILE i < name_count DO
        SET middle_names = CONCAT(middle_names, LOWER(LEFT(SUBSTRING_INDEX(SUBSTRING_INDEX(full_name, ' ', i + 1), ' ', -1), 1)));
        SET i = i + 1;
    END WHILE;
    
    -- Extract first name (first part)
    SET first_name = LOWER(LEFT(SUBSTRING_INDEX(full_name, ' ', 1), 1));
    
    -- Combine initials
    SET initials = CONCAT(first_name, middle_names);
    
    -- Generate final code: [PREFIX]_[last_name][initials]_[ddmmyy]
    SET result_code = CONCAT(
        member_type, '_',
        last_name, initials, '_',
        DATE_FORMAT(birth_date, '%d%m%y')
    );
    
    RETURN result_code;
END //
DELIMITER ;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for vo_sinh table
CREATE INDEX idx_vo_sinh_email ON vo_sinh(email);
CREATE INDEX idx_vo_sinh_ma_hoi_vien ON vo_sinh(ma_hoi_vien);
CREATE INDEX idx_vo_sinh_ma_clb ON vo_sinh(ma_clb);
CREATE INDEX idx_vo_sinh_cap_dai_id ON vo_sinh(cap_dai_id);
CREATE INDEX idx_vo_sinh_active_status ON vo_sinh(active_status);
CREATE INDEX idx_vo_sinh_gioi_tinh ON vo_sinh(gioi_tinh);

-- Indexes for admin table
CREATE INDEX idx_admin_email ON admin(email);
CREATE INDEX idx_admin_role ON admin(role);
CREATE INDEX idx_admin_active_status ON admin(active_status);

-- Indexes for huan_luyen_vien table
CREATE INDEX idx_hlv_ma_hoi_vien ON huan_luyen_vien(ma_hoi_vien);
CREATE INDEX idx_hlv_ma_clb ON huan_luyen_vien(ma_clb);
CREATE INDEX idx_hlv_cap_dai_id ON huan_luyen_vien(cap_dai_id);
CREATE INDEX idx_hlv_gioi_tinh ON huan_luyen_vien(gioi_tinh);
CREATE INDEX idx_hlv_role ON huan_luyen_vien(role);
CREATE INDEX idx_hlv_active_status ON huan_luyen_vien(is_active);

-- Indexes for chi_nhanh table
CREATE INDEX idx_chi_nhanh_club_id ON chi_nhanh(club_id);
CREATE INDEX idx_chi_nhanh_branch_code ON chi_nhanh(branch_code);

-- Indexes for quan_ly_chi_nhanh table
CREATE INDEX idx_quan_ly_chi_nhanh_branch_id ON quan_ly_chi_nhanh(branch_id);
CREATE INDEX idx_quan_ly_chi_nhanh_manager_id ON quan_ly_chi_nhanh(manager_id);
CREATE INDEX idx_quan_ly_chi_nhanh_role ON quan_ly_chi_nhanh(role);

-- Indexes for tro_giang_chi_nhanh table
CREATE INDEX idx_tro_giang_chi_nhanh_branch_id ON tro_giang_chi_nhanh(branch_id);
CREATE INDEX idx_tro_giang_chi_nhanh_assistant_id ON tro_giang_chi_nhanh(assistant_id);

-- Indexes for khoa_hoc table
CREATE INDEX idx_khoa_hoc_club_id ON khoa_hoc(club_id);
CREATE INDEX idx_khoa_hoc_branch_id ON khoa_hoc(branch_id);
CREATE INDEX idx_khoa_hoc_coach_id ON khoa_hoc(coach_id);
CREATE INDEX idx_khoa_hoc_start_date ON khoa_hoc(start_date);
CREATE INDEX idx_khoa_hoc_quarter ON khoa_hoc(quarter);
CREATE INDEX idx_khoa_hoc_year ON khoa_hoc(year);
CREATE INDEX idx_khoa_hoc_quarter_year ON khoa_hoc(quarter, year);

-- Indexes for dang_ky_hoc table
CREATE INDEX idx_dang_ky_hoc_user_id ON dang_ky_hoc(user_id);
CREATE INDEX idx_dang_ky_hoc_course_id ON dang_ky_hoc(course_id);
CREATE INDEX idx_dang_ky_hoc_status ON dang_ky_hoc(status);

-- Indexes for diem_danh table
CREATE INDEX idx_diem_danh_user_id ON diem_danh(user_id);
CREATE INDEX idx_diem_danh_course_id ON diem_danh(course_id);
CREATE INDEX idx_diem_danh_date ON diem_danh(attendance_date);

-- Indexes for thanh_toan table
CREATE INDEX idx_thanh_toan_user_id ON thanh_toan(user_id);
CREATE INDEX idx_thanh_toan_date ON thanh_toan(payment_date);
CREATE INDEX idx_thanh_toan_status ON thanh_toan(status);

-- Indexes for su_kien table
CREATE INDEX idx_su_kien_club_id ON su_kien(club_id);
CREATE INDEX idx_su_kien_start_date ON su_kien(start_date);
CREATE INDEX idx_su_kien_status ON su_kien(status);

-- Indexes for thong_bao table
CREATE INDEX idx_thong_bao_club_id ON thong_bao(club_id);
CREATE INDEX idx_thong_bao_published_at ON thong_bao(published_at);

-- =====================================================
-- POOMSAE (BÀI QUYỀN) TABLES
-- =====================================================

-- Bảng bài quyền (poomsae)
CREATE TABLE bai_quyen (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ten_bai_quyen_vietnamese VARCHAR(100) NOT NULL,
    ten_bai_quyen_english VARCHAR(100) NOT NULL,
    ten_bai_quyen_korean VARCHAR(100),
    cap_do VARCHAR(50) NOT NULL, -- 'Cơ bản', 'Trung cấp', 'Nâng cao'
    mo_ta TEXT,
    so_dong_tac INT,
    thoi_gian_thuc_hien INT, -- thời gian tính bằng giây
    khoi_luong_ly_thuyet TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng liên kết cấp đai với bài quyền bắt buộc
CREATE TABLE cap_dai_bai_quyen (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cap_dai_id INT NOT NULL,
    bai_quyen_id INT NOT NULL,
    loai_quyen ENUM('bat_buoc', 'tu_chon', 'bo_sung') DEFAULT 'bat_buoc',
    thu_tu_uu_tien INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cap_dai_id) REFERENCES cap_dai(id) ON DELETE CASCADE,
    FOREIGN KEY (bai_quyen_id) REFERENCES bai_quyen(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cap_dai_bai_quyen (cap_dai_id, bai_quyen_id)
);

-- Bảng lịch sử thi đấu bài quyền của võ sinh
CREATE TABLE lich_su_thi_quyen (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vo_sinh_id INT NOT NULL,
    bai_quyen_id INT NOT NULL,
    cap_dai_id INT NOT NULL,
    diem_so DECIMAL(5,2),
    ket_qua ENUM('dat', 'khong_dat', 'xuat_sac') DEFAULT 'khong_dat',
    ngay_thi DATE NOT NULL,
    ghi_chu TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vo_sinh_id) REFERENCES vo_sinh(id) ON DELETE CASCADE,
    FOREIGN KEY (bai_quyen_id) REFERENCES bai_quyen(id) ON DELETE CASCADE,
    FOREIGN KEY (cap_dai_id) REFERENCES cap_dai(id) ON DELETE CASCADE
);

-- Indexes for poomsae tables
CREATE INDEX idx_bai_quyen_cap_do ON bai_quyen(cap_do);
CREATE INDEX idx_cap_dai_bai_quyen_cap_dai ON cap_dai_bai_quyen(cap_dai_id);
CREATE INDEX idx_cap_dai_bai_quyen_bai_quyen ON cap_dai_bai_quyen(bai_quyen_id);
CREATE INDEX idx_lich_su_thi_quyen_vo_sinh ON lich_su_thi_quyen(vo_sinh_id);
CREATE INDEX idx_lich_su_thi_quyen_ngay_thi ON lich_su_thi_quyen(ngay_thi);


-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample belt levels
INSERT INTO cap_dai (name, color, order_sequence, description) VALUES
('Cấp 8', 'White', 1, 'Đai trắng cấp 8'),
('Cấp 7', 'Yellow', 2, 'Đai vàng cấp 7'),
('Cấp 6', 'Green', 3, 'Đai xanh lá cấp 6'),
('Cấp 5', 'Blue', 4, 'Đai xanh dương cấp 5'),
('Cấp 4', 'Red', 5, 'Đai đỏ cấp 4'),
('Cấp 3', 'Red', 6, 'Đai đỏ cấp 3'),
('Cấp 2', 'Red', 7, 'Đai đỏ cấp 2'),
('Cấp 1', 'Red', 8, 'Đai đỏ cấp 1'),
('Nhất đẳng (1 Dan)', 'Black', 9, 'Đai đen 1 đẳng'),
('Nhị đẳng (2 Dan)', 'Black', 10, 'Đai đen 2 đẳng'),
('Tam đẳng (3 Dan)', 'Black', 11, 'Đai đen 3 đẳng'),
('Tứ đẳng (4 Dan)', 'Black', 12, 'Đai đen 4 đẳng'),
('Ngũ đẳng (5 Dan)', 'Black', 13, 'Đai đen 5 đẳng'),
('Lục đẳng (6 Dan)', 'Black', 14, 'Đai đen 6 đẳng'),
('Thất đẳng (7 Dan)', 'Black', 15, 'Đai đen 7 đẳng'),
('Bát đẳng (8 Dan)', 'Black', 16, 'Đai đen 8 đẳng'),
('Cửu đẳng (9 Dan)', 'Black', 17, 'Đai đen 9 đẳng'),
('Thập đẳng (10 Dan)', 'Black', 18, 'Đai đen 10 đẳng');

-- Insert sample poomsae (bài quyền) theo chuẩn liên đoàn Taekwondo
INSERT INTO bai_quyen (ten_bai_quyen_vietnamese, ten_bai_quyen_english, ten_bai_quyen_korean, cap_do, mo_ta, so_dong_tac, thoi_gian_thuc_hien, khoi_luong_ly_thuyet) VALUES
-- Taeguek Poomsae (Thái cực) - Cơ bản
('Thái cực 1 Jang', 'Taeguek 1 Jang', '태극 1장', 'Cơ bản', 'Bài quyền cơ bản đầu tiên, tượng trưng cho Trời', 20, 45, 'Lý thuyết về tư thế cơ bản và kỹ thuật đấm đá'),
('Thái cực 2 Jang', 'Taeguek 2 Jang', '태극 2장', 'Cơ bản', 'Bài quyền cơ bản thứ hai, tượng trưng cho Đất', 20, 45, 'Lý thuyết về di chuyển và phòng thủ'),
('Thái cực 3 Jang', 'Taeguek 3 Jang', '태극 3장', 'Cơ bản', 'Bài quyền cơ bản thứ ba, tượng trưng cho Lửa', 20, 45, 'Lý thuyết về tấn công và phản công'),
('Thái cực 4 Jang', 'Taeguek 4 Jang', '태극 4장', 'Cơ bản', 'Bài quyền cơ bản thứ tư, tượng trưng cho Gió', 20, 45, 'Lý thuyết về tốc độ và linh hoạt'),
('Thái cực 5 Jang', 'Taeguek 5 Jang', '태극 5장', 'Cơ bản', 'Bài quyền cơ bản thứ năm, tượng trưng cho Nước', 20, 45, 'Lý thuyết về sự mềm mại và uyển chuyển'),
('Thái cực 6 Jang', 'Taeguek 6 Jang', '태극 6장', 'Cơ bản', 'Bài quyền cơ bản thứ sáu, tượng trưng cho Sơn', 20, 45, 'Lý thuyết về sự vững chắc và ổn định'),
('Thái cực 7 Jang', 'Taeguek 7 Jang', '태극 7장', 'Cơ bản', 'Bài quyền cơ bản thứ bảy, tượng trưng cho Lôi', 20, 45, 'Lý thuyết về sức mạnh và bùng nổ'),
('Thái cực 8 Jang', 'Taeguek 8 Jang', '태극 8장', 'Cơ bản', 'Bài quyền cơ bản thứ tám, tượng trưng cho Phong', 20, 45, 'Lý thuyết về sự nhẹ nhàng và bay bổng'),

-- Black Belt Poomsae (Đai đen)
('Koryo', 'Koryo', '고려', 'Trung cấp', 'Bài quyền đai đen đầu tiên, tên của triều đại Koryo', 30, 60, 'Lý thuyết về lịch sử và truyền thống'),
('Keumgang', 'Keumgang', '금강', 'Trung cấp', 'Bài quyền đai đen thứ hai, tên của ngọn núi Keumgang', 27, 55, 'Lý thuyết về sự kiên cường và bền bỉ'),
('Taebaek', 'Taebaek', '태백', 'Trung cấp', 'Bài quyền đai đen thứ ba, tên của ngọn núi Taebaek', 26, 50, 'Lý thuyết về sự cao quý và thanh khiết'),
('Pyongwon', 'Pyongwon', '평원', 'Trung cấp', 'Bài quyền đai đen thứ tư, tên của đồng bằng', 21, 45, 'Lý thuyết về sự rộng lớn và bao dung'),
('Sipjin', 'Sipjin', '십진', 'Nâng cao', 'Bài quyền đai đen thứ năm, tên của số 10', 28, 55, 'Lý thuyết về sự hoàn thiện và toàn diện'),
('Jitae', 'Jitae', '지태', 'Nâng cao', 'Bài quyền đai đen thứ sáu, tên của Trái Đất', 28, 55, 'Lý thuyết về sự ổn định và vững chắc'),
('Cheonkwon', 'Cheonkwon', '천권', 'Nâng cao', 'Bài quyền đai đen thứ bảy, tên của Bầu trời', 26, 50, 'Lý thuyết về sự cao xa và vô tận'),
('Hansoo', 'Hansoo', '한수', 'Nâng cao', 'Bài quyền đai đen thứ tám, tên của Nước', 27, 55, 'Lý thuyết về sự linh hoạt và thích ứng'),
('Ilyeo', 'Ilyeo', '일여', 'Nâng cao', 'Bài quyền đai đen thứ chín, tên của Sự thống nhất', 23, 45, 'Lý thuyết về sự hòa hợp và nhất thể');

-- Liên kết cấp đai với bài quyền bắt buộc theo chuẩn liên đoàn
INSERT INTO cap_dai_bai_quyen (cap_dai_id, bai_quyen_id, loai_quyen, thu_tu_uu_tien) VALUES
-- Cấp 8 → 7 (Trắng → Vàng): Thái cực 1
(1, 1, 'bat_buoc', 1),
-- Cấp 7 → 6 (Vàng → Xanh lá): Thái cực 2  
(2, 2, 'bat_buoc', 1),
-- Cấp 6 → 5 (Xanh lá → Xanh dương): Thái cực 3
(3, 3, 'bat_buoc', 1),
-- Cấp 5 → 4 (Xanh dương → Đỏ): Thái cực 4
(4, 4, 'bat_buoc', 1),
-- Cấp 4 → 3 (Đỏ cấp thấp): Thái cực 5
(5, 5, 'bat_buoc', 1),
-- Cấp 3 → 2 (Đỏ cấp cao): Thái cực 6
(6, 6, 'bat_buoc', 1),
-- Cấp 2 → 1 (Đỏ cao nhất): Thái cực 7
(7, 7, 'bat_buoc', 1),
-- Cấp 1 → 1 Dan (Đỏ → Đen): Thái cực 8
(8, 8, 'bat_buoc', 1),
-- 1 Dan → 2 Dan: Koryo
(9, 9, 'bat_buoc', 1),
-- 2 Dan → 3 Dan: Keumgang
(10, 10, 'bat_buoc', 1),
-- 3 Dan → 4 Dan: Taebaek
(11, 11, 'bat_buoc', 1),
-- 4 Dan → 5 Dan: Pyongwon
(12, 12, 'bat_buoc', 1),
-- 5 Dan → 6 Dan: Sipjin
(13, 13, 'bat_buoc', 1),
-- 6 Dan → 7 Dan: Jitae
(14, 14, 'bat_buoc', 1),
-- 7 Dan → 8 Dan: Cheonkwon
(15, 15, 'bat_buoc', 1),
-- 8 Dan → 9 Dan: Hansoo
(16, 16, 'bat_buoc', 1),
-- 9 Dan → 10 Dan: Ilyeo
(17, 17, 'bat_buoc', 1);

-- Insert sample club (CLB Đồng Phú)
INSERT INTO cau_lac_bo (club_code, name, address, phone, email, head_coach_id, description) VALUES
('_00468', 'CLB Đồng Phú', 'Đồng Phú, Bình Phước', '0123456789', 'dongphu@taekwondo.com', 2, 'CLB Taekwondo Đồng Phú - Thầy Tiến HLV trưởng');

-- Insert sample admin user
INSERT INTO admin (name, email, password, role, phone, active_status) VALUES
('Admin Master', 'admin@taekwondomaster.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '0123456789', TRUE);

-- Insert sample võ sinh data with generated member codes
INSERT INTO vo_sinh (ho_va_ten, ngay_thang_nam_sinh, ma_hoi_vien, ma_clb, ma_don_vi, quyen_so, cap_dai_id, gioi_tinh, email, phone) VALUES
('Hoàng Phạm Bảo Anh', '2016-02-28', generate_member_code('Hoàng Phạm Bảo Anh', '2016-02-28', 'HV'), 'CLB_00468', 'DNAI', 7, 1, 'Nữ', 'anhhpb@example.com', '0123456789'),
('Nguyễn Thị Minh Châu', '2015-07-03', generate_member_code('Nguyễn Thị Minh Châu', '2015-07-03', 'HV'), 'CLB_00468', 'DNAI', 7, 1, 'Nữ', 'chauntm@example.com', '0123456790'),
('Lục Minh Châu', '2010-05-10', generate_member_code('Lục Minh Châu', '2010-05-10', 'HV'), 'CLB_00468', 'DNAI', 7, 1, 'Nữ', 'chaulm@example.com', '0123456791'),
('Nguyễn Minh Châu', '2014-08-15', generate_member_code('Nguyễn Minh Châu', '2014-08-15', 'HV'), 'CLB_00468', 'DNAI', 7, 1, 'Nữ', 'chaunm@example.com', '0123456792'),
('Phạm Minh Châu', '2011-12-20', generate_member_code('Phạm Minh Châu', '2011-12-20', 'HV'), 'CLB_00468', 'DNAI', 7, 1, 'Nữ', 'chauphm@example.com', '0123456793'),
('Đoàn Trần Thiên Phương', '2012-06-25', generate_member_code('Đoàn Trần Thiên Phương', '2012-06-25', 'HV'), 'CLB_00468', 'DNAI', 7, 1, 'Nữ', 'phuongdtt@example.com', '0123456794');

-- Insert sample HLV data with generated member codes
INSERT INTO huan_luyen_vien (ma_hoi_vien, ho_va_ten, ngay_thang_nam_sinh, ma_clb, ma_don_vi, quyen_so, cap_dai_id, gioi_tinh, email, password, role, phone, is_active) VALUES
(generate_member_code('Nguyễn Văn Tiến', '1985-03-15', 'HLV'), 'Nguyễn Văn Tiến', '1985-03-15', 'CLB_00468', 'DNAI', 9, 12, 'Nam', 'thaytien@dongphu.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'head_coach', '0987654321', TRUE),
(generate_member_code('Trần Thị Hương', '1990-07-22', 'HLV'), 'Trần Thị Hương', '1990-07-22', 'CLB_00468', 'DNAI', 8, 10, 'Nữ', 'huongtt@dongphu.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'assistant_manager', '0987654322', TRUE),
(generate_member_code('Lê Minh Đức', '1988-12-10', 'HLV'), 'Lê Minh Đức', '1988-12-10', 'CLB_00468', 'DNAI', 7, 8, 'Nam', 'duclm@dongphu.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'assistant', '0987654323', TRUE);

-- Insert sample trợ giảng (Thầy Tân)
INSERT INTO huan_luyen_vien (ma_hoi_vien, ho_va_ten, ngay_thang_nam_sinh, ma_clb, ma_don_vi, quyen_so, cap_dai_id, gioi_tinh, email, password, role, phone, is_active) VALUES
(generate_member_code('Phạm Văn Tân', '1987-05-18', 'HLV'), 'Phạm Văn Tân', '1987-05-18', 'CLB_00468', 'DNAI', 8, 10, 'Nam', 'thaytan@dongphu.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'assistant', '0987654324', TRUE);

-- Insert sample lịch sử thi quyền cho võ sinh
INSERT INTO lich_su_thi_quyen (vo_sinh_id, bai_quyen_id, cap_dai_id, diem_so, ket_qua, ngay_thi, ghi_chu) VALUES
-- Võ sinh 1 (Hoàng Phạm Bảo Anh) - Cấp 8, đã thi Thái cực 1 để lên cấp 7
(1, 1, 1, 8.5, 'dat', '2024-01-15', 'Thi đạt bài Thái cực 1, chuẩn bị lên cấp 7'),
-- Võ sinh 2 (Nguyễn Thị Minh Châu) - Cấp 8, đã thi Thái cực 1 để lên cấp 7
(2, 1, 1, 9.0, 'xuat_sac', '2024-01-20', 'Thi xuất sắc bài Thái cực 1, sẵn sàng lên cấp 7'),
-- Võ sinh 3 (Lục Minh Châu) - Cấp 8, đã thi Thái cực 1 để lên cấp 7
(3, 1, 1, 8.0, 'dat', '2024-02-10', 'Thi đạt bài Thái cực 1, chuẩn bị lên cấp 7'),
-- Võ sinh 4 (Nguyễn Minh Châu) - Cấp 8, đã thi Thái cực 1 để lên cấp 7
(4, 1, 1, 8.8, 'dat', '2024-02-15', 'Thi đạt bài Thái cực 1, chuẩn bị lên cấp 7'),
-- Võ sinh 5 (Phạm Minh Châu) - Cấp 8, đã thi Thái cực 1 để lên cấp 7
(5, 1, 1, 7.5, 'dat', '2024-03-01', 'Thi đạt bài Thái cực 1, chuẩn bị lên cấp 7'),
-- Võ sinh 6 (Đoàn Trần Thiên Phương) - Cấp 8, đã thi Thái cực 1 để lên cấp 7
(6, 1, 1, 9.2, 'xuat_sac', '2024-03-05', 'Thi xuất sắc bài Thái cực 1, sẵn sàng lên cấp 7');

-- Insert sample trợ giảng khác
INSERT INTO huan_luyen_vien (ma_hoi_vien, ho_va_ten, ngay_thang_nam_sinh, ma_clb, ma_don_vi, quyen_so, cap_dai_id, gioi_tinh, email, password, role, phone, is_active) VALUES
(generate_member_code('Nguyễn Văn Minh', '1989-09-12', 'HLV'), 'Nguyễn Văn Minh', '1989-09-12', 'CLB_00468', 'DNAI', 7, 8, 'Nam', 'thayminh@dongphu.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'assistant', '0987654325', TRUE),
(generate_member_code('Lê Thị Lan', '1992-11-08', 'HLV'), 'Lê Thị Lan', '1992-11-08', 'CLB_00468', 'DNAI', 6, 7, 'Nữ', 'colan@dongphu.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'assistant', '0987654326', TRUE);

-- =====================================================
-- SAMPLE QUERIES FOR TESTING
-- =====================================================

-- Query 1: Lấy thông tin võ sinh với cấp đai và bài quyền bắt buộc
-- SELECT 
--     vs.ho_va_ten,
--     vs.ma_hoi_vien,
--     cd.name as cap_dai,
--     cd.color as mau_dai,
--     bq.ten_bai_quyen_vietnamese as bai_quyen_bat_buoc,
--     bq.ten_bai_quyen_english as bai_quyen_english,
--     bq.so_dong_tac,
--     bq.thoi_gian_thuc_hien
-- FROM vo_sinh vs
-- JOIN cap_dai cd ON vs.cap_dai_id = cd.id
-- JOIN cap_dai_bai_quyen cdbq ON cd.id = cdbq.cap_dai_id
-- JOIN bai_quyen bq ON cdbq.bai_quyen_id = bq.id
-- WHERE cdbq.loai_quyen = 'bat_buoc'
-- ORDER BY vs.ho_va_ten;

-- Query 2: Lấy lịch sử thi quyền của võ sinh
-- SELECT 
--     vs.ho_va_ten,
--     vs.ma_hoi_vien,
--     bq.ten_bai_quyen_vietnamese,
--     lstq.diem_so,
--     lstq.ket_qua,
--     lstq.ngay_thi,
--     lstq.ghi_chu
-- FROM lich_su_thi_quyen lstq
-- JOIN vo_sinh vs ON lstq.vo_sinh_id = vs.id
-- JOIN bai_quyen bq ON lstq.bai_quyen_id = bq.id
-- ORDER BY vs.ho_va_ten, lstq.ngay_thi DESC;

-- Query 3: Thống kê kết quả thi quyền theo cấp đai
-- SELECT 
--     cd.name as cap_dai,
--     cd.color as mau_dai,
--     bq.ten_bai_quyen_vietnamese as bai_quyen,
--     COUNT(*) as so_lan_thi,
--     AVG(lstq.diem_so) as diem_trung_binh,
--     SUM(CASE WHEN lstq.ket_qua = 'dat' THEN 1 ELSE 0 END) as so_lan_dat,
--     SUM(CASE WHEN lstq.ket_qua = 'xuat_sac' THEN 1 ELSE 0 END) as so_lan_xuat_sac
-- FROM lich_su_thi_quyen lstq
-- JOIN cap_dai cd ON lstq.cap_dai_id = cd.id
-- JOIN bai_quyen bq ON lstq.bai_quyen_id = bq.id
-- GROUP BY cd.id, bq.id
-- ORDER BY cd.order_sequence, bq.ten_bai_quyen_vietnamese;

-- Update club head coach
UPDATE cau_lac_bo SET head_coach_id = 1 WHERE id = 1;

-- Insert sample chi nhánh của CLB Đồng Phú
INSERT INTO chi_nhanh (club_id, branch_code, name, address, phone, email) VALUES
(1, 'GXTN', 'CLB Giáo Xứ Tân Lập', 'Giáo Xứ Tân Lập, Đồng Phú', '0123456781', 'gxtn@dongphu.com'),
(1, 'THTN', 'CLB Tiểu Học Tân Lập', 'Trường Tiểu Học Tân Lập, Đồng Phú', '0123456782', 'thtn@dongphu.com'),
(1, 'THTT', 'CLB Tiểu Học Tân Tiến', 'Trường Tiểu Học Tân Tiến, Đồng Phú', '0123456783', 'thtt@dongphu.com'),
(1, 'THDP', 'CLB Tiểu Học Đồng Phú', 'Trường Tiểu Học Đồng Phú', '0123456784', 'thdp@dongphu.com'),
(1, 'THTP', 'CLB Tiểu Học Tân Phú', 'Trường Tiểu Học Tân Phú, Đồng Phú', '0123456785', 'thtp@dongphu.com'),
(1, 'THTD', 'CLB Tiểu Học Tân Định', 'Trường Tiểu Học Tân Định, Đồng Phú', '0123456786', 'thtd@dongphu.com');

-- Insert sample quản lý chi nhánh (Thầy Tân quản lý nhiều chi nhánh)
INSERT INTO quan_ly_chi_nhanh (branch_id, manager_id, role) VALUES
(1, 3, 'main_manager'),  -- Thầy Tân quản lý CLB Giáo Xứ Tân Lập
(2, 3, 'main_manager'),  -- Thầy Tân quản lý CLB Tiểu Học Tân Lập
(3, 3, 'main_manager');  -- Thầy Tân quản lý CLB Tiểu Học Tân Tiến

-- Insert sample trợ giảng cho chi nhánh
INSERT INTO tro_giang_chi_nhanh (branch_id, assistant_id) VALUES
(1, 4), (1, 5),  -- CLB Giáo Xứ Tân Lập có 2 trợ giảng: Thầy Minh, Cô Lan
(2, 4), (2, 5),  -- CLB Tiểu Học Tân Lập có 2 trợ giảng: Thầy Minh, Cô Lan
(3, 4), (3, 5);  -- CLB Tiểu Học Tân Tiến có 2 trợ giảng: Thầy Minh, Cô Lan

-- Insert sample coach (using existing structure)
INSERT INTO huan_luyen_vien (ma_hoi_vien, ho_va_ten, ngay_thang_nam_sinh, ma_clb, ma_don_vi, quyen_so, cap_dai_id, gioi_tinh, email, password, role, phone, is_active) VALUES
(generate_member_code('Master Nguyen Van A', '1980-01-01', 'HLV'), 'Master Nguyen Van A', '1980-01-01', 'CLB_00468', 'DNAI', 9, 9, 'Nam', 'hlv@taekwondomaster.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'head_coach', '0987654321', TRUE);


SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- END OF DATABASE CREATION
-- =====================================================
