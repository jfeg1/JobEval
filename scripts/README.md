# BLS Data Scripts

## Overview

These scripts download and process Bureau of Labor Statistics (BLS) Occupational Employment and Wage Statistics (OES) data.

There are two approaches to fetching BLS data:

1. **XLSX Method** (`download-bls-data.js` + `process-bls-data.js`) - Downloads pre-compiled Excel files
2. **API Method** (`fetch-bls-data.js`) - Fetches data directly from BLS Public API v2

## Data Source

**URL:** https://download.bls.gov/pub/time.series/oe/

The BLS OES data is distributed as tab-delimited text files, updated annually (typically March/April for the previous May's data).

## Files Downloaded

| File | Size | Description |
|------|------|-------------|
| `oe.occupation` | 261KB | Occupation codes and titles (SOC codes) |
| `oe.data.0.Current` | 332MB | Current period wage data |
| `oe.area` | 22KB | Geographic area codes |
| `oe.datatype` | 528B | Data type codes (wage types) |
| `oe.series` | 1.2GB | Series metadata (maps series IDs to occupations) |

## Data Format

BLS uses a relational structure:

1. **Series ID** encodes: survey + area + industry + occupation + datatype
2. **Data file** contains: series_id → value pairs
3. **Series file** decodes: series_id → occupation, area, datatype

Example series ID: `OEUM004600000000113003`
- Survey: OEU (OES)
- Area: 00 (National)
- Industry: 000000 (All industries)
- Occupation: 11-3000 (Operations Specialties Managers)
- Datatype: 03 (Mean hourly wage)

## Wage Data Types

| Code | Description |
|------|-------------|
| 03 | Mean hourly wage |
| 04 | Mean annual wage |
| 11 | Median hourly wage |
| 12 | Median annual wage |
| 13 | Annual 10th percentile wage |
| 14 | Annual 25th percentile wage |
| 15 | Annual 75th percentile wage |
| 16 | Annual 90th percentile wage |

## Usage

### XLSX Method (Default)

```bash
# Download data
npm run data:download

# Process data
npm run data:process

# Or do both
npm run data:setup
```

### API Method (New)

The API fetcher provides more comprehensive data including state-level breakdowns.

```bash
# Fetch all data (resumable)
node scripts/fetch-bls-data.js

# Start fresh (reset progress)
node scripts/fetch-bls-data.js --reset

# Test mode: National data only, first 10 occupations
node scripts/fetch-bls-data.js --geography=national --limit=10

# Resume after hitting daily rate limit
node scripts/fetch-bls-data.js --resume
```

**API Features:**
- Fetches national + 15 state geographies per occupation
- Resumable progress tracking (saves after each occupation)
- Rate limit handling (500 requests/day with 10-request buffer)
- Comprehensive wage data (9 data types per occupation)
- Retry logic with exponential backoff
- Detailed error logging

**API Rate Limits:**
- 500 requests per day (uses ~490 to leave buffer)
- ~830 occupations × 16 geographies = ~13,280 total requests
- Estimated time: ~27 days of automated fetching
- The script automatically stops at daily limit and can resume the next day

**Progress Tracking:**
- Progress saved to: `data/progress.json`
- Output saved to: `public/data/bls-api-data.json`
- Errors logged to: `data/errors.log`

**API Output Format:**
```json
{
  "version": "1.0",
  "dataDate": "2024-11-11",
  "source": "BLS OEWS API",
  "metadata": {
    "fetchStarted": "2024-11-11T00:00:00Z",
    "lastUpdated": "2024-11-11T10:30:00Z",
    "totalOccupations": 830,
    "completedOccupations": 427,
    "geographies": ["National", "CA", "TX", ...]
  },
  "occupations": [
    {
      "code": "11-2021",
      "title": "Marketing Managers",
      "employment": 345200,
      "wages": {
        "hourlyMean": 85.45,
        "hourlyMedian": 78.32,
        "annualMean": 177750,
        "annualMedian": 162910,
        "percentile10": 71380,
        "percentile25": 102310,
        "percentile75": 208000,
        "percentile90": 208000
      },
      "geography": "National",
      "dataDate": "2024-05",
      "stateData": {
        "CA": { employment: 45600, wages: {...} },
        "TX": { employment: 28900, wages: {...} }
      }
    }
  ]
}
```

## Output

The processed data is saved to `public/data/bls-data.json` with this structure:

```json
{
  "occupations": [
    {
      "code": "11-1011",
      "title": "Chief Executives",
      "group": "Management",
      "median": 206680,
      "mean": 239200,
      "percentile10": 82200,
      "percentile25": 123420,
      "percentile75": 338470,
      "percentile90": 338470,
      "date": "May 2024"
    }
  ],
  "index": {
    "chief": ["11-1011"],
    "executive": ["11-1011", "..."]
  },
  "metadata": {
    "source": "U.S. Bureau of Labor Statistics",
    "dataset": "Occupational Employment and Wage Statistics",
    "date": "May 2024",
    "totalOccupations": 830,
    "lastUpdated": "2025-11-10T12:00:00.000Z"
  }
}
```

## Filtering

The processing script filters to ~600-800 detailed occupations by:
1. Excluding summary codes (ending in 0000)
2. Requiring median annual wage data
3. Using national-level data only (area code 00)
4. Using all-industry data only (industry code 000000)

## Performance

- **Download:** ~3-5 minutes (depends on connection speed)
- **Processing:** ~5-10 minutes (depends on system performance)
- **Total:** ~10-15 minutes for complete pipeline

The `oe.series` file (1.2GB) takes the longest to process.

## Troubleshooting

### Downloads fail with 403 error
- Verify URL: https://download.bls.gov/pub/time.series/oe/
- Check if BLS has changed directory structure
- Try downloading individual files manually

### Processing takes too long
- The `oe.series` file is large (1.2GB)
- Expected processing time: 5-10 minutes
- Progress is logged to console

### Output has too few occupations
- Check filtering logic in `filterOccupations()`
- Some occupation codes may be summary codes
- Verify wage data is present for occupations

## References

- [BLS OES Home](https://www.bls.gov/oes/)
- [OES Data Files](https://download.bls.gov/pub/time.series/oe/)
- [OES Documentation](https://download.bls.gov/pub/time.series/oe/oe.txt)
- [SOC Codes](https://www.bls.gov/soc/)

## License

BLS data is public domain (U.S. government work).
