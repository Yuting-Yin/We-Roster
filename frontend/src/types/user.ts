// src/types/user.ts
export type User = {
  id: string;
  email: string;
  staffId?: number;  // Staff ID for matching with team members

  // 常见姓名字段
  firstName?: string;
  lastName?: string;
  name?: string;         // full name
  given_name?: string;   // OIDC / Google style
  family_name?: string;  // OIDC / Google style

  avatarUrl?: string;

  // 你项目需要的业务字段（可能由后端不同命名返回）
  designation?: string;      // 职称 / 岗位
  title?: string;            // 有些后端用 title 表示职称
  accreditation?: string;    // 资质名称
  accreditationName?: string;

  // 联系方式（兼容多命名）
  phone?: string;
  mobile?: string;
  phoneNumber?: string;

  // iCal 订阅地址（兼容多命名）
  ical?: string;
  icalUrl?: string;
  calendarIcsUrl?: string;

  // 其他可能的扩展字段 …
  [k: string]: any;
};
