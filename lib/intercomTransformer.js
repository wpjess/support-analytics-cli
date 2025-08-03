const fs = require('fs');
const csv = require('csv-parser');
const moment = require('moment-timezone');

class IntercomTransformer {
  constructor() {
    // Field mapping from Intercom to our schema
    this.fieldMapping = {
      'Conversation ID': 'ticket_id',
      'Conversation created at (America/Vancouver)': 'created_date',
      'Teammate currently assigned': 'assigned_to',
      'Conversation priority': 'priority',
      'Current conversation state': 'status',
      'Conversation first replied at (America/Vancouver)': 'first_response_date',
      'Conversation first closed at (America/Vancouver)': 'resolution_date',
      'Topics': 'category',
      'Team currently assigned': 'team',
      'Last teammate rating': 'satisfaction_score'
    };

    // Priority mapping from Intercom values to our schema
    this.priorityMapping = {
      'not_priority': 'Low',
      'Not Priority': 'Low', // Intercom format with space and capitals
      'priority': 'Medium',
      'Priority': 'Medium',
      'high': 'High',
      'High': 'High',
      'urgent': 'Critical',
      'Urgent': 'Critical',
      // Handle various formats
      'low': 'Low',
      'Low': 'Low',
      'medium': 'Medium',
      'Medium': 'Medium', 
      'critical': 'Critical',
      'Critical': 'Critical',
      '': 'Medium' // Default for empty
    };

    // Status mapping from Intercom to our schema
    this.statusMapping = {
      'open': 'Open',
      'snoozed': 'Open',
      'waiting': 'In Progress',
      'closed': 'Resolved',
      'resolved': 'Resolved',
      // Handle various formats
      'in_progress': 'In Progress',
      'pending': 'In Progress',
      '': 'Open' // Default for empty
    };

    // Our schema's required fields (removed first_response_date since many tickets may not have responses yet)
    this.requiredOutputFields = [
      'ticket_id',
      'created_date',
      'assigned_to',
      'priority',
      'status',
      'category',
      'team'
    ];

    // Optional fields with defaults
    this.optionalFields = {
      'first_response_date': '',
      'resolution_date': '',
      'customer_tier': '',
      'escalated': 'false',
      'escalation_date': '',
      'satisfaction_score': ''
    };
  }

  async transformFile(inputPath, outputPath, options = {}) {
    return new Promise((resolve, reject) => {
      const transformedRows = [];
      const errors = [];
      let lineNumber = 1;
      let headers = [];

      console.log(`📥 Reading Intercom CSV: ${inputPath}`);

      fs.createReadStream(inputPath)
        .pipe(csv())
        .on('headers', (headerList) => {
          headers = headerList;
          this.validateHeaders(headers, errors);
        })
        .on('data', (row) => {
          lineNumber++;
          try {
            const transformedRow = this.transformRow(row, lineNumber);
            transformedRows.push(transformedRow);
          } catch (error) {
            errors.push(`Line ${lineNumber}: ${error.message}`);
          }
        })
        .on('end', async () => {
          if (errors.length > 0 && !options.ignoreErrors) {
            reject({ type: 'transformation', errors, rowsProcessed: transformedRows.length });
            return;
          }

          try {
            if (options.dryRun) {
              resolve({
                type: 'dry-run',
                rowsProcessed: transformedRows.length,
                errors,
                sample: transformedRows.slice(0, 5) // Show first 5 rows
              });
            } else {
              const csvContent = this.generateCSV(transformedRows);
              await this.writeFile(outputPath, csvContent);
              
              resolve({
                type: 'success',
                inputFile: inputPath,
                outputFile: outputPath,
                rowsProcessed: transformedRows.length,
                errors,
                fileSize: csvContent.length
              });
            }
          } catch (writeError) {
            reject({ type: 'write', error: writeError.message });
          }
        })
        .on('error', (error) => {
          reject({ type: 'read', error: error.message });
        });
    });
  }

  validateHeaders(headers, errors) {
    const mappedFields = Object.keys(this.fieldMapping);
    const missingFields = mappedFields.filter(field => !headers.includes(field));
    
    if (missingFields.length > 0) {
      errors.push(`Missing expected Intercom fields: ${missingFields.join(', ')}`);
    }

    console.log(`📋 Found ${headers.length} columns in Intercom CSV`);
    console.log(`🔄 Will map ${mappedFields.length} fields to our schema`);
  }

  transformRow(intercomRow, lineNumber) {
    const transformedRow = {};

    // Map known fields
    Object.keys(this.fieldMapping).forEach(intercomField => {
      const ourField = this.fieldMapping[intercomField];
      const value = intercomRow[intercomField];
      
      transformedRow[ourField] = this.transformValue(ourField, value, lineNumber);
    });

    // Add optional fields with defaults
    Object.keys(this.optionalFields).forEach(field => {
      if (!transformedRow[field]) {
        transformedRow[field] = this.optionalFields[field];
      }
    });

    // Validate required fields
    this.validateRequiredFields(transformedRow, lineNumber);

    return transformedRow;
  }

  transformValue(fieldName, value, lineNumber) {
    // Handle null/undefined/empty values
    if (value === null || value === undefined || value === '') {
      if (this.requiredOutputFields.includes(fieldName)) {
        if (fieldName === 'assigned_to') return 'unassigned@company.com';
        if (fieldName === 'category') return 'General';
        if (fieldName === 'team') return 'General';
        throw new Error(`Required field '${fieldName}' is empty`);
      }
      return '';
    }

    const trimmedValue = String(value).trim();

    switch (fieldName) {
      case 'created_date':
      case 'first_response_date':
      case 'resolution_date':
        return this.transformDate(trimmedValue, lineNumber);
      
      case 'priority':
        return this.transformPriority(trimmedValue, lineNumber);
      
      case 'status':
        return this.transformStatus(trimmedValue, lineNumber);
      
      case 'satisfaction_score':
        return this.transformSatisfactionScore(trimmedValue, lineNumber);
      
      case 'ticket_id':
        // Ensure ticket ID has a consistent prefix
        return trimmedValue.startsWith('T-') ? trimmedValue : `T-${trimmedValue}`;
      
      default:
        return trimmedValue;
    }
  }

  transformDate(dateString, lineNumber) {
    if (!dateString || dateString.trim() === '') {
      return '';
    }

    try {
      // Parse date assuming America/Vancouver timezone and convert to UTC ISO format
      const parsed = moment.tz(dateString, 'America/Vancouver');
      
      if (!parsed.isValid()) {
        throw new Error(`Invalid date format: ${dateString}`);
      }
      
      return parsed.utc().toISOString();
    } catch (error) {
      throw new Error(`Date transformation failed for '${dateString}': ${error.message}`);
    }
  }

  transformPriority(priority, lineNumber) {
    const normalizedPriority = priority.toLowerCase();
    
    if (this.priorityMapping[normalizedPriority]) {
      return this.priorityMapping[normalizedPriority];
    }
    
    // Try to guess based on common patterns
    if (normalizedPriority.includes('urgent') || normalizedPriority.includes('critical')) {
      return 'Critical';
    }
    if (normalizedPriority.includes('high')) {
      return 'High'; 
    }
    if (normalizedPriority.includes('low')) {
      return 'Low';
    }
    
    console.warn(`Warning: Unknown priority '${priority}' at line ${lineNumber}, defaulting to Medium`);
    return 'Medium';
  }

  transformStatus(status, lineNumber) {
    const normalizedStatus = status.toLowerCase();
    
    if (this.statusMapping[normalizedStatus]) {
      return this.statusMapping[normalizedStatus];
    }
    
    // Try to guess based on common patterns
    if (normalizedStatus.includes('close') || normalizedStatus.includes('resolve')) {
      return 'Resolved';
    }
    if (normalizedStatus.includes('progress') || normalizedStatus.includes('working')) {
      return 'In Progress';
    }
    
    console.warn(`Warning: Unknown status '${status}' at line ${lineNumber}, defaulting to Open`);
    return 'Open';
  }

  transformSatisfactionScore(score, lineNumber) {
    if (!score || score.trim() === '') {
      return '';
    }

    const numericScore = parseInt(score);
    
    if (isNaN(numericScore)) {
      console.warn(`Warning: Invalid satisfaction score '${score}' at line ${lineNumber}, ignoring`);
      return '';
    }
    
    // Ensure score is in 1-5 range
    if (numericScore < 1 || numericScore > 5) {
      console.warn(`Warning: Satisfaction score '${score}' outside 1-5 range at line ${lineNumber}, ignoring`);
      return '';
    }
    
    return numericScore.toString();
  }

  validateRequiredFields(row, lineNumber) {
    const missingFields = this.requiredOutputFields.filter(field => !row[field] || row[field].trim() === '');
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  generateCSV(rows) {
    if (rows.length === 0) {
      throw new Error('No data to transform');
    }

    // Get all possible field names from our schema
    const allFields = [...this.requiredOutputFields, ...Object.keys(this.optionalFields)];
    
    // CSV header
    let csv = allFields.join(',') + '\n';
    
    // CSV rows
    rows.forEach(row => {
      const values = allFields.map(field => {
        const value = row[field] || '';
        // Wrap in quotes if contains comma or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      
      csv += values.join(',') + '\n';
    });
    
    return csv;
  }

  async writeFile(outputPath, content) {
    return new Promise((resolve, reject) => {
      fs.writeFile(outputPath, content, 'utf8', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Get mapping info for validation
  getMappingInfo() {
    return {
      fieldMapping: this.fieldMapping,
      priorityMapping: this.priorityMapping,
      statusMapping: this.statusMapping,
      requiredFields: this.requiredOutputFields,
      optionalFields: Object.keys(this.optionalFields)
    };
  }
}

module.exports = IntercomTransformer;