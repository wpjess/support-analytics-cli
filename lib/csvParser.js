const fs = require('fs');
const csv = require('csv-parser');
const moment = require('moment');

class CSVParser {
  constructor() {
    this.requiredFields = [
      'ticket_id',
      'created_date',
      'assigned_to',
      'priority',
      'status',
      'category',
      'team'
    ];
    
    this.optionalFields = [
      'first_response_date',
      'resolution_date',
      'customer_tier',
      'escalated',
      'escalation_date',
      'satisfaction_score',
      'teammate_first_replied',
      'teammate_replied_to',
      'company_name',
      'first_response_time_seconds',
      'time_to_close_seconds',
      'replies_sent'
    ];
  }

  async parseFile(filePath) {
    return new Promise((resolve, reject) => {
      const tickets = [];
      const errors = [];
      let lineNumber = 1;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          lineNumber++;
          const validationResult = this.validateRow(row, lineNumber);
          
          if (validationResult.isValid) {
            tickets.push(this.normalizeRow(row));
          } else {
            errors.push(...validationResult.errors);
          }
        })
        .on('end', () => {
          if (errors.length > 0) {
            reject({ type: 'validation', errors, ticketsProcessed: tickets.length });
          } else {
            resolve(tickets);
          }
        })
        .on('error', (error) => {
          reject({ type: 'parsing', error: error.message });
        });
    });
  }

  validateRow(row, lineNumber) {
    const errors = [];
    
    // Check required fields
    for (const field of this.requiredFields) {
      if (!row[field] || row[field].trim() === '') {
        errors.push(`Line ${lineNumber}: Missing required field '${field}'`);
      }
    }

    // Validate date formats
    const dateFields = ['created_date', 'first_response_date', 'resolution_date', 'escalation_date'];
    for (const field of dateFields) {
      if (row[field] && row[field].trim() !== '') {
        if (!moment(row[field]).isValid()) {
          errors.push(`Line ${lineNumber}: Invalid date format for '${field}': ${row[field]}`);
        }
      }
    }

    // Validate priority values
    const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
    if (row.priority && !validPriorities.includes(row.priority)) {
      errors.push(`Line ${lineNumber}: Invalid priority '${row.priority}'. Must be one of: ${validPriorities.join(', ')}`);
    }

    // Validate status values
    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
    if (row.status && !validStatuses.includes(row.status)) {
      errors.push(`Line ${lineNumber}: Invalid status '${row.status}'. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate escalated boolean
    if (row.escalated && !['true', 'false', '1', '0'].includes(row.escalated.toLowerCase())) {
      errors.push(`Line ${lineNumber}: Invalid escalated value '${row.escalated}'. Must be true/false or 1/0`);
    }

    // Validate satisfaction score
    if (row.satisfaction_score && row.satisfaction_score.trim() !== '') {
      const score = parseInt(row.satisfaction_score);
      if (isNaN(score) || score < 1 || score > 5) {
        errors.push(`Line ${lineNumber}: Invalid satisfaction_score '${row.satisfaction_score}'. Must be 1-5`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  normalizeRow(row) {
    return {
      ticket_id: row.ticket_id.trim(),
      created_date: moment(row.created_date),
      assigned_to: row.assigned_to.trim(),
      priority: row.priority,
      status: row.status,
      first_response_date: row.first_response_date ? moment(row.first_response_date) : null,
      resolution_date: row.resolution_date ? moment(row.resolution_date) : null,
      category: row.category.trim(),
      team: row.team.trim(),
      customer_tier: row.customer_tier || null,
      escalated: row.escalated ? ['true', '1'].includes(row.escalated.toLowerCase()) : false,
      escalation_date: row.escalation_date ? moment(row.escalation_date) : null,
      satisfaction_score: row.satisfaction_score ? parseInt(row.satisfaction_score) : null,
      // Add the new Intercom fields
      teammate_first_replied: row.teammate_first_replied ? row.teammate_first_replied.trim() : null,
      teammate_replied_to: row.teammate_replied_to ? row.teammate_replied_to.trim() : null,
      company_name: row.company_name ? row.company_name.trim() : null,
      first_response_time_seconds: row.first_response_time_seconds ? parseInt(row.first_response_time_seconds) : null,
      time_to_close_seconds: row.time_to_close_seconds ? parseInt(row.time_to_close_seconds) : null,
      replies_sent: row.replies_sent ? parseInt(row.replies_sent) : null
    };
  }

  async validateFile(filePath) {
    try {
      await this.parseFile(filePath);
      return { isValid: true, message: 'File is valid!' };
    } catch (error) {
      if (error.type === 'validation') {
        return {
          isValid: false,
          errors: error.errors,
          ticketsProcessed: error.ticketsProcessed
        };
      } else {
        return {
          isValid: false,
          errors: [`Parsing error: ${error.error}`]
        };
      }
    }
  }
}

module.exports = CSVParser;