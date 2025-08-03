const moment = require('moment');
const fs = require('fs');

class SampleGenerator {
  constructor() {
    this.teams = ['Technical', 'Billing', 'General', 'Sales'];
    this.categories = ['Bug', 'Feature Request', 'Question', 'Account Issue', 'Technical Issue'];
    this.priorities = ['Low', 'Medium', 'High', 'Critical'];
    this.statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
    this.customerTiers = ['Free', 'Pro', 'Enterprise'];
    this.teamMembers = [
      'john.doe@company.com',
      'jane.smith@company.com', 
      'mike.wilson@company.com',
      'sarah.jones@company.com',
      'david.brown@company.com',
      'lisa.davis@company.com'
    ];
  }

  generateSampleData(numTickets = 100, startDate = null, endDate = null) {
    const tickets = [];
    const startMoment = startDate ? moment(startDate) : moment().subtract(30, 'days');
    const endMoment = endDate ? moment(endDate) : moment();
    
    for (let i = 1; i <= numTickets; i++) {
      const ticket = this.generateTicket(i, startMoment, endMoment);
      tickets.push(ticket);
    }
    
    return tickets;
  }

  generateTicket(id, startDate, endDate) {
    const createdDate = this.randomDateBetween(startDate, endDate);
    const priority = this.randomChoice(this.priorities);
    const status = this.randomChoice(this.statuses);
    const category = this.randomChoice(this.categories);
    const team = this.randomChoice(this.teams);
    const assignedTo = this.randomChoice(this.teamMembers);
    const customerTier = this.randomChoice(this.customerTiers);
    
    // Generate response time (1-24 hours)
    const responseHours = Math.random() * 24;
    const firstResponseDate = createdDate.clone().add(responseHours, 'hours');
    
    // Generate resolution date for resolved/closed tickets
    let resolutionDate = null;
    if (status === 'Resolved' || status === 'Closed') {
      const resolutionHours = responseHours + (Math.random() * 48) + 2; // 2-72 hours after creation
      resolutionDate = createdDate.clone().add(resolutionHours, 'hours');
    }
    
    // Escalation logic (10% chance)
    const escalated = Math.random() < 0.1;
    let escalationDate = null;
    if (escalated) {
      const escalationHours = Math.random() * 12; // Within 12 hours
      escalationDate = createdDate.clone().add(escalationHours, 'hours');
    }
    
    // Satisfaction score (80% chance of having one, 1-5 range)
    const satisfactionScore = Math.random() < 0.8 ? Math.floor(Math.random() * 5) + 1 : null;
    
    return {
      ticket_id: `T-2024-${String(id).padStart(3, '0')}`,
      created_date: createdDate.toISOString(),
      assigned_to: assignedTo,
      priority: priority,
      status: status,
      first_response_date: firstResponseDate.toISOString(),
      resolution_date: resolutionDate ? resolutionDate.toISOString() : '',
      category: category,
      team: team,
      customer_tier: customerTier,
      escalated: escalated,
      escalation_date: escalationDate ? escalationDate.toISOString() : '',
      satisfaction_score: satisfactionScore || ''
    };
  }

  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  randomDateBetween(start, end) {
    const startTime = start.valueOf();
    const endTime = end.valueOf();
    const randomTime = startTime + Math.random() * (endTime - startTime);
    return moment(randomTime);
  }

  generateCSV(tickets) {
    const headers = [
      'ticket_id',
      'created_date', 
      'assigned_to',
      'priority',
      'status',
      'first_response_date',
      'resolution_date',
      'category',
      'team',
      'customer_tier',
      'escalated',
      'escalation_date',
      'satisfaction_score'
    ];
    
    let csv = headers.join(',') + '\n';
    
    tickets.forEach(ticket => {
      const row = headers.map(header => {
        const value = ticket[header];
        // Wrap in quotes if contains comma or is empty
        if (typeof value === 'string' && (value.includes(',') || value === '')) {
          return `"${value}"`;
        }
        return value;
      }).join(',');
      
      csv += row + '\n';
    });
    
    return csv;
  }

  async generateSampleFile(outputPath, numTickets = 100) {
    const tickets = this.generateSampleData(numTickets);
    const csv = this.generateCSV(tickets);
    
    return new Promise((resolve, reject) => {
      fs.writeFile(outputPath, csv, 'utf8', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            ticketsGenerated: numTickets,
            filePath: outputPath,
            fileSize: csv.length
          });
        }
      });
    });
  }
}

module.exports = SampleGenerator;