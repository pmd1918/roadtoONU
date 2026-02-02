# Task Plan: RoadtoONU Vercel Deployment & Fixes

## Goal
Deploy ConclaveCoach scaling fix and Creed cycling text to production, verify both work at 320px mobile viewport.

## Current Phase
Phase 5

## Phases

### Phase 1: Discovery & Diagnosis
- [x] Identify ConclaveCoach scaling issue (parts don't scale together at 320px)
- [x] Identify Creed cycling text requirement
- [x] Code changes made (ConclaveCoach.astro, Creed.astro)
- [x] Commits pushed (aa4d472, f4cb7d3)
- [x] Diagnose why Vercel auto-deploy not triggering
- **Status:** complete

### Phase 2: Vercel Deployment
- [x] Get valid Vercel token (Alex provided new token)
- [x] Force deploy with `vercel --prod --token <token>`
- [x] Verify deployment completes
- **Status:** complete

### Phase 3: Verification
- [x] Test ConclaveCoach at 320px viewport
- [x] Verify sign and parts scale together
- [x] Test Creed cycling (Brotherhood, Service, Democracy)
- [x] Screenshot/confirm visual correctness
- **Status:** complete

### Phase 4: Fix Issues (if needed)
- [ ] Address any scaling problems found
- [ ] Iterate on solution
- [ ] Re-deploy
- **Status:** pending

### Phase 5: Delivery
- [ ] Confirm with Alex all looks good
- [ ] Document final solution
- **Status:** pending

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Scale wrapper approach | JS calculates `scale = wrapperWidth / 1200` and sets transform |
| Transform origin top-left | Avoids centering issues with negative margins |
| No minimum scale floor | Removed 0.28 min so content always fits viewport |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| Vercel token invalid | 1 | Token from AWS Secrets Manager rejected - may be truncated or wrong type |
| Vercel device login timeout | 1 | Flow timed out - need user to provide token manually |

## Key Questions
1. Why isn't Vercel auto-deploy triggering from GitHub?
2. Is the Vercel token truncated or wrong type?
3. Do the individual part transforms (skewX, translateX) conflict with parent scale?

## Notes
- Site: https://road-to-onu.vercel.app
- Repo: pmd1918/roadtoONU
- Live site serving 18hr stale cache (age: 64539)
