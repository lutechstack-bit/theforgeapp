

# Fix Payment Links for Sanjeev & Rajesh

## Confirmed Current State

| User | Current Link | Current Total | Current Balance |
|------|-------------|---------------|-----------------|
| Sanjeev (`69f82f8a-67ff-4bb7-b444-f5d2d3606f15`) | `T0kUgAOh` | 80,000 | 65,000 |
| Rajesh (`cf7a97f0-db03-4069-8761-17a2545f4838`) | `T0kUgAOh` | 85,000 | 70,000 |

## Updates

### 1. Sanjeev — fix link, total, and balance
```sql
UPDATE payment_config 
SET payment_link = 'https://rzp.io/rzp/lqegb1u',
    programme_total = 85000,
    balance_due = 70000
WHERE user_id = '69f82f8a-67ff-4bb7-b444-f5d2d3606f15';
```

### 2. Rajesh — fix link only
```sql
UPDATE payment_config 
SET payment_link = 'https://rzp.io/rzp/lqegb1u'
WHERE user_id = 'cf7a97f0-db03-4069-8761-17a2545f4838';
```

Both executed via the database insert tool. No schema or code changes.

