# CRM7R API Documentation

## API Architecture

### Base URL

```
Production: https://api.crm7.com/v1
Development: http://localhost:4500/api/v1
```

## Authentication

All API endpoints require authentication using JWT tokens.

```http
Authorization: Bearer <token>
```

## API Endpoints

### Training & Development

#### Courses

```http
GET /courses
GET /courses/{id}
POST /courses
PUT /courses/{id}
DELETE /courses/{id}
```

#### Training Records

```http
GET /training-records
GET /training-records/{id}
POST /training-records
PUT /training-records/{id}
```

#### Certifications

```http
GET /certifications
POST /certifications
PUT /certifications/{id}
GET /certifications/verify/{code}
```

### Safety & Compliance

#### Incidents

```http
GET /incidents
POST /incidents
PUT /incidents/{id}
GET /incidents/reports
```

#### Compliance

```http
GET /compliance/requirements
GET /compliance/status
POST /compliance/audits
GET /compliance/documents
```

### Payroll & Benefits

#### Payroll

```http
GET /payroll/periods
POST /payroll/process
GET /payroll/history
GET /payroll/reports
```

#### Benefits

```http
GET /benefits
POST /benefits/enroll
PUT /benefits/update
GET /benefits/status
```

### HR Management

#### Employees

```http
GET /employees
GET /employees/{id}
POST /employees
PUT /employees/{id}
DELETE /employees/{id}
```

#### Recruitment

```http
GET /recruitment/positions
POST /recruitment/applications
GET /recruitment/candidates
PUT /recruitment/status
```

### Award Interpretation

#### Pay Rates

```http
GET /awards/{id}/rates
GET /awards/{id}/classifications
POST /awards/interpret
GET /awards/history
```

#### Templates

```http
GET /templates
POST /templates
PUT /templates/{id}
GET /templates/{id}/calculate
```

## Real-time Events (WebSocket)

### Event Types

```javascript
{
  "NOTIFICATION": "notification",
  "STATUS_UPDATE": "status_update",
  "ALERT": "alert"
}
```

### Subscription Topics

```javascript
{
  "USER_NOTIFICATIONS": "user:{userId}/notifications",
  "TEAM_UPDATES": "team:{teamId}/updates",
  "SYSTEM_ALERTS": "system/alerts"
}
```

## Data Models

### Employee

```typescript
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  hireDate: string;
  permissions: string[];
}
```

### Training Record

```typescript
interface TrainingRecord {
  id: string;
  employeeId: string;
  courseId: string;
  status: 'enrolled' | 'in_progress' | 'completed';
  startDate: string;
  completionDate?: string;
  score?: number;
  certificationId?: string;
}
```

### Incident Report

```typescript
interface IncidentReport {
  id: string;
  reporterId: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  dateTime: string;
  status: 'reported' | 'investigating' | 'resolved';
  resolution?: string;
}
```

## Rate Limiting

- 1000 requests per hour per API key
- 100 requests per minute per IP
- WebSocket connections limited to 60 per minute

## Error Responses

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  status: number;
  timestamp: string;
}
```

## Implementation Status

### Phase 1 (Complete)

- Basic CRUD operations ✅
- Authentication/Authorization ✅
- Rate limiting ✅
- Error handling ✅

### Phase 2 (In Progress)

- Real-time WebSocket events ⚠️
- File upload/download ✅
- Batch operations ⚠️
- Advanced filtering ✅

### Phase 3 (Planned)

- GraphQL integration
- Analytics endpoints
- Report generation
- Advanced search

### Phase 4 (Future)

- AI/ML endpoints
- Workflow automation
- Integration webhooks
- Custom metrics
