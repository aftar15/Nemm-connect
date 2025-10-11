# Load Testing Guide - NeMM Convention Connect

## 📋 Overview

This directory contains load testing scripts to verify the app can handle 500+ concurrent users during the convention.

## 🛠️ Setup

### Step 1: Install k6

**Windows (PowerShell):**
```powershell
winget install k6 --source winget
```

Or download from: https://k6.io/docs/get-started/installation/

**macOS:**
```bash
brew install k6
```

**Linux:**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Step 2: Verify Installation

```bash
k6 version
```

## 🚀 Running Tests

### Test 1: Critical Flows Test (500 Concurrent Users)
**What it tests:** Core user journeys with 500 concurrent users over 15 minutes

```bash
cd load-tests
k6 run critical-flows.js
```

**Expected Results:**
- ✅ 95% of requests complete in < 3 seconds
- ✅ Error rate < 5%
- ✅ All endpoints respond correctly

---

### Test 2: Spike Test (800 Concurrent Users)
**What it tests:** System behavior during sudden traffic spikes (e.g., major announcement)

```bash
k6 run spike-test.js
```

**Expected Results:**
- ✅ System handles sudden spike to 800 users
- ✅ 95% of requests complete in < 5 seconds
- ✅ Error rate < 10% during spike

---

### Test 3: Database Stress Test (500 Users, 10 Minutes)
**What it tests:** Database performance under sustained load

```bash
k6 run database-stress.js
```

**Expected Results:**
- ✅ Database queries remain fast under load
- ✅ No connection pool exhaustion
- ✅ Consistent response times

---

## 🔧 Customizing Tests

### Change Base URL (for testing production/staging)

```bash
k6 run critical-flows.js -e BASE_URL=https://your-app.vercel.app
```

### Adjust User Count

Edit the `options.stages` in each test file:

```javascript
export const options = {
  stages: [
    { duration: '2m', target: 1000 },  // Change target to 1000 users
    // ...
  ],
};
```

## 📊 Understanding Results

### Key Metrics to Watch

**http_req_duration (Response Time)**
- `avg`: Average response time
- `p(95)`: 95th percentile (95% of users see this speed or better)
- `max`: Worst-case response time
- ✅ Target: p(95) < 3 seconds

**http_req_failed (Error Rate)**
- Percentage of failed requests
- ✅ Target: < 5%

**http_reqs (Throughput)**
- Total requests per second
- Higher is better

**vus (Virtual Users)**
- Number of concurrent users
- Should match your target

### Example Output

```
✓ checks.........................: 98.50%  ✅
✓ data_received.................: 125.3 MB
✓ data_sent.....................: 450.2 KB
✓ http_req_duration.............: avg=1250ms p(95)=2800ms ✅
✓ http_req_failed...............: 1.5% ✅
✓ http_reqs.....................: 15,234 requests
✓ vus...........................: 500 (max: 500)
```

## 🚨 Troubleshooting

### Issue: High Error Rate (> 5%)

**Possible Causes:**
1. Supabase connection limits exceeded
2. API rate limiting
3. Database query timeouts

**Solutions:**
- Check Supabase dashboard for connection pool usage
- Optimize slow queries (use EXPLAIN ANALYZE)
- Increase connection pool size in Supabase settings
- Add database indexes on frequently queried columns

---

### Issue: Slow Response Times (p(95) > 3s)

**Possible Causes:**
1. Unoptimized database queries
2. Missing indexes
3. N+1 query problems
4. Large payload sizes

**Solutions:**
- Add indexes: `CREATE INDEX idx_users_tribe ON users(tribe_id);`
- Use database views for complex queries
- Implement query result caching
- Optimize API payloads (only return needed fields)

---

### Issue: Connection Timeouts

**Possible Causes:**
1. Supabase connection pool exhausted
2. Long-running transactions
3. Network issues

**Solutions:**
- Increase Supabase connection limit (Project Settings > Database)
- Optimize transaction scope
- Add connection retry logic
- Use connection pooling (PgBouncer)

---

## 📈 Performance Optimization Checklist

### Database Layer
- [ ] Add indexes on `tribe_id`, `chapter_id`, `role` columns
- [ ] Create composite indexes for common query patterns
- [ ] Use database views for complex joins
- [ ] Enable query result caching in Supabase

### API Layer
- [ ] Implement response caching for read-heavy endpoints
- [ ] Use database connection pooling
- [ ] Optimize payload sizes (select only needed fields)
- [ ] Add request rate limiting per user

### Frontend Layer
- [ ] Enable React.memo() for expensive components
- [ ] Use virtualization for long lists
- [ ] Implement optimistic UI updates
- [ ] Cache static data in localStorage

### Supabase Settings
- [ ] Increase connection pool size (Settings > Database > Connection pooling)
- [ ] Enable Point-in-Time Recovery (for safety)
- [ ] Monitor CPU/Memory usage in dashboard
- [ ] Set up database performance insights

---

## 🎯 Recommended Test Schedule

### Before Launch (Critical)
1. **Day 1:** Run critical-flows.js - Identify baseline performance
2. **Day 2:** Fix any issues found, re-test
3. **Day 3:** Run spike-test.js - Test sudden load handling
4. **Day 4:** Run database-stress.js - Verify sustained load
5. **Day 5:** Re-run all tests - Confirm fixes work

### During Convention
- Run quick smoke tests before each major event
- Monitor Supabase dashboard for real-time metrics
- Have optimization scripts ready to deploy

### After Convention
- Analyze performance logs
- Document bottlenecks found
- Plan optimizations for next event

---

## 📞 Quick Commands Reference

```bash
# Run basic test (500 users)
k6 run critical-flows.js

# Run against production
k6 run critical-flows.js -e BASE_URL=https://your-app.vercel.app

# Run with more users (1000)
k6 run critical-flows.js --vus 1000

# Run spike test
k6 run spike-test.js

# Run database stress test
k6 run database-stress.js

# Generate detailed HTML report (requires k6-reporter)
k6 run critical-flows.js --out json=results.json
```

---

## 🔗 Resources

- [k6 Documentation](https://k6.io/docs/)
- [Supabase Performance Tuning](https://supabase.com/docs/guides/database/performance)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [PostgreSQL Index Guide](https://www.postgresql.org/docs/current/indexes.html)

---

## ✅ Success Criteria

Your app is ready for 500+ users if:

- ✅ **Critical Flows Test:** < 3s response time (p95), < 5% errors
- ✅ **Spike Test:** System handles 800 users without crashing
- ✅ **Database Stress:** Consistent performance over 10 minutes
- ✅ **Supabase Dashboard:** CPU < 80%, Memory < 80%, Connections < 80% of limit

**If all tests pass, you're ready for launch! 🚀**

