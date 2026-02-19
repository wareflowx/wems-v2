import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { timestamps } from './columns.helpers';
import { positions } from './positions';
import { workLocations } from './work-locations';

export const employees = sqliteTable('employees', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // Personal info
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),

  // Employment references (FK)
  positionId: integer('position_id').references(() => positions.id, { onDelete: 'set null' }),
  workLocationId: integer('work_location_id').references(() => workLocations.id, { onDelete: 'set null' }),

  // Department
  department: text('department'),   // "Production", "RH", etc.

  // Status & dates
  status: text('status').notNull().default('active'), // 'active' | 'on_leave' | 'terminated'
  hireDate: text('hire_date').notNull(),
  terminationDate: text('termination_date'),

  // Reusable timestamp columns
  ...timestamps,
});

// Type inference
export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
