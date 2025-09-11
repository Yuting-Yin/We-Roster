// TeamMemberDto.java
package main.com.weroster.Dto;

import java.time.OffsetDateTime;
import java.util.List;

public class TeamMemberDto {
    public Long id;
    public String firstName;
    public String lastName;
    public String email;
    public String phone;
    public boolean isManager;
    public String status;
    public String designationName;
    public String designationCode;
    public String designationMatrix;
    public List<DeptRefDto> departments;
    public ShiftPreviewDto nextShift;

    public TeamMemberDto() {}
}
