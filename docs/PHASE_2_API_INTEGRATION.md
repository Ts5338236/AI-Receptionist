# PHASE 2: API INTEGRATION & SERVICE CONTRACTS
## AI Receptionist Enterprise Frontend-Backend Contracts

**Base URL:** `http://localhost:8000/api/v1` (Configured via `NEXT_PUBLIC_API_BASE_URL`)  
**Transport Protocol:** HTTPS / TLS 1.3  
**Format:** JSON / RFC 7807 Problem Details  

---

## 1. Central API Client (`src/services/api-client.ts`)

Every service utilizes a centralized `apiClient` wrapper providing:
1. **RFC 7807 Error Handling:** Automatically deserializes backend error responses conforming to the RFC 7807 Problem Details standard:
   ```json
   {
     "type": "https://api.horizon.tech/errors/validation-error",
     "title": "Validation Error",
     "status": 422,
     "detail": "Invalid mobile phone number format",
     "correlation_id": "c1f72a4e-399a-41d3-9bc7-60fcf4b4231b"
   }
   ```
2. **Correlation ID Tracking:** Injects a unique `X-Correlation-ID` header into every outbound request, matching FastAPI's structured logging middleware.
3. **Configurable Request Timeouts:** Implements `AbortController` with a default 15,000ms threshold to prevent physical kiosk UI hangs.

---

## 2. Service Inventory & Contract Status

| Service | Methods | Backend Endpoint | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **`authService`** | `login` | `POST /auth/login` | **LIVE (Phase 1)** | JWT Access & Refresh Token issue. |
| | `refreshToken` | `POST /auth/refresh` | **LIVE (Phase 1)** | Refresh token rotation. |
| | `getMe` | `GET /auth/me` | **LIVE (Phase 1)** | Fetches current user profile. |
| | `logout` | `POST /auth/logout` | **LIVE (Phase 1)** | Revokes tokens. |
| **`visitorService`** | `checkIn` | `POST /visitors/check-in` | **PROTOTYPE HOOK** | Stored in PostgreSQL `visitors` table in Phase 1; thermal badge printing integration scheduled for Phase 3/4. |
| **`appointmentService`** | `searchAppointment` | `POST /appointments/search` | **PROTOTYPE HOOK** | Pre-seeded with realistic reception bookings. |
| | `checkInAppointment`| `POST /appointments/:id/check-in` | **PROTOTYPE HOOK** | Dispatches host arrival alert. |
| **`employeeService`** | `searchEmployees` | `GET /employees?q=&dept=` | **PROTOTYPE HOOK** | Connects to tenant `users` directory. |
| | `notifyHost` | `POST /employees/:id/notify-arrival` | **PROTOTYPE HOOK** | SMS/Slack notification hook. |
| **`departmentService`** | `getDepartments` | `GET /departments` | **LIVE CONTRACT** | Full floor & wayfinding directory. |
| **`conversationService`**| `sendMessage` | `POST /conversation/message` | **PROTOTYPE HOOK** | Conversational message dispatch. Live LLM & RAG integration scheduled for Phase 4/5. |

---

## 3. Strict Prototype & Transparency Disclosures

In accordance with enterprise engineering standards, **no mock functionality is claimed to be a completed live backend system**. 

When backend services are scheduled for subsequent phases:
- A clear visual disclaimer is displayed to the user:
  > *"Phase 2 Prototype Interface: Integration with live visitor badge printer and RAG backend scheduled for subsequent phases."*
- Typed fallback objects conform strictly to the anticipated OpenAPI schema for subsequent phases, enabling drop-in integration without frontend restructuring.
