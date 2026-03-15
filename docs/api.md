# Nawgati Insurance Dashboard — API Reference

Base URL: `http://localhost:3000`

All protected routes require the header:
```
Authorization: Bearer <accessToken>
```

---

## Auth

### POST `/users/signup`
No auth required.

**Request**
```bash
curl -X POST http://localhost:3000/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Raghav",
    "last_name": "Sharma",
    "email": "raghav@nawgati.com",
    "password": "secret123",
    "phone": "9876543210",
    "picture_url": "https://cdn.nawgati.com/avatars/raghav.jpg"
  }'
```

**Response `201`**
```json
{
  "user": {
    "id": 1,
    "first_name": "Raghav",
    "last_name": "Sharma",
    "email": "raghav@nawgati.com",
    "role": "agent",
    "phone": "9876543210",
    "picture_url": "https://cdn.nawgati.com/avatars/raghav.jpg",
    "created_at": "2026-03-13T10:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error responses**
```json
{ "type": "error", "message": "first_name is required" }          // 400
{ "type": "error", "message": "email already registered" }        // 409
```

---

### POST `/users/signin`
No auth required.

**Request**
```bash
curl -X POST http://localhost:3000/users/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "raghav@nawgati.com",
    "password": "secret123"
  }'
```

**Response `200`**
```json
{
  "user": {
    "id": 1,
    "first_name": "Raghav",
    "last_name": "Sharma",
    "email": "raghav@nawgati.com",
    "role": "agent",
    "phone": "9876543210",
    "picture_url": "https://cdn.nawgati.com/avatars/raghav.jpg"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error responses**
```json
{ "type": "error", "message": "invalid credentials" }    // 401
{ "type": "error", "message": "account blocked" }        // 403
```

---

### POST `/users/signout`
🔒 Auth required.

**Request**
```bash
curl -X POST http://localhost:3000/users/signout \
  -H "Authorization: Bearer <accessToken>"
```

**Response `200`**
```json
{ "success": true }
```

---

### POST `/refresh`
No auth required. Use the `refreshToken` from signin/signup to get a new `accessToken`.

**Request**
```bash
curl -X POST http://localhost:3000/refresh \
  -H "Content-Type: application/json" \
  -d '{ "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }'
```

**Response `200`**
```json
{ "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

**Error responses**
```json
{ "type": "error", "message": "Invalid refresh token" }    // 401
```

---

## Users

### GET `/users/:userId`
🔒 Auth required. Users can only fetch their own profile. Super users can fetch any.

**Request**
```bash
curl http://localhost:3000/users/1 \
  -H "Authorization: Bearer <accessToken>"
```

**Response `200`**
```json
{
  "id": 1,
  "first_name": "Raghav",
  "last_name": "Sharma",
  "email": "raghav@nawgati.com",
  "role": "agent",
  "phone": "9876543210",
  "picture_url": "https://cdn.nawgati.com/avatars/raghav.jpg",
  "is_super_user": false,
  "created_at": "2026-03-13T10:00:00.000Z"
}
```

**Error responses**
```json
{ "type": "error", "message": "forbidden" }         // 403
{ "type": "error", "message": "user not found" }    // 404
```

---

### PUT `/users/:userId`
🔒 Auth required. Users can only update their own profile. Super users can update any.

**Request**
```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Raghav",
    "last_name": "Kumar",
    "phone": "9123456789",
    "picture_url": "https://cdn.nawgati.com/avatars/new.jpg"
  }'
```

All fields are optional. Only send the ones you want to update.

**Response `200`**
```json
{
  "id": 1,
  "first_name": "Raghav",
  "last_name": "Kumar",
  "email": "raghav@nawgati.com",
  "role": "agent",
  "phone": "9123456789",
  "picture_url": "https://cdn.nawgati.com/avatars/new.jpg",
  "updated_at": "2026-03-13T11:00:00.000Z"
}
```

**Error responses**
```json
{ "type": "error", "message": "forbidden" }                    // 403
{ "type": "error", "message": "no valid fields to update" }    // 400
```

---

## Visits

Vehicle visits sourced from MongoDB. Phone and vehicle number are always obfuscated in these endpoints. Use `POST /leads/reveal` to see the real data.

### GET `/visits`
🔒 Auth required.

**Request**
```bash
curl "http://localhost:3000/visits?page=1&limit=20" \
  -H "Authorization: Bearer <accessToken>"
```

**Query params**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |

**Response `200`**
```json
{
  "visits": [
    {
      "id": "67d2a1b4c3e9f00012345678",
      "timestamp": "2026-03-11 08:14:22",
      "vehicleNumber": "XXXXXX5678",
      "isCommercial": false,
      "area": "67b1c2d3e4f5a60011223344",
      "insuranceExpiry": "2026-02-15",
      "phoneNumber": null,
      "isAssigned": false,
      "isAssignedToMe": false,
      "isClaimable": true
    },
    {
      "id": "67d2a1b4c3e9f00087654321",
      "timestamp": "2026-03-11 08:31:05",
      "vehicleNumber": "XXXXXX9012",
      "isCommercial": true,
      "area": "67b1c2d3e4f5a60011223344",
      "insuranceExpiry": "2025-11-30",
      "phoneNumber": null,
      "isAssigned": true,
      "isAssignedToMe": true,
      "isClaimable": true
    },
    {
      "id": "67d2a1b4c3e9f00011112222",
      "timestamp": "2026-03-11 09:02:47",
      "vehicleNumber": "XXXXXX3456",
      "isCommercial": false,
      "area": "67b1c2d3e4f5a60011223344",
      "insuranceExpiry": "2026-08-20",
      "phoneNumber": null,
      "isAssigned": true,
      "isAssignedToMe": false,
      "isClaimable": false
    }
  ],
  "total": 142,
  "page": 1,
  "limit": 20
}
```

**Assignment flag logic**

| `isAssigned` | `isAssignedToMe` | `isClaimable` | Meaning |
|---|---|---|---|
| `false` | `false` | `true` | Nobody has claimed this yet — show "View Details" |
| `true` | `true` | `true` | You claimed this — you can view it |
| `true` | `false` | `false` | Another agent claimed this — hide details, disable button |

---

### GET `/visits/:visitId`
🔒 Auth required.

**Request**
```bash
curl "http://localhost:3000/visits/67d2a1b4c3e9f00012345678" \
  -H "Authorization: Bearer <accessToken>"
```

**Response `200`**
```json
{
  "id": "67d2a1b4c3e9f00012345678",
  "timestamp": "2026-03-11 08:14:22",
  "vehicleNumber": "XXXXXX5678",
  "isCommercial": false,
  "area": "67b1c2d3e4f5a60011223344",
  "insuranceExpiry": "2026-02-15",
  "phoneNumber": null,
  "isAssigned": false,
  "isAssignedToMe": false,
  "isClaimable": true
}
```

**Error responses**
```json
{ "type": "error", "message": "visit not found" }    // 404
```

---

## Leads

Leads are created when an agent clicks "Show Details" on a visit. Once claimed, only that agent can see the real vehicle data.

### POST `/leads/reveal`
🔒 Auth required. The "Show Details" action. Creates a lead if none exists and assigns it to the calling user.

**Request**
```bash
curl -X POST http://localhost:3000/leads/reveal \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{ "visitId": "67d2a1b4c3e9f00012345678" }'
```

**Response `201`** (new lead created)
```json
{
  "id": 5,
  "visit_id": "67d2a1b4c3e9f00012345678",
  "vehicle_number": "DL01AB5678",
  "vehicle_phone": "9876543210",
  "assigned_to": 1,
  "status": "assigned",
  "partner_lead_id": null,
  "partner_notified_at": null,
  "converted_at": null,
  "created_at": "2026-03-13T10:30:00.000Z",
  "updated_at": "2026-03-13T10:30:00.000Z",
  "visit": {
    "id": "67d2a1b4c3e9f00012345678",
    "timestamp": "2026-03-11 08:14:22",
    "vehicleNumber": "DL01AB5678",
    "isCommercial": false,
    "area": "67b1c2d3e4f5a60011223344",
    "insuranceExpiry": "2026-02-15",
    "phoneNumber": null
  }
}
```

**Response `200`** (already your lead — returns existing)
Same shape as above.

**Error responses**
```json
{ "type": "error", "message": "visitId is required" }                          // 400
{ "type": "error", "message": "visit not found" }                              // 404
{ "type": "error", "message": "This lead is assigned to another agent" }       // 403
```

---

### GET `/leads`
🔒 Auth required. Returns all leads assigned to the logged-in user.

**Request**
```bash
curl "http://localhost:3000/leads?page=1&limit=20&status=assigned" \
  -H "Authorization: Bearer <accessToken>"
```

**Query params**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `status` | string | — | Filter by status: `assigned` \| `contacted` \| `converted` \| `lost` |

**Response `200`**
```json
{
  "leads": [
    {
      "id": 5,
      "visit_id": "67d2a1b4c3e9f00012345678",
      "vehicle_number": "DL01AB5678",
      "vehicle_phone": "9876543210",
      "assigned_to": 1,
      "status": "assigned",
      "partner_lead_id": "PRT-9921",
      "partner_notified_at": "2026-03-13T10:30:05.000Z",
      "converted_at": null,
      "created_at": "2026-03-13T10:30:00.000Z",
      "updated_at": "2026-03-13T10:30:00.000Z",
      "first_name": "Raghav",
      "last_name": "Sharma"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20
}
```

---

### GET `/leads/:id`
🔒 Auth required. Only the assigned agent (or super user) can fetch a lead.

**Request**
```bash
curl http://localhost:3000/leads/5 \
  -H "Authorization: Bearer <accessToken>"
```

**Response `200`**
```json
{
  "id": 5,
  "visit_id": "67d2a1b4c3e9f00012345678",
  "vehicle_number": "DL01AB5678",
  "vehicle_phone": "9876543210",
  "assigned_to": 1,
  "status": "assigned",
  "partner_lead_id": "PRT-9921",
  "partner_notified_at": "2026-03-13T10:30:05.000Z",
  "converted_at": null,
  "created_at": "2026-03-13T10:30:00.000Z",
  "updated_at": "2026-03-13T10:30:00.000Z",
  "visit": {
    "id": "67d2a1b4c3e9f00012345678",
    "timestamp": "2026-03-11 08:14:22",
    "vehicleNumber": "DL01AB5678",
    "isCommercial": false,
    "area": "67b1c2d3e4f5a60011223344",
    "insuranceExpiry": "2026-02-15",
    "phoneNumber": null
  }
}
```

**Error responses**
```json
{ "type": "error", "message": "lead not found" }    // 404
{ "type": "error", "message": "forbidden" }         // 403
```

---

### PUT `/leads/:id/status`
🔒 Auth required. Update the status of your own lead.

**Request**
```bash
curl -X PUT http://localhost:3000/leads/5/status \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "contacted",
    "note": "Called the owner, interested in renewal"
  }'
```

**Valid statuses:** `assigned` → `contacted` → `converted` | `lost`

| Field | Required | Description |
|-------|----------|-------------|
| `status` | ✅ | New status value |
| `note` | ❌ | Optional note logged in status history |

**Response `200`**
```json
{
  "id": 5,
  "visit_id": "67d2a1b4c3e9f00012345678",
  "vehicle_number": "DL01AB5678",
  "vehicle_phone": "9876543210",
  "assigned_to": 1,
  "status": "contacted",
  "partner_lead_id": "PRT-9921",
  "partner_notified_at": "2026-03-13T10:30:05.000Z",
  "converted_at": null,
  "created_at": "2026-03-13T10:30:00.000Z",
  "updated_at": "2026-03-13T10:35:00.000Z"
}
```

**Error responses**
```json
{ "type": "error", "message": "status is required" }                                        // 400
{ "type": "error", "message": "status must be one of: assigned, contacted, converted, lost" } // 400
{ "type": "error", "message": "lead not found" }                                            // 404
{ "type": "error", "message": "forbidden" }                                                 // 403
```

---

## Partner Webhook

### POST `/leads/partner-callback`
No auth required. Called by the partner when a lead is converted. Secured via `x-callback-secret` header.

**Request**
```bash
curl -X POST http://localhost:3000/leads/partner-callback \
  -H "Content-Type: application/json" \
  -H "x-callback-secret: <PARTNER_CALLBACK_SECRET>" \
  -d '{
    "partnerLeadId": "PRT-9921",
    "status": "converted"
  }'
```

**Response `200`**
```json
{
  "success": true,
  "lead": {
    "id": 5,
    "visit_id": "67d2a1b4c3e9f00012345678",
    "vehicle_number": "DL01AB5678",
    "vehicle_phone": "9876543210",
    "assigned_to": 1,
    "status": "converted",
    "partner_lead_id": "PRT-9921",
    "partner_notified_at": "2026-03-13T10:30:05.000Z",
    "converted_at": "2026-03-13T12:00:00.000Z",
    "created_at": "2026-03-13T10:30:00.000Z",
    "updated_at": "2026-03-13T12:00:00.000Z"
  }
}
```

**Error responses**
```json
{ "type": "error", "message": "invalid callback secret" }    // 401
{ "type": "error", "message": "partnerLeadId is required" }  // 400
{ "type": "error", "message": "lead not found" }             // 404
```

---

## Generic Error Shape

All errors follow this shape:

```json
{
  "type": "error",
  "message": "human readable message"
}
```

| HTTP Code | Meaning |
|-----------|---------|
| 400 | Bad request / missing required field |
| 401 | Not authenticated / token expired |
| 403 | Authenticated but not authorised |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email) |
| 500 | Internal server error |
