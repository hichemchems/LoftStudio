# TODO: Fix Frontend Build Memory Issues for o2switch

## Current Status
- Frontend build failing with WebAssembly memory allocation errors on o2switch
- Multiple fallback scripts exist but build still fails
- Need memory-efficient Vite configuration and improved build scripts

## Tasks
- [x] Update vite.config.js with memory-efficient build options
- [x] Modify build_frontend_cpanel.sh for better memory management
- [x] Update deploy_production_o2switch.sh for proper fallback handling
- [x] Test build locally
- [x] Deploy and verify on o2switch

## Files to Edit
- `vite.config.js`
- `build_frontend_cpanel.sh`
- `deploy_production_o2switch.sh`
