# Security Specification — Amreen's Academy Firestore Rules

## 1. Data Invariants
1. **Enquiry Write-Only Dropbox (PII Protection)**: Anyone can create an enquiry (`status: 'new'`), but NO public/non-admin user may `get`, `list`, `update`, or `delete` enquiries (contains `phone` and `name` PII).
2. **Batch Integrity**: Public visitors can read/list `batches` to check schedule & seat availability, while only verified Admins can create/update/delete batches. `enrolledCount` must never exceed `seatLimit`.
3. **Enrollment Parent Gate**: Every `enrollment` must reference an existing `/batches/{batchId}` document (`exists()`), and only verified Admins may read/list/write enrollments.
4. **Certificate Verification Privacy**: Anyone with an exact `certCode` may `get /certificates/{certId}` to verify authenticity, but `list` is restricted to verified Admins so bulk scraping of student names is blocked.
5. **No Self-Assigned Admin**: Users cannot create or modify `/admins/{uid}`; admin identity is verified via `request.auth.token.email_verified == true` and either `/admins/{uid}` existence or the bootstrapped owner email.
6. **Temporal & Key Strictness**: All writes must enforce exact `keys().hasAll(...)` + `keys().hasOnly(...)`, strict `.size()` bounds, regex IDs (`^[a-zA-Z0-9_-]+$`), immutable `createdAt`/`issuedAt`, and server timestamps (`request.time`).
7. **Dynamic Site Settings (`siteSettings`)**: Public visitors can `get` `siteSettings/main` to render dynamic homepage/course copy without modifying it (`create`, `update`, `delete`, `list` restricted to verified Admins).
8. **Student Testimonials (`testimonials`)**: Contains zero PII (first/display name, batch label, focus area, quote, rating only); public read/list allowed for social proof while mutations are Admin-only.

## 2. "Dirty Dozen" Adversarial Payloads (Must All Be Rejected)
1. **Shadow Field Injection on Enquiry**: `{ name: "Asha", phone: "9876543210", ..., isAdmin: true }` -> Rejected by `keys().hasOnly(...)`.
2. **State Shortcutting on Enquiry Create**: `{ ..., status: "enrolled" }` -> Rejected because `create` requires `status == "new"`.
3. **Client Timestamp Forgery**: `{ ..., createdAt: "2020-01-01T00:00:00Z" }` -> Rejected because `createdAt == request.time`.
4. **1MB String Exhaustion on Enquiry Name**: `{ name: "A".repeat(5000), ... }` -> Rejected by `name.size() <= 100`.
5. **Invalid ID Poisoning**: Document ID `../../admins/evil` or 500-char ID -> Rejected by `isValidId()`.
6. **Unauthenticated Enquiry List Scraping**: Unauthenticated `list /enquiries` -> Rejected (`isAdmin()` required).
7. **Unverified Email Spoofing**: Auth token with `email == "sanaullaa19@gmail.com"` and `email_verified == false` -> Rejected by `email_verified == true`.
8. **Self-Privilege Escalation**: Authenticated non-admin writing `/admins/{uid}` -> Rejected (`allow write: if false`).
9. **Orphan Enrollment**: Creating `/enrollments/{id}` with nonexistent `batchId: "fake-batch-999"` -> Rejected by `exists(/databases/.../batches/fake-batch-999)`.
10. **Over-Capacity Batch Write**: Updating batch with `enrolledCount: 50, seatLimit: 20` -> Rejected by `enrolledCount <= seatLimit`.
11. **Certificate Bulk Scraping**: Public `list /certificates` -> Rejected (`isAdmin()` required).
12. **Certificate Code Mismatch**: Creating `/certificates/AA-1` with `certCode: "AA-999"` -> Rejected by `data.certCode == certId`.
