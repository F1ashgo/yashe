# Backend Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize JWT authentication, protect member/admin endpoints, add Turnstile and endpoint rate limits, validate all externally supplied data, and preserve the existing API response envelope.

**Architecture:** A Spring Security filter validates access tokens and reloads current users from MySQL before creating authorities. Controllers consume an authenticated principal; Turnstile, rate limiting, validation, and global errors are separate testable services.

**Tech Stack:** Java 17, Spring Boot 3.2, Spring Security, JJWT 0.12.3, MyBatis 3, Jakarta Validation, JUnit 5, Mockito, MockMvc, Testcontainers MySQL.

## Global Constraints

- Keep HS256; use a required secret of at least 32 bytes.
- Access tokens expire after 60 minutes and include issuer, audience, `token_type=access`, `jti`, user ID, and token version.
- Never authorize from a JWT role claim; use the current database role and status.
- Keep `{code, message, data}` for success and error responses.
- Register, login, and contact remain public; `/auth/me`, reviews, and notifications require authentication; `/admin/**` requires admin.
- CSRF remains disabled because the API uses stateless Bearer tokens.
- Turnstile is fail-closed in production.
- Commits follow Conventional Commits on `feat/security-responsive-admin`.

---

### Task 1: Test foundation and schema migration

**Files:**
- Modify: `api/pom.xml`
- Modify: `sql/init.sql`
- Create: `sql/migrations/20260717_security_hardening.sql`
- Modify: `api/src/main/java/com/yashe/entity/User.java`
- Modify: `api/src/main/resources/mapper/UserMapper.xml`
- Test: `api/src/test/java/com/yashe/mapper/UserMapperIntegrationTest.java`

**Interfaces:**
- Adds `users.token_version INT NOT NULL DEFAULT 0`.
- Adds `contact_messages.budget VARCHAR(20)`.

- [ ] **Step 1: Add test dependencies**

Add `spring-boot-starter-test`, `spring-security-test`, Testcontainers JUnit and MySQL with test scope. Keep production dependencies unchanged.

- [ ] **Step 2: Write the failing mapper integration test**

Start MySQL through Testcontainers, apply `sql/init.sql`, insert a user with `token_version=3`, and assert `findById`/`findByEmail` populate `User.tokenVersion`.

- [ ] **Step 3: Confirm RED**

```powershell
cd api
mvn -Dtest=UserMapperIntegrationTest test
```

Expected: FAIL because the entity/schema/mapper do not expose `token_version`.

- [ ] **Step 4: Implement schema and mapper changes**

Add:

```java
private Integer tokenVersion;
public Integer getTokenVersion() { return tokenVersion; }
public void setTokenVersion(Integer tokenVersion) { this.tokenVersion = tokenVersion; }
```

Include `token_version` in user selects. Add the idempotent migration:

```sql
ALTER TABLE users ADD COLUMN token_version INT NOT NULL DEFAULT 0 AFTER status;
ALTER TABLE contact_messages ADD COLUMN budget VARCHAR(20) DEFAULT NULL AFTER subject;
CREATE INDEX idx_notifications_status_created ON notifications(status, created_at);
```

- [ ] **Step 5: Verify and commit**

```powershell
mvn -Dtest=UserMapperIntegrationTest test
git add api/pom.xml api/src sql/init.sql sql/migrations
git commit -m "feat: add security schema migration"
```

---

### Task 2: JWT properties and token validation

**Files:**
- Create: `api/src/main/java/com/yashe/config/JwtProperties.java`
- Modify: `api/src/main/java/com/yashe/util/JwtUtil.java`
- Modify: `api/src/main/resources/application.yml`
- Test: `api/src/test/java/com/yashe/util/JwtUtilTest.java`

**Interfaces:**
- Produces: `generateAccessToken(User user): String`.
- Produces: `parseAndValidateAccessToken(String token): Claims`.
- Required config: `YASHE_JWT_SECRET`, `YASHE_JWT_ISSUER`, `YASHE_JWT_AUDIENCE`.

- [ ] **Step 1: Write token tests**

Cover:

```java
assertEquals("access", claims.get("token_type"));
assertEquals(user.getId(), claims.get("userId", Long.class));
assertEquals(user.getTokenVersion(), claims.get("tokenVersion", Integer.class));
assertNotNull(claims.getId());
assertTrue(claims.getExpiration().getTime() - claims.getIssuedAt().getTime() <= 3_600_000L);
```

Also reject expired, wrong signature, wrong issuer, wrong audience, and wrong token type.

- [ ] **Step 2: Confirm RED**

```powershell
mvn -Dtest=JwtUtilTest test
```

- [ ] **Step 3: Implement validated properties**

Use `@ConfigurationProperties(prefix="app.jwt")` and `@Validated`. Convert the secret with `Keys.hmacShaKeyFor`; reject UTF-8 values shorter than 32 bytes.

Generate:

```java
Jwts.builder()
    .id(UUID.randomUUID().toString())
    .subject(String.valueOf(user.getId()))
    .issuer(properties.issuer())
    .audience().add(properties.audience()).and()
    .claim("userId", user.getId())
    .claim("tokenVersion", user.getTokenVersion())
    .claim("token_type", "access")
```

`application.yml` contains no secret default:

```yaml
app:
  jwt:
    secret: ${YASHE_JWT_SECRET}
    issuer: ${YASHE_JWT_ISSUER:yashe-api}
    audience: ${YASHE_JWT_AUDIENCE:yashe-web}
    access-token-ttl: ${YASHE_JWT_ACCESS_TTL:PT60M}
```

- [ ] **Step 4: Verify and commit**

```powershell
mvn -Dtest=JwtUtilTest test
git add api/src/main api/src/test/java/com/yashe/util/JwtUtilTest.java
git commit -m "fix: harden access token validation"
```

---

### Task 3: Central Spring Security authentication

**Files:**
- Create: `api/src/main/java/com/yashe/security/AuthenticatedUser.java`
- Create: `api/src/main/java/com/yashe/security/JwtAuthenticationFilter.java`
- Create: `api/src/main/java/com/yashe/security/ApiResponseWriter.java`
- Create: `api/src/main/java/com/yashe/security/RestAuthenticationEntryPoint.java`
- Create: `api/src/main/java/com/yashe/security/RestAccessDeniedHandler.java`
- Modify: `api/src/main/java/com/yashe/config/SecurityConfig.java`
- Modify: `api/src/main/java/com/yashe/config/CorsConfig.java`
- Test: `api/src/test/java/com/yashe/security/JwtAuthenticationFilterTest.java`
- Test: `api/src/test/java/com/yashe/security/SecurityConfigTest.java`

**Interfaces:**

```java
public record AuthenticatedUser(Long userId, String email, String role, Integer tokenVersion) {}
```

- [ ] **Step 1: Write filter and route-policy tests**

Test malformed token, missing user, disabled user, token-version mismatch, changed DB role, anonymous member endpoint, member admin endpoint, and unknown routes.

Expected statuses:

```text
anonymous public endpoint -> controller
anonymous /api/auth/me -> 401 envelope
member /api/admin/** -> 403 envelope
admin /api/admin/** -> controller
unknown API -> 403/404 according to deny-all mapping
```

- [ ] **Step 2: Confirm RED**

```powershell
mvn -Dtest=JwtAuthenticationFilterTest,SecurityConfigTest test
```

- [ ] **Step 3: Implement the filter**

Token flow:

```java
Claims claims = jwtUtil.parseAndValidateAccessToken(token);
Long userId = claims.get("userId", Long.class);
Integer tokenVersion = claims.get("tokenVersion", Integer.class);
User user = userMapper.findById(userId);
if (user == null || !Integer.valueOf(1).equals(user.getStatus())
        || !Objects.equals(user.getTokenVersion(), tokenVersion)) {
    responseWriter.write(response, 401, "认证失败");
    return;
}
```

Build authorities only from `user.getRole()`.

- [ ] **Step 4: Implement route rules**

Use explicit method/path matchers:

```java
.requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login", "/api/contact/send").permitAll()
.requestMatchers(HttpMethod.GET, "/api/auth/me", "/api/notifications/latest").authenticated()
.requestMatchers("/api/reviews/**").authenticated()
.requestMatchers("/api/admin/**").hasRole("ADMIN")
.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
.anyRequest().denyAll()
```

Set stateless sessions, add the JWT filter, keep CSRF disabled, and install JSON entry point/denied handler.

- [ ] **Step 5: Tighten CORS**

Allow only configured origins, methods `GET,POST,PUT,PATCH,DELETE,OPTIONS`, headers `Content-Type,Authorization`, exposed `Retry-After`, and `allowCredentials=false`.

- [ ] **Step 6: Verify and commit**

```powershell
mvn -Dtest=JwtAuthenticationFilterTest,SecurityConfigTest test
git add api/src/main/java/com/yashe/security api/src/main/java/com/yashe/config api/src/test/java/com/yashe/security
git commit -m "feat: centralize API authentication"
```

---

### Task 4: Convert controllers to authenticated principals

**Files:**
- Modify: `api/src/main/java/com/yashe/controller/AuthController.java`
- Modify: `api/src/main/java/com/yashe/controller/AdminController.java`
- Modify: `api/src/main/java/com/yashe/controller/AdminNotificationController.java`
- Modify: `api/src/main/java/com/yashe/controller/ReviewController.java`
- Modify: `api/src/main/java/com/yashe/service/UserService.java`
- Test: `api/src/test/java/com/yashe/controller/AuthenticatedControllersTest.java`

- [ ] **Step 1: Write tests proving headers are no longer parsed in controllers**

Mock an `AuthenticatedUser` principal and verify `/auth/me`, reviews, member queries, and notifications use its user ID while authorization is enforced by Security.

- [ ] **Step 2: Confirm RED**

Current signatures require raw Authorization headers.

- [ ] **Step 3: Replace raw header parameters**

Use:

```java
@AuthenticationPrincipal AuthenticatedUser principal
```

Remove all `replace("Bearer ", "")`, `isAdmin`, and broad authentication catches. Inject the configured `BCryptPasswordEncoder` into `UserService` instead of constructing one.

Normalize email with:

```java
request.getEmail().trim().toLowerCase(Locale.ROOT)
```

Do not trim passwords.

- [ ] **Step 4: Keep successful response compatibility**

Preserve current success envelope keys during this task. Do not silently change `data.data.list` until the matching frontend API task.

- [ ] **Step 5: Verify and commit**

```powershell
mvn -Dtest=AuthenticatedControllersTest,SecurityConfigTest test
git add api/src/main api/src/test/java/com/yashe/controller
git commit -m "refactor: use authenticated principals in controllers"
```

---

### Task 5: Turnstile and endpoint rate limits

**Files:**
- Create: `api/src/main/java/com/yashe/config/TurnstileProperties.java`
- Create: `api/src/main/java/com/yashe/security/turnstile/TurnstileClient.java`
- Create: `api/src/main/java/com/yashe/security/turnstile/CloudflareTurnstileClient.java`
- Create: `api/src/main/java/com/yashe/security/turnstile/TurnstileService.java`
- Create: `api/src/main/java/com/yashe/security/ratelimit/RateLimitService.java`
- Create: `api/src/main/java/com/yashe/security/ratelimit/EndpointRateLimitFilter.java`
- Create: `api/src/main/java/com/yashe/security/ClientIpResolver.java`
- Modify: `api/src/main/resources/application.yml`
- Test: `api/src/test/java/com/yashe/security/turnstile/CloudflareTurnstileClientTest.java`
- Test: `api/src/test/java/com/yashe/security/ratelimit/EndpointRateLimitFilterTest.java`

**Interfaces:**

```java
TurnstileVerificationResult verify(String token, String remoteIp);
RateLimitDecision consume(RateLimitPolicy policy, String clientIp, Instant now);
```

- [ ] **Step 1: Write Turnstile tests**

Mock `RestClient` traffic for success, invalid token, duplicate token, timeout, invalid JSON, and upstream 5xx. No production secret appears in fixtures.

- [ ] **Step 2: Implement fail-closed verification**

POST form fields `secret`, `response`, `remoteip` to Cloudflare. Required config:

```yaml
app:
  turnstile:
    secret-key: ${YASHE_TURNSTILE_SECRET_KEY}
    verify-url: https://challenges.cloudflare.com/turnstile/v0/siteverify
```

- [ ] **Step 3: Write rate-limit tests**

Use a mutable test clock. Verify register request 4, login request 6, and contact request 4 return 429; separate IPs and endpoints remain independent; `Retry-After` is positive.

- [ ] **Step 4: Implement a standard-library fixed-window limiter**

Use a `ConcurrentHashMap<RateLimitKey, WindowCounter>` because the approved deployment is one API instance. Policies:

```java
REGISTER(3, Duration.ofMinutes(1))
LOGIN(5, Duration.ofMinutes(1))
CONTACT(3, Duration.ofMinutes(1))
```

The filter maps exact method/path pairs and returns an `ApiResponse` 429. `ClientIpResolver` trusts forwarded IP only when `remoteAddr` is in configured trusted proxies; otherwise it uses `remoteAddr`.

- [ ] **Step 5: Verify and commit**

```powershell
mvn -Dtest=CloudflareTurnstileClientTest,EndpointRateLimitFilterTest test
git add api/src/main api/src/test
git commit -m "feat: protect public forms from automation"
```

---

### Task 6: Validated request DTOs and global errors

**Files:**
- Modify: `api/src/main/java/com/yashe/dto/RegisterRequest.java`
- Modify: `api/src/main/java/com/yashe/dto/LoginRequest.java`
- Create: `api/src/main/java/com/yashe/dto/ContactRequest.java`
- Create: `api/src/main/java/com/yashe/dto/ReviewCreateRequest.java`
- Create: `api/src/main/java/com/yashe/dto/NotificationCreateRequest.java`
- Create: `api/src/main/java/com/yashe/dto/NotificationUpdateRequest.java`
- Create: `api/src/main/java/com/yashe/dto/NotificationStatusRequest.java`
- Create: `api/src/main/java/com/yashe/exception/GlobalExceptionHandler.java`
- Create: `api/src/main/java/com/yashe/service/ContactService.java`
- Modify: corresponding controllers/services
- Test: `api/src/test/java/com/yashe/validation/RequestValidationTest.java`
- Test: `api/src/test/java/com/yashe/exception/GlobalExceptionHandlerTest.java`

- [ ] **Step 1: Write field-boundary tests**

Assert 400 for blank/oversized fields, invalid email, new registration passwords outside 10–128, invalid rating, invalid notification status/type, and missing Turnstile token.

- [ ] **Step 2: Write error-envelope tests**

Cover validation 400, malformed JSON 400, duplicate email 409, invalid credentials 401, Turnstile unavailable 503, rate limit 429 + `Retry-After`, missing resource 404, and unknown exception 500 without internal details.

- [ ] **Step 3: Implement DTOs and mapping**

Persist only mapped fields. Never accept user ID/status/role from request bodies. `ContactService.submit` runs Turnstile before insert; registration does the same before BCrypt.

- [ ] **Step 4: Remove broad controller catches**

Throw typed business exceptions and let `GlobalExceptionHandler` write the envelope. Log internal failures server-side with no secret/request token content.

- [ ] **Step 5: Verify and commit**

```powershell
mvn -Dtest=RequestValidationTest,GlobalExceptionHandlerTest test
git add api/src/main api/src/test
git commit -m "fix: validate API request boundaries"
```

---

### Task 7: Make notifications member-only and minimize responses

**Files:**
- Create: `api/src/main/java/com/yashe/dto/MemberNotificationResponse.java`
- Create: `api/src/main/java/com/yashe/service/NotificationService.java`
- Modify: `api/src/main/java/com/yashe/controller/NotificationController.java`
- Modify: `api/src/main/java/com/yashe/controller/AdminNotificationController.java`
- Modify: `api/src/main/resources/mapper/NotificationMapper.xml`
- Test: `api/src/test/java/com/yashe/controller/NotificationSecurityTest.java`

- [ ] **Step 1: Write notification security tests**

Assert anonymous latest returns 401, member returns only `status=1`, hidden notifications never appear, and member response has no `status` or `updatedAt`. Assert notification CRUD is admin-only.

- [ ] **Step 2: Confirm RED**

Current latest endpoint is public and returns entities.

- [ ] **Step 3: Implement service and response DTO**

Return:

```java
public record MemberNotificationResponse(
    Long id, String title, String content, String type, LocalDateTime createdAt
) {}
```

Admin operations check mapper affected rows and return 404 for missing IDs.

- [ ] **Step 4: Verify and commit**

```powershell
mvn -Dtest=NotificationSecurityTest test
git add api/src/main api/src/test
git commit -m "fix: restrict member notifications"
```

---

### Task 8: Complete backend verification and deployment contract

**Files:**
- Modify: `api/src/main/resources/application.yml`
- Modify: `api/.env.example`
- Modify: `DOC/deployment_preparation_guide.md`
- Modify: `README.md`

- [ ] **Step 1: Finalize required environment names**

Use only:

```text
YASHE_DB_URL
YASHE_DB_USERNAME
YASHE_DB_PASSWORD
YASHE_JWT_SECRET
YASHE_JWT_ISSUER
YASHE_JWT_AUDIENCE
YASHE_JWT_ACCESS_TTL
YASHE_TURNSTILE_SECRET_KEY
YASHE_ALLOWED_ORIGINS
YASHE_TRUSTED_PROXIES
```

The example file contains placeholders only and is safe to track.

- [ ] **Step 2: Verify missing secret fails closed**

Add a context test that omits JWT/Turnstile secrets and expects startup validation failure; a test profile supplies explicit fake values.

- [ ] **Step 3: Run complete backend verification**

```powershell
cd api
mvn clean test
mvn verify
```

Expected: all tests PASS and package builds without `-DskipTests`.

- [ ] **Step 4: Commit**

```powershell
git add api DOC/deployment_preparation_guide.md README.md
git commit -m "docs: define secure backend configuration"
```

