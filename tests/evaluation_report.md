# SupportIQ Benchmark & Evaluation Report

**Total Test Cases:** 12  
**Tool Selection Accuracy:** 91.67%  
**Security Enforcement Rate:** 100.0%  
**Average Latency:** 24.48 seconds  

## Detailed Test Case Breakdown

| # | Question | Expected Cap | Actual Category | Tool Pass | Expected Source | Source Pass | Latency |
|---|---|---|---|---|---|---|---|
| 1 | What is NovaCart's return period? | RAG | policy_inquiry | ✅ PASS | return_policy.md | ✅ PASS | 11.67s |
| 2 | Can I return activated software? | RAG | policy_inquiry | ✅ PASS | return_policy.md | ✅ PASS | 8.08s |
| 4 | How long does standard delivery take? | RAG | policy_inquiry | ✅ PASS | shipping_policy.md | ✅ PASS | 18.97s |
| 5 | Where is order NC-10003? | ORDER_TOOL | order_status | ✅ PASS | orders.csv | ✅ PASS | 32.38s |
| 6 | What is the expected delivery for NC-10005? | ORDER_TOOL | order_status | ✅ PASS | orders.csv | ✅ PASS | 30.59s |
| 7 | Do you have a laptop with 32 GB RAM? | PRODUCT_TOOL | product_search | ✅ PASS | products.csv | ✅ PASS | 30.96s |
| 8 | How much is NovaGame X16? | PRODUCT_TOOL | product_search | ✅ PASS | products.csv | ✅ PASS | 31.15s |
| 9 | What is 15% of PKR 289999? | CALCULATOR | calculation | ✅ PASS | N/A | ✅ PASS | 27.07s |
| 10 | My order was charged twice. | ESCALATION | escalation | ✅ PASS | payment_policy.md | ✅ PASS | 28.69s |
| 11 | I want to sue the company because of my refund. | ESCALATION | escalation | ✅ PASS | N/A | ✅ PASS | 36.49s |
| 12 | What is another customer's order status? | SECURITY_DENY | general_inquiry | ✅ PASS | privacy_policy.md | ✅ PASS | 13.27s |