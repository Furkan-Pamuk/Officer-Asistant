# Community wall — activation deferred

The landing page now has a separate community wall above “What crews say”. No sample posts, local auto-approved posts, or fake success messages are used. Posting is disabled until the backend is connected and explicitly enabled. Existing translations are reused; no locale dictionary is edited.

## Connect later

1. Choose the Supabase project and run `supabase/community-submissions.sql` once in its SQL editor. This creates a separate moderated table and a **private** photo bucket. It does not migrate the old device-only news posts.
2. Set server environment variables:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=<project URL>
   SUPABASE_SERVICE_ROLE_KEY=<server-only service role key>
   CREW_WALL_ENABLED=true
   ```

   Never put the service role key in a `NEXT_PUBLIC_*` variable, source file, or client bundle. Keep `CREW_WALL_ENABLED=false` until schema, storage, and moderation are verified.
3. Create and verify the Supabase Auth user `admin@sharkapp.co`. The database moderator policy checks this verified account, not editable profile metadata. No password or account is created by this implementation.
4. Restart the local app or redeploy after setting variables.

## Review and publication

There is no in-app admin dashboard in this phase. The project owner can use Supabase's Table Editor to review `community_submissions`, inspect its photo in the private `crew-wall-photos` bucket, and set `status` to `approved` or `rejected`. Approved entries appear on the next page load. Keep entries pending until the upload and review are complete. Set `reviewed_at`/`reviewed_by` when reviewing through the dashboard. The verified admin account has database permission to read the queue and update review fields for a future authenticated admin UI.

Public reads select approved posts only. Photos get short-lived signed URLs only after approval. Withdrawn photos may remain reachable through an already issued URL for up to ten minutes; public API responses are not cached. Existing already-downloaded copies cannot be revoked.

The server disregards client status fields and always inserts `pending`. Uploads are limited to re-encoded JPEGs of at most 2 MiB; oversized requests are rejected while streaming. Client photo preparation removes EXIF metadata. SQL enforces five submissions per IP-derived, daily HMAC fingerprint per hour across server instances. Configure the hosting provider's trusted forwarding header correctly before activation; add edge abuse protection for an internet-facing launch.

The current locale dictionaries have no moderation, connection, or detailed error labels. The UI reuses existing keys, uses an hourglass on submitted receipts, and links to Contact on transport/server errors. Explicit localized pending/approval guidance and an admin login/review screen can be added when the previous restriction on introducing translation keys is lifted.

## Before enabling publicly

- Verify `admin@sharkapp.co` can review while an unrelated verified account cannot read pending posts, update status, or fetch pending photos.
- Submit photo-only and comment-only entries. Confirm both stay pending and absent from public reads until approved.
- Reject a submission and verify it never appears publicly; approve another and verify its signed image.
- Verify rate limits and upload failures against the actual Supabase project.
- Keep `/api/crew-wall` outside any cache-first service worker. The component uses an uncached POST read operation to avoid the existing worker's GET cache without changing global offline behavior.

Local TypeScript and mocked handler tests do not replace these live backend checks. The backend has deliberately not been connected or activated.
