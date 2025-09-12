package com.weroster.Dto;

public class DeptRefDto {
    public Long deptId;
    public String name;
    public boolean isPrimary;

    public DeptRefDto() {}
    public DeptRefDto(Long id, String name, boolean isPrimary) {
        this.deptId = id; this.name = name; this.isPrimary = isPrimary;
    }
}
