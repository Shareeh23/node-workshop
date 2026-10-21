export type ReminderStatus =
  | "pending"
  | "scheduled"
  | "triggered"
  | "failed"
  | "cancelled";

export type Reminder = {
  id: string;
  title: string;
  scheduledAt: string;
  status: ReminderStatus;
};

export type Reminders = Reminder[];
