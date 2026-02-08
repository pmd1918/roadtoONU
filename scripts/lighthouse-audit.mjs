#!/usr/bin/env node
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

async function runAudit(url) {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance'],
    port: chrome.port,
    // Mobile settings
    formFactor: 'mobile',
    throttling: {
      rttMs: 150,
      throughputKbps: 1600,
      cpuSlowdownMultiplier: 4
    },
    screenEmulation: {
      mobile: true,
      width: 360,
      height: 640,
      deviceScaleFactor: 2,
      disabled: false
    }
  };

  const runnerResult = await lighthouse(url, options);

  await chrome.kill();

  // Extract key metrics
  const lhr = runnerResult.lhr;
  const performance = lhr.categories.performance;
  const audits = lhr.audits;

  console.log('\n🚀 PERFORMANCE AUDIT RESULTS');
  console.log('================================');
  console.log(`📱 URL: ${url}`);
  console.log(`📊 Performance Score: ${Math.round(performance.score * 100)}/100`);
  console.log('\n📈 CORE WEB VITALS:');
  console.log(`⚡ LCP (Largest Contentful Paint): ${audits['largest-contentful-paint'].displayValue}`);
  console.log(`🎯 FID (First Input Delay): ${audits['max-potential-fid'].displayValue}`);
  console.log(`📐 CLS (Cumulative Layout Shift): ${audits['cumulative-layout-shift'].displayValue}`);
  
  console.log('\n⏱️  PERFORMANCE METRICS:');
  console.log(`🎨 First Contentful Paint: ${audits['first-contentful-paint'].displayValue}`);
  console.log(`🖼️  Speed Index: ${audits['speed-index'].displayValue}`);
  console.log(`🏁 Total Blocking Time: ${audits['total-blocking-time'].displayValue}`);

  console.log('\n🔧 KEY OPPORTUNITIES:');
  const opportunities = Object.values(audits).filter(audit => 
    audit.score !== null && 
    audit.score < 1 && 
    audit.details?.type === 'opportunity'
  ).sort((a, b) => (b.details.overallSavingsMs || 0) - (a.details.overallSavingsMs || 0));

  opportunities.slice(0, 5).forEach(audit => {
    const savings = audit.details.overallSavingsMs ? `(Save ${audit.details.overallSavingsMs}ms)` : '';
    console.log(`  • ${audit.title} ${savings}`);
  });

  console.log('\n================================\n');

  return {
    score: Math.round(performance.score * 100),
    lcp: audits['largest-contentful-paint'].numericValue,
    fid: audits['max-potential-fid'].numericValue,
    cls: audits['cumulative-layout-shift'].numericValue,
    opportunities: opportunities.slice(0, 5)
  };
}

// Run audit
const url = process.argv[2] || 'https://roadtoonu.com';
console.log(`🔍 Starting Lighthouse audit for: ${url}`);

try {
  await runAudit(url);
} catch (error) {
  console.error('❌ Audit failed:', error.message);
  process.exit(1);
}