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
    
    description TEXT,
    logo_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

-- Tạo bảng người dùng (học viên, admin)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student', 'HLV') DEFAULT 'student',
    student_code VARCHAR(20) UNIQUE,
    belt_level_id INT,
    club_id INT,
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
    FOREIGN KEY (club_id) REFERENCES clubs(id)
);

-- Tạo bảng huấn luyện viên (HLV)
CREATE TABLE coaches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    coach_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    photo_url VARCHAR(255),
    phone VARCHAR(15),
    email VARCHAR(100),
    belt_level_id INT,
    experience_years INT,
    specialization VARCHAR(100),
    bio TEXT,
    club_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (belt_level_id) REFERENCES belt_levels(id),
    FOREIGN KEY (club_id) REFERENCES clubs(id)
);

-- Tạo bảng khóa học / lớp học
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    level ENUM('beginner', 'intermediate', 'advanced'),
    coach_id INT,
    club_id INT,
    start_date DATE,
    end_date DATE,
    max_students INT DEFAULT 20,
    current_students INT DEFAULT 0,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (coach_id) REFERENCES coaches(id),
    FOREIGN KEY (club_id) REFERENCES clubs(id)
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
    registration_fee DECIMAL(10,2) DEFAULT 0,
    max_participants INT,
    current_participants INT DEFAULT 0,
    status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id)
);

-- Tạo bảng đăng ký sự kiện
CREATE TABLE event_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT,
    user_id INT,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    payment_status ENUM('paid', 'pending', 'free') DEFAULT 'pending',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
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



-- Tạo bảng lịch sử hoạt động (Audit Log)
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
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
CREATE INDEX idx_users_belt_level_id ON users(belt_level_id);
CREATE INDEX idx_users_active_status ON users(active_status);

-- Indexes for courses table
CREATE INDEX idx_courses_club_id ON courses(club_id);
CREATE INDEX idx_courses_coach_id ON courses(coach_id);
CREATE INDEX idx_courses_start_date ON courses(start_date);

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

-- Indexes for audit_logs table
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample belt levels
INSERT INTO belt_levels (name, color, order_sequence, description) VALUES
('White Belt', 'White', 1, 'Beginner level - 10th Gup'),
('Yellow Belt', 'Yellow', 2, 'Beginner level - 9th Gup'),
('Orange Belt', 'Orange', 3, 'Beginner level - 8th Gup'),
('Green Belt', 'Green', 4, 'Intermediate level - 7th Gup'),
('Blue Belt', 'Blue', 5, 'Intermediate level - 6th Gup'),
('Brown Belt', 'Brown', 6, 'Intermediate level - 5th Gup'),
('Red Belt', 'Red', 7, 'Advanced level - 4th Gup'),
('Red-Black Belt', 'Red-Black', 8, 'Advanced level - 3rd Gup'),
('Black Belt 1st Dan', 'Black', 9, 'Master level - 1st Dan'),
('Black Belt 2nd Dan', 'Black', 10, 'Master level - 2nd Dan');

-- Insert sample club
INSERT INTO clubs (club_code, name, address, phone, email, description) VALUES
('TK001', 'Taekwondo Master Club', '123 Main Street, District 1, Ho Chi Minh City', '0123456789', 'info@taekwondomaster.com', 'Professional Taekwondo training center');

-- Insert sample admin user
INSERT INTO users (name, email, password, role, club_id, phone, active_status) VALUES
('Admin Master', 'admin@taekwondomaster.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1, '0123456789', TRUE);

-- Insert sample HLV user
INSERT INTO users (name, email, password, role, student_code, belt_level_id, club_id, phone, active_status) VALUES
('Master Nguyen Van A', 'hlv@taekwondomaster.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HLV', 'HLV001', 9, 1, '0987654321', TRUE);

-- Insert sample coach
INSERT INTO coaches (coach_code, name, phone, email, belt_level_id, experience_years, specialization, club_id) VALUES
('COACH001', 'Master Nguyen Van A', '0987654321', 'hlv@taekwondomaster.com', 9, 10, 'Sparring and Forms', 1);


SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- END OF DATABASE CREATION
-- =====================================================
