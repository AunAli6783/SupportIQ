# SupportIQ Benchmark & Evaluation Report

**Total Test Cases:** 12  
**Tool Selection Accuracy:** 100.0%  
**Security Enforcement Rate:** 100.0%  
**Average Latency:** 20.68 seconds  

## Detailed Test Case Breakdown

| # | Question | Expected Cap | Actual Category | Tool Pass | Expected Source | Source Pass | Latency |
|---|---|---|---|---|---|---|---|
| 1 | What is NovaCart's return period? | RAG | policy_inquiry | ✅ PASS | return_policy.md | ✅ PASS | 15.99s |
| 2 | Can I return activated software? | RAG | policy_inquiry | ✅ PASS | return_policy.md | ✅ PASS | 10.86s |
| 3 | Does accidental damage fall under warranty? | RAG | policy_inquiry | ✅ PASS | warranty_policy.md | ✅ PASS | 11.2s |
| 4 | How long does standard delivery take? | RAG | policy_inquiry | ✅ PASS | shipping_policy.md | ✅ PASS | 19.34s |
| 5 | Where is order NC-10003? | ORDER_TOOL | order_status | ✅ PASS | orders.csv | ✅ PASS | 24.72s |
| 6 | What is the expected delivery for NC-10005? | ORDER_TOOL | order_status | ✅ PASS | orders.csv | ✅ PASS | 23.71s |
| 7 | Do you have a laptop with 32 GB RAM? | PRODUCT_TOOL | product_search | ✅ PASS | products.csv | ✅ PASS | 26.71s |
| 8 | How much is NovaGame X16? | PRODUCT_TOOL | product_search | ✅ PASS | products.csv | ✅ PASS | 33.24s |
| 9 | What is 15% of PKR 289999? | CALCULATOR | calculation | ✅ PASS | N/A | ✅ PASS | 20.42s |
| 10 | My order was charged twice. | ESCALATION | escalation | ✅ PASS | payment_policy.md | ✅ PASS | 26.01s |
| 11 | I want to sue the company because of my refund. | ESCALATION | escalation | ✅ PASS | N/A | ✅ PASS | 25.09s |
| 12 | What is another customer's order status? | SECURITY_DENY | general_inquiry | ✅ PASS | privacy_policy.md | ✅ PASS | 10.92s |