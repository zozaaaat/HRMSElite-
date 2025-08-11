# 🧹 Console Log Cleanup Tool

## Overview

The Console Log Cleanup Tool automatically removes `console.log`, `console.debug`, `console.info`, and `console.warn` statements from your codebase while preserving `console.error` statements for proper error handling.

## Features

✅ **Automatic Detection**: Scans TypeScript, JavaScript, TSX, and JSX files  
✅ **Smart Preservation**: Keeps `console.error` statements for error handling  
✅ **Backup System**: Creates backups before modifying files  
✅ **Dry Run Mode**: Preview changes without applying them  
✅ **Detailed Reporting**: Generates comprehensive cleanup reports  
✅ **Multiple Formats**: Supports both batch and PowerShell scripts  
✅ **Safe Operation**: Excludes node_modules and git directories  

## Quick Start

### Option 1: Windows Batch Script (Recommended)
```bash
# Run the cleanup tool
scripts\CLEANUP-CONSOLE-LOGS.bat
```

### Option 2: PowerShell Script
```powershell
# Run the cleanup tool
.\scripts\CLEANUP-CONSOLE-LOGS.ps1

# Dry run mode (preview only)
.\scripts\CLEANUP-CONSOLE-LOGS.ps1 -DryRun
```

### Option 3: Direct Node.js
```bash
# Remove console statements
node scripts/cleanup-console-logs.js

# Preview changes only
node scripts/cleanup-console-logs.js --dry-run

# Detailed output
node scripts/cleanup-console-logs.js --verbose

# Show help
node scripts/cleanup-console-logs.js --help
```

## Command Line Options

| Option | Short | Description |
|--------|-------|-------------|
| `--dry-run` | `-d` | Show what would be removed without making changes |
| `--verbose` | `-v` | Show detailed output for each file |
| `--help` | `-h` | Show help message |

## What Gets Removed

The tool removes these console statements:
- `console.log()`
- `console.debug()`
- `console.info()`
- `console.warn()`

## What Gets Preserved

The tool preserves these console statements:
- `console.error()` - For proper error handling

## Directory Coverage

The tool scans these directories:
- `client/src/` - React frontend code
- `server/` - Backend server code
- `hrms-mobile/` - Mobile application code
- `tests/` - Test files

## File Types Supported

- `.ts` - TypeScript files
- `.tsx` - TypeScript React files
- `.js` - JavaScript files
- `.jsx` - JavaScript React files

## Output Files

### 1. Cleanup Report
- **File**: `console-cleanup-report.md`
- **Content**: Detailed summary of all changes made

### 2. Backup Directory
- **Location**: `backup-console-logs/`
- **Content**: Original versions of modified files

## Example Report

```markdown
# Console Log Cleanup Report

## Summary
- **Total files processed:** 45
- **Successful operations:** 45
- **Failed operations:** 0
- **Total console statements removed:** 23
- **Total console statements preserved:** 12

## Console Methods Removed
- `console.log`
- `console.debug`
- `console.info`
- `console.warn`

## Console Methods Preserved
- `console.error`

## Files Modified
- **client/src/components/EmployeeList.tsx**: 5 removed, 2 preserved
- **server/routes.ts**: 8 removed, 3 preserved
- **tests/api/employees.test.ts**: 2 removed, 1 preserved
```

## Safety Features

### 1. Backup System
- Creates automatic backups before modifying files
- Backups stored in `backup-console-logs/` directory
- Maintains original file structure

### 2. Dry Run Mode
- Preview all changes without applying them
- Perfect for reviewing before cleanup
- Use `--dry-run` flag or PowerShell `-DryRun` parameter

### 3. Error Handling
- Graceful handling of file read/write errors
- Detailed error reporting in cleanup report
- Continues processing other files if one fails

### 4. Exclusion Rules
- Skips `node_modules/` directory
- Skips `.git/` directory
- Skips backup directory itself

## Best Practices

### Before Running
1. **Commit your changes** - Ensure all current work is committed
2. **Run dry run first** - Use `--dry-run` to preview changes
3. **Review the report** - Check what will be modified

### After Running
1. **Test your application** - Ensure everything still works
2. **Review modified files** - Check that important logs weren't removed
3. **Update logging strategy** - Consider using proper logging library

### For Future Development
1. **Use proper logging** - Replace console.log with structured logging
2. **Add ESLint rules** - Prevent console.log in production code
3. **Use environment variables** - Control logging levels

## Integration with Build Process

### ESLint Configuration
Add to your `.eslintrc.js`:
```javascript
{
  "rules": {
    "no-console": process.env.NODE_ENV === 'production' ? 'error' : 'warn'
  }
}
```

### Package.json Scripts
Add to your `package.json`:
```json
{
  "scripts": {
    "cleanup-logs": "node scripts/cleanup-console-logs.js",
    "cleanup-logs:dry": "node scripts/cleanup-console-logs.js --dry-run",
    "prebuild": "npm run cleanup-logs"
  }
}
```

## Troubleshooting

### Common Issues

#### 1. "Node.js not found"
- Install Node.js from https://nodejs.org/
- Ensure Node.js is in your system PATH

#### 2. "Script not found"
- Ensure you're running from the project root directory
- Check that `scripts/cleanup-console-logs.js` exists

#### 3. "Permission denied"
- Run PowerShell as Administrator
- Check file permissions in the project directory

#### 4. "No files processed"
- Verify the directories exist: `client/src/`, `server/`, etc.
- Check that files have supported extensions (`.ts`, `.tsx`, `.js`, `.jsx`)

### Recovery

If something goes wrong:
1. **Check the backup directory** - `backup-console-logs/`
2. **Restore from backup** - Copy files back from backup directory
3. **Review the report** - Check `console-cleanup-report.md` for details
4. **Run dry run** - Use `--dry-run` to see what happened

## Advanced Usage

### Custom Configuration
Edit `scripts/cleanup-console-logs.js` to customize:
- Directories to scan
- File extensions to process
- Console methods to remove/preserve

### Integration with CI/CD
```yaml
# GitHub Actions example
- name: Cleanup Console Logs
  run: |
    node scripts/cleanup-console-logs.js --dry-run
    node scripts/cleanup-console-logs.js
```

### Automated Cleanup
```bash
# Run cleanup before each build
npm run cleanup-logs && npm run build
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the generated cleanup report
3. Check the backup directory for original files
4. Run with `--verbose` for detailed output

## Version History

- **v1.0.0** - Initial release with basic cleanup functionality
- Added dry run mode
- Added backup system
- Added detailed reporting
- Added PowerShell and batch script support 