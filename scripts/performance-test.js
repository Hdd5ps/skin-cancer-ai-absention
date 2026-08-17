import lighthouse from 'lighthouse'
import { launch as chromeLauncher } from 'chrome-launcher'
import { writeFileSync } from 'fs'

const PORT = 8443
const URL = `http://localhost:${PORT}`

async function runPerformanceTest() {
  console.log('🚀 Starting performance test...')
  
  const chrome = await chromeLauncher({ chromeFlags: ['--headless'] })
  
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  }

  try {
    console.log(`📊 Testing ${URL}...`)
    const runnerResult = await lighthouse(URL, options)
    
    const report = runnerResult.report
    const categories = runnerResult.lhr.categories
    
    console.log('\n📈 Performance Results:')
    console.log('─'.repeat(50))
    
    Object.entries(categories).forEach(([key, category]) => {
      const score = (category.score * 100).toFixed(0)
      console.log(`${category.title}: ${score}/100`)
      
      if (category.score < 0.9) {
        console.log(`  ⚠️  Below threshold (target: 90+)`)
      }
    })
    
    // Extract key metrics
    const metrics = runnerResult.lhr.audits
    console.log('\n🔍 Key Metrics:')
    console.log('─'.repeat(50))
    console.log(`First Contentful Paint: ${metrics['first-contentful-paint'].displayValue}`)
    console.log(`Largest Contentful Paint: ${metrics['largest-contentful-paint'].displayValue}`)
    console.log(`Time to Interactive: ${metrics['interactive'].displayValue}`)
    console.log(`Total Blocking Time: ${metrics['total-blocking-time'].displayValue}`)
    console.log(`Cumulative Layout Shift: ${metrics['cumulative-layout-shift'].displayValue}`)
    
    // Save detailed report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const reportPath = `performance-report-${timestamp}.json`
    writeFileSync(reportPath, report)
    console.log(`\n💾 Detailed report saved to: ${reportPath}`)
    
    // Check performance thresholds
    const performanceScore = categories.performance.score * 100
    if (performanceScore < 90) {
      console.log('\n❌ Performance score below 90 threshold')
      process.exit(1)
    } else {
      console.log('\n✅ Performance test passed!')
    }
    
  } catch (error) {
    console.error('❌ Performance test failed:', error)
    process.exit(1)
  } finally {
    await chrome.kill()
  }
}

runPerformanceTest()
