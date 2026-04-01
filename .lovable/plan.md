

# Add Admin Roles for Gautam, Hiresh, and Rahul

## Found Users

| Name | Email | User ID |
|------|-------|---------|
| Gautam | g@g.in | `03c9f5e4-37d3-41cc-98e3-af3ec7949e9d` |
| Hiresh | hiresh@leveluplearning.in | `b1cbafbc-c4ff-4975-b3f7-88ea53991df5` |
| Rahul | irahul1997@gmail.com | `b23dfdf3-941e-471d-b4b4-4048dcb2ad4c` |

None of them currently have any roles assigned.

## Change

Insert 3 rows into `user_roles` table:

```sql
INSERT INTO user_roles (user_id, role) VALUES
  ('03c9f5e4-37d3-41cc-98e3-af3ec7949e9d', 'admin'),
  ('b1cbafbc-c4ff-4975-b3f7-88ea53991df5', 'admin'),
  ('b23dfdf3-941e-471d-b4b4-4048dcb2ad4c', 'admin');
```

No code or schema changes needed — just a data insert.

