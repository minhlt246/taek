-- Create table ket_qua_thi
CREATE TABLE IF NOT EXISTS ket_qua_thi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    test_id INT NULL COMMENT 'ID kỳ thi',
    ma_clb VARCHAR(20) NULL COMMENT 'Mã CLB',
    user_id INT NULL COMMENT 'ID võ sinh',
    ma_hoi_vien VARCHAR(50) NULL COMMENT 'Mã hội viên',
    cap_dai_du_thi_id INT NULL COMMENT 'Cấp đai dự thi',
    so_thi VARCHAR(20) NULL COMMENT 'Số thi',
    ho_va_ten VARCHAR(100) NULL COMMENT 'Họ và tên',
    gioi_tinh ENUM('Nam', 'Nữ') NULL COMMENT 'Giới tính',
    ngay_thang_nam_sinh DATE NULL COMMENT 'Ngày tháng năm sinh',
    ky_thuat_tan_can_ban DECIMAL(5,2) NULL COMMENT 'Kỹ thuật tấn căn bản',
    nguyen_tac_phat_luc DECIMAL(5,2) NULL COMMENT 'Nguyên tắc phát lực',
    can_ban_tay DECIMAL(5,2) NULL COMMENT 'Căn bản tay',
    ky_thuat_chan DECIMAL(5,2) NULL COMMENT 'Kỹ thuật chân',
    can_ban_tu_ve DECIMAL(5,2) NULL COMMENT 'Căn bản tự vệ',
    bai_quyen DECIMAL(5,2) NULL COMMENT 'Bài quyền',
    phan_the_bai_quyen DECIMAL(5,2) NULL COMMENT 'Phân thế bài quyền',
    song_dau DECIMAL(5,2) NULL COMMENT 'Song đấu',
    the_luc DECIMAL(5,2) NULL COMMENT 'Thể lực',
    ket_qua ENUM('Đạt', 'Không đạt', 'Chưa có kết quả') NULL DEFAULT 'Chưa có kết quả' COMMENT 'Kết quả',
    ghi_chu TEXT NULL COMMENT 'Ghi chú',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (test_id) REFERENCES ky_thi_thang_cap(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES vo_sinh(id) ON DELETE SET NULL,
    FOREIGN KEY (cap_dai_du_thi_id) REFERENCES cap_dai(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_test_id (test_id),
    INDEX idx_user_id (user_id),
    INDEX idx_ma_hoi_vien (ma_hoi_vien),
    INDEX idx_cap_dai_du_thi_id (cap_dai_du_thi_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng kết quả thi';

