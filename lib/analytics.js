const moment = require('moment');

class AnalyticsEngine {
  constructor(tickets) {
    this.tickets = tickets;
  }

  // Weekly ticket volume trends
  getVolumeAnalysis() {
    const weeklyVolume = {};
    
    this.tickets.forEach(ticket => {
      const week = ticket.created_date.startOf('week').format('YYYY-MM-DD');
      weeklyVolume[week] = (weeklyVolume[week] || 0) + 1;
    });

    const weeks = Object.keys(weeklyVolume).sort();
    const volumes = weeks.map(week => weeklyVolume[week]);
    
    return {
      type: 'Volume Analysis',
      data: weeks.map((week, index) => ({
        week: moment(week).format('MMM DD, YYYY'),
        tickets: volumes[index]
      })),
      summary: {
        totalTickets: this.tickets.length,
        averageWeekly: Math.round(volumes.reduce((a, b) => a + b, 0) / volumes.length),
        peakWeek: weeks[volumes.indexOf(Math.max(...volumes))],
        peakVolume: Math.max(...volumes)
      }
    };
  }

  // First response times by teammate who first replied using Intercom's calculated seconds
  getFirstResponseTimeAnalysis() {
    const memberStats = {};
    
    this.tickets.forEach(ticket => {
      if (ticket.first_response_time_seconds && ticket.teammate_first_replied && 
          ticket.first_response_time_seconds !== '' && ticket.teammate_first_replied !== '') {
        const responseTimeSeconds = parseInt(ticket.first_response_time_seconds);
        
        if (!isNaN(responseTimeSeconds)) {
          if (!memberStats[ticket.teammate_first_replied]) {
            memberStats[ticket.teammate_first_replied] = {
              responseTimes: [],
              totalTickets: 0
            };
          }
          
          memberStats[ticket.teammate_first_replied].responseTimes.push(responseTimeSeconds);
          memberStats[ticket.teammate_first_replied].totalTickets++;
        }
      }
    });

    const analysis = Object.keys(memberStats).map(member => {
      const times = memberStats[member].responseTimes;
      const avgTimeSeconds = times.reduce((a, b) => a + b, 0) / times.length;
      const avgTimeHours = avgTimeSeconds / 3600;
      
      return {
        member,
        averageResponseSeconds: Math.round(avgTimeSeconds),
        averageResponseHours: Math.round(avgTimeHours * 100) / 100,
        totalTickets: memberStats[member].totalTickets,
        fastestResponseSeconds: Math.min(...times),
        slowestResponseSeconds: Math.max(...times),
        fastestResponse: Math.round((Math.min(...times) / 3600) * 100) / 100,
        slowestResponse: Math.round((Math.max(...times) / 3600) * 100) / 100
      };
    }).sort((a, b) => a.averageResponseSeconds - b.averageResponseSeconds);

    return {
      type: 'First Response Time by Teammate',
      data: analysis,
      summary: {
        teamAverageSeconds: analysis.length > 0 ? Math.round(analysis.reduce((sum, member) => sum + member.averageResponseSeconds, 0) / analysis.length) : 0,
        teamAverage: analysis.length > 0 ? Math.round((analysis.reduce((sum, member) => sum + member.averageResponseHours, 0) / analysis.length) * 100) / 100 : 0,
        bestPerformer: analysis[0]?.member,
        worstPerformer: analysis[analysis.length - 1]?.member
      }
    };
  }

  // Time to first response and time to close analysis using Intercom's calculated seconds
  getTimeAnalysis() {
    const responseMetrics = [];
    const resolutionMetrics = [];
    
    this.tickets.forEach(ticket => {
      // Time to first response from Intercom's calculated field
      if (ticket.first_response_time_seconds && ticket.first_response_time_seconds !== '') {
        const timeToResponse = parseInt(ticket.first_response_time_seconds);
        if (!isNaN(timeToResponse)) {
          responseMetrics.push({
            ticket_id: ticket.ticket_id,
            seconds: timeToResponse,
            hours: Math.round((timeToResponse / 3600) * 100) / 100,
            hoursMinutes: this.formatHoursMinutes(timeToResponse)
          });
        }
      }
      
      // Time to close from Intercom's calculated field
      if (ticket.time_to_close_seconds && ticket.time_to_close_seconds !== '') {
        const timeToClose = parseInt(ticket.time_to_close_seconds);
        if (!isNaN(timeToClose)) {
          resolutionMetrics.push({
            ticket_id: ticket.ticket_id,
            seconds: timeToClose,
            hours: Math.round((timeToClose / 3600) * 100) / 100,
            hoursMinutes: this.formatHoursMinutes(timeToClose)
          });
        }
      }
    });

    const avgResponseTime = responseMetrics.length > 0 ? 
      Math.round(responseMetrics.reduce((sum, metric) => sum + metric.seconds, 0) / responseMetrics.length) : 0;
    
    const avgResolutionTime = resolutionMetrics.length > 0 ?
      Math.round(resolutionMetrics.reduce((sum, metric) => sum + metric.seconds, 0) / resolutionMetrics.length) : 0;

    return {
      type: 'Response and Resolution Time Analysis',
      data: {
        firstResponse: {
          count: responseMetrics.length,
          averageSeconds: avgResponseTime,
          averageHours: Math.round((avgResponseTime / 3600) * 100) / 100,
          averageHoursMinutes: this.formatHoursMinutes(avgResponseTime),
          fastestSeconds: responseMetrics.length > 0 ? Math.min(...responseMetrics.map(m => m.seconds)) : 0,
          slowestSeconds: responseMetrics.length > 0 ? Math.max(...responseMetrics.map(m => m.seconds)) : 0
        },
        timeToClose: {
          count: resolutionMetrics.length,
          averageSeconds: avgResolutionTime,
          averageHours: Math.round((avgResolutionTime / 3600) * 100) / 100,
          averageHoursMinutes: this.formatHoursMinutes(avgResolutionTime),
          fastestSeconds: resolutionMetrics.length > 0 ? Math.min(...resolutionMetrics.map(m => m.seconds)) : 0,
          slowestSeconds: resolutionMetrics.length > 0 ? Math.max(...resolutionMetrics.map(m => m.seconds)) : 0
        }
      },
      summary: {
        totalTickets: this.tickets.length,
        ticketsWithResponse: responseMetrics.length,
        ticketsResolved: resolutionMetrics.length,
        responseRate: Math.round((responseMetrics.length / this.tickets.length) * 100),
        resolutionRate: Math.round((resolutionMetrics.length / this.tickets.length) * 100)
      }
    };
  }

  // Helper function to format seconds into hours and minutes
  formatHoursMinutes(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  // Team performance metrics (excluding Unassigned teams)
  getPerformanceAnalysis() {
    const teamStats = {};
    
    this.tickets.forEach(ticket => {
      // Skip unassigned teams
      if (ticket.team === 'Unassigned') {
        return;
      }
      
      if (!teamStats[ticket.team]) {
        teamStats[ticket.team] = {
          totalTickets: 0,
          repliesSent: [],
          satisfactionScores: []
        };
      }
      
      const team = teamStats[ticket.team];
      team.totalTickets++;
      
      if (ticket.replies_sent && ticket.replies_sent !== '') {
        const replies = parseInt(ticket.replies_sent);
        if (!isNaN(replies)) {
          team.repliesSent.push(replies);
        }
      }
      
      if (ticket.satisfaction_score) {
        team.satisfactionScores.push(ticket.satisfaction_score);
      }
    });

    const analysis = Object.keys(teamStats).map(teamName => {
      const team = teamStats[teamName];
      
      return {
        team: teamName,
        totalTickets: team.totalTickets,
        totalReplies: team.repliesSent.reduce((sum, replies) => sum + replies, 0),
        avgRepliesPerTicket: team.repliesSent.length > 0 ? 
          Math.round((team.repliesSent.reduce((sum, replies) => sum + replies, 0) / team.repliesSent.length) * 100) / 100 : 0,
        avgSatisfaction: team.satisfactionScores.length > 0 ?
          Math.round((team.satisfactionScores.reduce((a, b) => a + b, 0) / team.satisfactionScores.length) * 100) / 100 : 0
      };
    });

    return {
      type: 'Team Performance Analysis',
      data: analysis,
      summary: {
        totalTeams: analysis.length,
        totalRepliesAllTeams: analysis.reduce((sum, team) => sum + team.totalReplies, 0),
        highestAvgReplies: analysis.length > 0 ? Math.max(...analysis.map(t => t.avgRepliesPerTicket)) : 0,
        highestSatisfaction: analysis.filter(t => t.avgSatisfaction > 0).length > 0 ? Math.max(...analysis.filter(t => t.avgSatisfaction > 0).map(t => t.avgSatisfaction)) : 0
      }
    };
  }

  // Workload distribution using teammate_replied_to field (single users only)
  getWorkloadAnalysis() {
    const memberWorkload = {};
    
    this.tickets.forEach(ticket => {
      // Use teammate_replied_to field instead of assigned_to
      const assignedMembers = ticket.teammate_replied_to || 'Unassigned';
      
      // Only include single users, skip comma-separated lists
      if (assignedMembers.includes(',')) {
        return; // Skip tickets with multiple assignees
      }
      
      if (!memberWorkload[assignedMembers]) {
        memberWorkload[assignedMembers] = {
          total: 0
        };
      }
      
      memberWorkload[assignedMembers].total++;
    });

    const analysis = Object.keys(memberWorkload).map(member => ({
      member,
      total: memberWorkload[member].total
    })).sort((a, b) => b.total - a.total);

    return {
      type: 'Workload Distribution Analysis',
      data: analysis,
      summary: {
        totalMembers: analysis.length,
        averageWorkload: analysis.length > 0 ? Math.round(analysis.reduce((sum, member) => sum + member.total, 0) / analysis.length) : 0,
        mostBusy: analysis[0]?.member
      }
    };
  }

  // Company ticket volume analysis (excluding Unknown Company)
  getCompanyAnalysis() {
    const companyStats = {};
    
    this.tickets.forEach(ticket => {
      const company = ticket.company_name;
      
      // Skip tickets without company name or with "Unknown Company"
      if (!company || company.trim() === '' || company === 'Unknown Company') {
        return;
      }
      
      if (!companyStats[company]) {
        companyStats[company] = {
          ticketCount: 0
        };
      }
      
      companyStats[company].ticketCount++;
    });

    const analysis = Object.keys(companyStats)
      .map(company => ({
        company,
        ticketCount: companyStats[company].ticketCount
      }))
      .sort((a, b) => b.ticketCount - a.ticketCount);

    return {
      type: 'Company Ticket Volume Analysis',
      data: analysis,
      summary: {
        totalCompanies: analysis.length,
        totalTickets: analysis.reduce((sum, company) => sum + company.ticketCount, 0),
        topCompany: analysis[0]?.company,
        topCompanyTickets: analysis[0]?.ticketCount || 0,
        averageTicketsPerCompany: analysis.length > 0 ? Math.round(analysis.reduce((sum, company) => sum + company.ticketCount, 0) / analysis.length) : 0
      }
    };
  }

  // Generate all reports
  generateAllReports() {
    return {
      volume: this.getVolumeAnalysis(),
      firstResponse: this.getFirstResponseTimeAnalysis(),
      timeAnalysis: this.getTimeAnalysis(),
      performance: this.getPerformanceAnalysis(),
      workload: this.getWorkloadAnalysis(),
      companies: this.getCompanyAnalysis()
    };
  }
}

module.exports = AnalyticsEngine;