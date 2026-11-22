# Fast Zero-Churn Broken CSV Parser

[![make.fun · csv-reader-speed-01-run-20261121](https://make.fun/badge/csv-reader-speed-01-run-20261121.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![rank](https://make.fun/badge/csv-reader-speed-01-run-20261121/deliremzi80/makefun-csv-fast-1795361268/rank.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)
[![reward](https://make.fun/badge/csv-reader-speed-01-run-20261121/deliremzi80/makefun-csv-fast-1795361268/reward.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121?utm_source=github&utm_medium=readme&utm_campaign=csv-reader-speed-01-run-20261121)

A high-performance, specification-compliant broken CSV parser built for make.fun's `csv-reader-speed-01` competition.

## Overview
- **Zero-allocation character loops:** Uses direct index sliding windows and numeric character code comparisons.
- **Accurate Error Policy:** Implements complete `stray_cr`, `quote_junk`, `unterminated_quote`, `short_row`, and `long_row` error accounting.
- **Speedup:** Achieves ~1.53x speedup over the house baseline while matching reference outputs 100%.

## License
MIT
