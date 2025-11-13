# O*NET Data

This directory contains occupation data from the O*NET (Occupational Information Network) database.

## Source

- **O*NET Version**: 30.0
- **Downloaded from**: https://www.onetcenter.org/database.html
- **Direct download URL**: https://www.onetcenter.org/dl_files/database/db_30_0_text/db_30_0_text.zip
- **Format**: Text (tab-delimited .txt files)
- **License**: O*NET data is public domain (developed under the sponsorship of the U.S. Department of Labor/Employment and Training Administration)

## Directory Structure

```
onet/
├── raw/              # Original O*NET text files (tab-delimited)
├── processed/        # Processed JSON files optimized for JobEval
├── download.log      # Download script log file
└── README.md         # This file
```

## Data Files

### Priority 1 - Essential Files

These files are critical for core functionality:

- **Occupation Data.txt** - Core occupation information (SOC codes, titles, descriptions)
- **Alternate Titles.txt** - Job title variations (critical for fuzzy matching)
- **Content Model Reference.txt** - Data model documentation

### Priority 2 - Important for Job Evaluation

These files provide detailed job requirements and characteristics:

- **Skills.txt** - Skills required by occupation
- **Knowledge.txt** - Knowledge domains required
- **Abilities.txt** - Physical and cognitive abilities needed
- **Work Activities.txt** - What people do in the job
- **Work Context.txt** - Working conditions
- **Job Zones.txt** - Experience and education categories
- **Education, Training, and Experience.txt** - Specific requirements
- **Education, Training, and Experience Categories.txt** - Category definitions

### Priority 3 - Nice to Have

These files provide additional context for job matching:

- **Work Values.txt** - Intrinsic job values
- **Interests.txt** - Career interest alignment
- **Work Styles.txt** - Personality characteristics
- **Tasks.txt** - Detailed task descriptions

## Update Process

To update O*NET data:

1. **Download** the latest data:
   ```bash
   node scripts/download-onet-data.js
   ```

2. **Force re-download** if files already exist:
   ```bash
   node scripts/download-onet-data.js --force
   ```

3. **Verify** existing files without downloading:
   ```bash
   node scripts/download-onet-data.js --verify
   ```

4. **Process** the data (coming soon):
   ```bash
   node scripts/process-onet-data.js
   ```

## Integration with JobEval

O*NET data will be integrated with existing BLS wage data to provide:

- **Comprehensive occupation database** (expanding beyond current 20-occupation dataset)
- **Job title fuzzy matching** using alternate titles
- **Skills and knowledge requirements** for career planning
- **Education and experience requirements** for affordability analysis
- **Work context and conditions** for job fit assessment

## Data Format

All files are tab-delimited text files with:
- First row contains column headers
- Subsequent rows contain data
- Fields are separated by tab characters (`\t`)
- Text encoding: UTF-8

Example structure:
```
O*NET-SOC Code    Title    Description
15-1251.00    Computer Programmers    Write, analyze, review, and rewrite programs...
```

## Last Updated

This section will be automatically updated by the download script.
Check `download.log` for detailed download history.

## Resources

- **O*NET Online**: https://www.onetonline.org/
- **O*NET Database Documentation**: https://www.onetcenter.org/database.html
- **O*NET Data Dictionary**: https://www.onetcenter.org/dictionary/30.0/excel/
- **O*NET Content Model**: https://www.onetcenter.org/content.html

## Notes

- O*NET uses the Standard Occupational Classification (SOC) system
- SOC codes follow the format: `XX-XXXX.XX` (e.g., `15-1251.00`)
- Data is updated regularly by the O*NET Center (typically 1-2 times per year)
- This data complements our BLS wage data which uses the same SOC codes
