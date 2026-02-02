# Findings: RoadtoONU Deployment

## Key Discoveries

### ConclaveCoach Scaling Issue
- Original issue: Sign disappears at narrow viewports, parts don't scale evenly
- Root cause: Individual parts have their own transforms (skewX, translateX) that may conflict with parent scale
- The component was designed for fixed 1200px width, not responsive

### Vercel Deployment Issue
- Auto-deploy from GitHub not triggering
- Vercel CLI token from AWS Secrets Manager (`vercel-token` = `zaRxhfExVEb0pZkMSdshvHGB`) returns "not valid"
- Token may be truncated (only 24 chars) or wrong type (needs Deploy token, not just API token)
- Site serving stale 18hr cache

## Technical Details

### ConclaveCoach Solution Implemented
```javascript
// Scale approach
const wrapper = document.querySelector('.stage-wrapper');
const scale = wrapperWidth / 1200;
wrapper.style.transform = `scale(${scale})`;
wrapper.style.transformOrigin = 'top left';
wrapper.style.height = `${originalHeight * scale}px`;
```

### Creed Cycling Solution
```javascript
// Cycle through words every 3 seconds
const words = ['Brotherhood', 'Service', 'Democracy'];
let index = 0;
setInterval(() => {
  element.textContent = words[index];
  index = (index + 1) % words.length;
}, 3000);
```

## Links & References
- Live site: https://road-to-onu.vercel.app
- GitHub: https://github.com/pmd1918/roadtoONU
- Vercel tokens: https://vercel.com/account/tokens
