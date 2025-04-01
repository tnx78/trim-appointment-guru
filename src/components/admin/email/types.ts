
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface SalonSetting {
  id: string;
  name: string;
  value: string;
  created_at: string;
  updated_at: string;
}
