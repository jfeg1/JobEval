# O*NET Processed Data

This directory contains O*NET data that has been transformed from tab-delimited text files into optimized JSON format for runtime use in the JobEval occupation matching system.

## Files

### occupations.json

Main occupation data file containing comprehensive information about each occupation, indexed by O*NET-SOC code.

**Structure:**

```json
{
  "XX-XXXX.XX": {
    "code": "XX-XXXX.XX",
    "title": "Occupation Title",
    "description": "Detailed description...",
    "alternateTitles": ["Title 1", "Title 2", ...],
    "skills": [
      {
        "name": "Skill Name",
        "importance": 4.5,  // 0-5 scale
        "level": 4.2        // 0-5 scale
      }
    ],
    "knowledge": [
      {
        "name": "Knowledge Area",
        "importance": 4.7,
        "level": 4.5
      }
    ],
    "abilities": [
      {
        "name": "Ability Name",
        "importance": 4.3,
        "level": 4.1
      }
    ],
    "workActivities": [
      {
        "name": "Activity Name",
        "importance": 4.6,
        "level": 4.4
      }
    ],
    "workContext": [
      {
        "context": "Context Description",
        "value": 4.5
      }
    ],
    "jobZone": 4,
    "education": "Bachelor's degree",
    "experience": "Considerable preparation - several years..."
  }
}
```

### titles-index.json

Fast lookup index mapping normalized job titles to O*NET-SOC codes. Used for fuzzy matching and job title search.

**Structure:**

```json
{
  "normalized job title": ["XX-XXXX.XX"],
  "software engineer": ["15-1252.00"],
  "brand manager": ["11-2021.00"]
}
```

**Title Normalization:**

- Converted to lowercase
- Special characters removed
- Multiple spaces collapsed to single space
- Trimmed

### stats.json

Processing statistics and metadata.

**Structure:**

```json
{
  "version": "1.0",
  "dataSource": "O*NET 30.0",
  "processedDate": "2025-11-08T12:00:00.000Z",
  "processingTimeSeconds": 0.5,
  "summary": {
    "totalOccupations": 1000,
    "totalAlternateTitles": 5000,
    "totalSkills": 25000,
    "totalKnowledge": 18000,
    "totalAbilities": 15000,
    "totalWorkActivities": 12000,
    "totalWorkContext": 8000,
    "uniqueTitlesInIndex": 6000
  },
  "averages": {
    "skillsPerOccupation": 25.0,
    "knowledgePerOccupation": 18.0,
    "abilitiesPerOccupation": 15.0
  },
  "fileSizes": {
    "occupationsJson": "5.2 MB",
    "titlesIndexJson": "1.1 MB",
    "totalSize": "6.3 MB"
  },
  "warnings": [],
  "errors": []
}
```

## Data Scales

### Importance (IM) and Level (LV) Scales

Both use a 0-5 scale:

- **Importance**: How important the skill/knowledge/ability is for the occupation
  - 0 = Not important
  - 5 = Extremely important

- **Level**: The level of skill/knowledge/ability required
  - 0 = No proficiency required
  - 5 = Expert proficiency required

### Job Zones

O*NET uses a 5-level Job Zone system:

| Job Zone | Education | Experience |
|----------|-----------|------------|
| 1 | High school diploma or less | Little or no previous experience |
| 2 | High school diploma | Some previous experience |
| 3 | Vocational training or associate degree | Previous experience required |
| 4 | Bachelor's degree | Considerable preparation (several years) |
| 5 | Bachelor's + experience or graduate degree | Extensive preparation |

## Usage Examples

### Loading Occupation Data

```javascript
import occupations from './occupations.json';

// Get specific occupation
const marketingManager = occupations['11-2021.00'];
console.log(marketingManager.title); // "Marketing Managers"
console.log(marketingManager.skills); // Array of skills
```

### Fuzzy Title Matching

```javascript
import titleIndex from './titles-index.json';

// Normalize user input
function normalizeTitle(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Find occupation by title
const userInput = "Software Engineer";
const normalized = normalizeTitle(userInput);
const socCodes = titleIndex[normalized];

if (socCodes) {
  console.log(`Found occupation(s): ${socCodes.join(', ')}`);
}
```

### Filtering by Skills

```javascript
import occupations from './occupations.json';

// Find occupations requiring high critical thinking
const criticalThinkingJobs = Object.values(occupations)
  .filter(occ =>
    occ.skills.some(skill =>
      skill.name === 'Critical Thinking' &&
      skill.importance >= 4.5
    )
  );
```

## Data Quality

### Filtering Applied

- Skills, knowledge, abilities, and work activities with `Data Value <= 0` are excluded
- Items are sorted by importance (descending)
- Duplicate alternate titles are removed
- Invalid SOC codes are logged as warnings

### Validation

All O*NET-SOC codes follow the format: `XX-XXXX.XX`

Examples:
- `11-2021.00` - Marketing Managers
- `15-1252.00` - Software Developers
- `29-1141.00` - Registered Nurses

## Regenerating Data

To regenerate the processed data:

```bash
# 1. Ensure raw O*NET data is downloaded
node scripts/download-onet-data.js

# 2. Process the data
node scripts/process-onet-data.js

# 3. Review stats.json for warnings/errors
cat src/data/onet/processed/stats.json
```

## Integration with JobEval

This processed data is designed for:

1. **Job Title Matching**: Use `titles-index.json` for fast lookups
2. **Career Assessment**: Compare user skills against occupation requirements
3. **Education Planning**: Use job zones to determine education requirements
4. **Salary Analysis**: Cross-reference with BLS wage data (same SOC codes)

## Source

- **Original Data**: O*NET 30.0 Database
- **Format**: Text (tab-delimited)
- **Processing Script**: `scripts/process-onet-data.js`
- **Last Processed**: See `stats.json` → `processedDate`

## License

O*NET data is public domain (developed under the sponsorship of the U.S. Department of Labor/Employment and Training Administration).

## Resources

- [O*NET Online](https://www.onetonline.org/)
- [O*NET Database Documentation](https://www.onetcenter.org/database.html)
- [O*NET Content Model](https://www.onetcenter.org/content.html)
