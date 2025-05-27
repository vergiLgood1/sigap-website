import { $Enums, units } from '@prisma/client';

export interface IUnits {
  district_id: string;
  district_name: string;
  created_at: Date | null;
  updated_at: Date | null;
  name: string;
  description: string | null;
  type: $Enums.unit_type;
  address: string | null;
  latitude: number;
  longitude: number;
  land_area: number | null;
  code_unit: string;
  phone: string | null;
}

// export interface IUnits {
//     id: string;
//     name: string;
//     type: string;
//     address?: string | null;
//     latitude?: number | null;
//     longitude?: number | null;
//     district_id: string;
//     staff_count?: number | null;
//     phone?: string | null;
//     created_at?: Date;
//     updated_at?: Date;
//     districts?: {
//       name: string;
//     };
//   }
