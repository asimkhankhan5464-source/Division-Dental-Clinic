# Security Specification - Division Dental Clinic

## Data Invariants
1. A user can only see and manage their own user profile document.
2. A user can only see and create their own bookings.
3. Every booking must have a valid `userId` matching the creator.
4. `createdAt` timestamps must be server-generated.
5. Critical fields like `userId` and `createdAt` are immutable after creation.

## The "Dirty Dozen" Payloads (Selection)
1. **Identity Spoofing**: Attempt to create a booking with someone else's `userId`.
2. **PII Leak**: Attempt to read another user's profile.
3. **Ghost Update**: Attempt to update a booking's `userId`.
4. **Invalid State**: Attempt to create a booking with `status: 'confirmed'`.
5. **Collection Scraping**: Attempt to list all bookings without a `userId` filter.
6. **ID Poisoning**: Attempt to use a huge string as a document ID.
7. **Bypassing Verification**: Attempt to write data without a verified email (if required).
8. **Shadow Field**: Attempt to add an `isAdmin: true` field to a user profile.

## Test Runner
Testing against these will be handled by the logic gates in `firestore.rules`.
