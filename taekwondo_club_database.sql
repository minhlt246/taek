-- =====================================================
-- TAEKWONDO CLUB MANAGEMENT SYSTEM - COMPLETE DATABASE
-- =====================================================

-- Drop existing tables if they exist (for fresh installation)
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- CORE TABLES (Original tables)
-- =====================================================

-- Tạo bảng câu lạc bộ (CLB)
CREATE TABLE clubs (
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
    FOREIGN KEY (head_coach_id) REFERENCES coaches(id)
);

-- Tạo bảng cấp đai
CREATE TABLE belt_levels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(20),
    order_sequence INT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng chi nhánh
CREATE TABLE branches (
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
    FOREIGN KEY (club_id) REFERENCES clubs(id)
);

-- Tạo bảng quản lý chi nhánh (1 thầy có thể quản lý nhiều chi nhánh)
CREATE TABLE branch_managers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT NOT NULL,
    manager_id INT NOT NULL,
    role ENUM('main_manager', 'assistant_manager') DEFAULT 'main_manager',
    is_active BOOLEAN DEFAULT TRUE,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (manager_id) REFERENCES coaches(id),
    UNIQUE KEY unique_branch_manager (branch_id, manager_id)
);

-- Tạo bảng trợ giảng chi nhánh (mỗi chi nhánh có nhiều trợ giảng)
CREATE TABLE branch_assistants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT NOT NULL,
    assistant_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (assistant_id) REFERENCES coaches(id),
    UNIQUE KEY unique_branch_assistant (branch_id, assistant_id)
);

-- Tạo bảng người dùng (học viên, admin)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student') DEFAULT 'student',
    student_code VARCHAR(20) UNIQUE,
    belt_level_id INT,
    club_id INT,
    branch_id INT,
    phone VARCHAR(15),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(15),
    active_status BOOLEAN DEFAULT TRUE,
    payment_status BOOLEAN DEFAULT FALSE,
    profile_image_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (belt_level_id) REFERENCES belt_levels(id),
    FOREIGN KEY (club_id) REFERENCES clubs(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- Tạo bảng huấn luyện viên (HLV)
CREATE TABLE coaches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    coach_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    photo_url VARCHAR(255),
    phone VARCHAR(15),
    email VARCHAR(100),
    password VARCHAR(255),
    role ENUM('head_coach', 'main_manager', 'assistant_manager', 'assistant') DEFAULT 'assistant',
    belt_level_id INT,
    experience_years INT,
    specialization VARCHAR(100),
    bio TEXT,
    club_id INT,
    branch_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (belt_level_id) REFERENCES belt_levels(id),
    FOREIGN KEY (club_id) REFERENCES clubs(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- Tạo bảng khóa học / lớp học
CREATE TABLE courses (
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
    FOREIGN KEY (coach_id) REFERENCES coaches(id),
    FOREIGN KEY (club_id) REFERENCES clubs(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- Tạo bảng đăng ký học viên vào lớp
CREATE TABLE enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    course_id INT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Tạo bảng lịch học
CREATE TABLE schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT,
    day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'),
    start_time TIME,
    end_time TIME,
    location VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Tạo bảng bài viết / tin tức
CREATE TABLE news (
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
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Tạo bảng liên hệ / phản hồi
CREATE TABLE contact_messages (
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
CREATE TABLE payments (
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
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- ADDITIONAL TABLES (Suggested tables)
-- =====================================================

-- Tạo bảng lịch sử thăng cấp đai
CREATE TABLE belt_promotions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    from_belt_id INT,
    to_belt_id INT,
    promotion_date DATE,
    coach_id INT,
    test_score DECIMAL(5,2),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (from_belt_id) REFERENCES belt_levels(id),
    FOREIGN KEY (to_belt_id) REFERENCES belt_levels(id),
    FOREIGN KEY (coach_id) REFERENCES coaches(id)
);

-- Tạo bảng điểm danh
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    course_id INT,
    attendance_date DATE,
    status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Tạo bảng đánh giá học viên
CREATE TABLE student_evaluations (
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
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (coach_id) REFERENCES coaches(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);


-- Tạo bảng sự kiện/giải đấu
CREATE TABLE events (
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
    FOREIGN KEY (club_id) REFERENCES clubs(id)
);


-- Tạo bảng thông báo
CREATE TABLE notifications (
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
    FOREIGN KEY (club_id) REFERENCES clubs(id)
);




-- Tạo bảng quản lý học phí và gói học
CREATE TABLE tuition_packages (
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
    FOREIGN KEY (club_id) REFERENCES clubs(id)
);

-- Tạo bảng chi tiết thanh toán
CREATE TABLE payment_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_id INT,
    tuition_package_id INT,
    amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'bank_transfer', 'card', 'other'),
    transaction_id VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    FOREIGN KEY (tuition_package_id) REFERENCES tuition_packages(id)
);

-- Tạo bảng lịch sử học tập
CREATE TABLE learning_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    course_id INT,
    lesson_date DATE,
    lesson_content TEXT,
    skills_learned TEXT,
    homework TEXT,
    coach_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Tạo bảng quản lý phụ huynh (cho học viên nhỏ tuổi)
CREATE TABLE parents (
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
CREATE TABLE student_parents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    parent_id INT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES parents(id)
);

-- Tạo bảng quản lý kỳ thi thăng cấp
CREATE TABLE belt_tests (
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
    FOREIGN KEY (club_id) REFERENCES clubs(id)
);

-- Tạo bảng đăng ký thi thăng cấp
CREATE TABLE test_registrations (
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
    FOREIGN KEY (test_id) REFERENCES belt_tests(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (current_belt_id) REFERENCES belt_levels(id),
    FOREIGN KEY (target_belt_id) REFERENCES belt_levels(id)
);

-- Tạo bảng quản lý chứng chỉ
CREATE TABLE certificates (
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
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (belt_level_id) REFERENCES belt_levels(id)
);


-- Tạo bảng quản lý feedback/đánh giá
CREATE TABLE feedbacks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    course_id INT,
    coach_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    feedback_type ENUM('course', 'coach', 'facility', 'general'),
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (coach_id) REFERENCES coaches(id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_club_id ON users(club_id);
CREATE INDEX idx_users_branch_id ON users(branch_id);
CREATE INDEX idx_users_belt_level_id ON users(belt_level_id);
CREATE INDEX idx_users_active_status ON users(active_status);

-- Indexes for branches table
CREATE INDEX idx_branches_club_id ON branches(club_id);
CREATE INDEX idx_branches_branch_code ON branches(branch_code);

-- Indexes for branch_managers table
CREATE INDEX idx_branch_managers_branch_id ON branch_managers(branch_id);
CREATE INDEX idx_branch_managers_manager_id ON branch_managers(manager_id);
CREATE INDEX idx_branch_managers_role ON branch_managers(role);

-- Indexes for branch_assistants table
CREATE INDEX idx_branch_assistants_branch_id ON branch_assistants(branch_id);
CREATE INDEX idx_branch_assistants_assistant_id ON branch_assistants(assistant_id);

-- Indexes for courses table
CREATE INDEX idx_courses_club_id ON courses(club_id);
CREATE INDEX idx_courses_branch_id ON courses(branch_id);
CREATE INDEX idx_courses_coach_id ON courses(coach_id);
CREATE INDEX idx_courses_start_date ON courses(start_date);
CREATE INDEX idx_courses_quarter ON courses(quarter);
CREATE INDEX idx_courses_year ON courses(year);
CREATE INDEX idx_courses_quarter_year ON courses(quarter, year);

-- Indexes for enrollments table
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);

-- Indexes for attendance table
CREATE INDEX idx_attendance_user_id ON attendance(user_id);
CREATE INDEX idx_attendance_course_id ON attendance(course_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);

-- Indexes for payments table
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_status ON payments(status);

-- Indexes for events table
CREATE INDEX idx_events_club_id ON events(club_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_status ON events(status);

-- Indexes for notifications table
CREATE INDEX idx_notifications_club_id ON notifications(club_id);
CREATE INDEX idx_notifications_published_at ON notifications(published_at);


-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample belt levels
INSERT INTO belt_levels (name, color, order_sequence, description) VALUES
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

-- Insert sample club (CLB Đồng Phú)
INSERT INTO clubs (club_code, name, address, phone, email, head_coach_id, description) VALUES
('DP001', 'CLB Đồng Phú', 'Đồng Phú, Bình Phước', '0123456789', 'dongphu@taekwondo.com', 2, 'CLB Taekwondo Đồng Phú - Thầy Tiến HLV trưởng');

-- Insert sample admin user
INSERT INTO users (name, email, password, role, club_id, phone, active_status) VALUES
('Admin Master', 'admin@taekwondomaster.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1, '0123456789', TRUE);

-- Insert sample HLV trưởng (Thầy Tiến)
INSERT INTO coaches (coach_code, name, email, password, role, belt_level_id, club_id, phone, is_active) VALUES
('HLV001', 'Thầy Tiến', 'thaytien@dongphu.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'head_coach', 12, 1, '0987654321', TRUE);

-- Insert sample quản lý chi nhánh (Thầy Tân)
INSERT INTO coaches (coach_code, name, email, password, role, belt_level_id, club_id, branch_id, phone, is_active) VALUES
('HLV002', 'Thầy Tân', 'thaytan@dongphu.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'main_manager', 10, 1, 1, '0987654322', TRUE);

-- Insert sample trợ giảng
INSERT INTO coaches (coach_code, name, email, password, role, belt_level_id, club_id, branch_id, phone, is_active) VALUES
('TG001', 'Thầy Minh', 'thayminh@dongphu.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'assistant', 8, 1, 1, '0987654323', TRUE),
('TG002', 'Cô Lan', 'colan@dongphu.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'assistant', 7, 1, 1, '0987654324', TRUE);

-- Update club head coach
UPDATE clubs SET head_coach_id = 1 WHERE id = 1;

-- Insert sample chi nhánh của CLB Đồng Phú
INSERT INTO branches (club_id, branch_code, name, address, phone, email) VALUES
(1, 'GXTN', 'CLB Giáo Xứ Tân Lập', 'Giáo Xứ Tân Lập, Đồng Phú', '0123456781', 'gxtn@dongphu.com'),
(1, 'THTN', 'CLB Tiểu Học Tân Lập', 'Trường Tiểu Học Tân Lập, Đồng Phú', '0123456782', 'thtn@dongphu.com'),
(1, 'THTT', 'CLB Tiểu Học Tân Tiến', 'Trường Tiểu Học Tân Tiến, Đồng Phú', '0123456783', 'thtt@dongphu.com'),
(1, 'THDP', 'CLB Tiểu Học Đồng Phú', 'Trường Tiểu Học Đồng Phú', '0123456784', 'thdp@dongphu.com'),
(1, 'THTP', 'CLB Tiểu Học Tân Phú', 'Trường Tiểu Học Tân Phú, Đồng Phú', '0123456785', 'thtp@dongphu.com'),
(1, 'THTD', 'CLB Tiểu Học Tân Định', 'Trường Tiểu Học Tân Định, Đồng Phú', '0123456786', 'thtd@dongphu.com');

-- Insert sample quản lý chi nhánh (Thầy Tân quản lý nhiều chi nhánh)
INSERT INTO branch_managers (branch_id, manager_id, role) VALUES
(1, 3, 'main_manager'),  -- Thầy Tân quản lý CLB Giáo Xứ Tân Lập
(2, 3, 'main_manager'),  -- Thầy Tân quản lý CLB Tiểu Học Tân Lập
(3, 3, 'main_manager');  -- Thầy Tân quản lý CLB Tiểu Học Tân Tiến

-- Insert sample trợ giảng cho chi nhánh
INSERT INTO branch_assistants (branch_id, assistant_id) VALUES
(1, 4), (1, 5),  -- CLB Giáo Xứ Tân Lập có 2 trợ giảng: Thầy Minh, Cô Lan
(2, 4), (2, 5),  -- CLB Tiểu Học Tân Lập có 2 trợ giảng: Thầy Minh, Cô Lan
(3, 4), (3, 5);  -- CLB Tiểu Học Tân Tiến có 2 trợ giảng: Thầy Minh, Cô Lan

-- Insert sample coach
INSERT INTO coaches (coach_code, name, phone, email, belt_level_id, experience_years, specialization, club_id) VALUES
('COACH001', 'Master Nguyen Van A', '0987654321', 'hlv@taekwondomaster.com', 9, 10, 'Sparring and Forms', 1);


SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- END OF DATABASE CREATION
-- =====================================================
