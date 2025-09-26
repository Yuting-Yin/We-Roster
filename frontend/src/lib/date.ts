export const fmt = (d: Date, opt: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", opt).format(d);

export const dayKey = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const hoursBetween = (s: string, e: string) => {
  const [sh, sm] = s.split(":").map(Number);
  const [eh, em] = e.split(":").map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  
  // Handle overnight shifts (e.g., 16:00-00:00)
  const duration = endMinutes < startMinutes ? (24*60 - startMinutes + endMinutes) : (endMinutes - startMinutes);
  return duration / 60;
};
