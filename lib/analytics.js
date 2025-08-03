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

  // Average response times by team member
  getResponseTimeAnalysis() {
    const memberStats = {};
    
    this.tickets.forEach(ticket => {
      if (ticket.first_response_date) {
        const responseTime = ticket.first_response_date.diff(ticket.created_date, 'hours', true);
        
        if (!memberStats[ticket.assigned_to]) {
          memberStats[ticket.assigned_to] = {
            responseTimes: [],
            totalTickets: 0
          };
        }
        
        memberStats[ticket.assigned_to].responseTimes.push(responseTime);
        memberStats[ticket.assigned_to].totalTickets++;
      }
    });

    const analysis = Object.keys(memberStats).map(member => {
      const times = memberStats[member].responseTimes;
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      
      return {
        member,
        averageResponseHours: Math.round(avgTime * 100) / 100,
        totalTickets: memberStats[member].totalTickets,
        fastestResponse: Math.min(...times),
        slowestResponse: Math.max(...times)
      };
    }).sort((a, b) => a.averageResponseHours - b.averageResponseHours);

    return {
      type: 'Response Time Analysis',
      data: analysis,
      summary: {
        teamAverage: Math.round((analysis.reduce((sum, member) => sum + member.averageResponseHours, 0) / analysis.length) * 100) / 100,
        bestPerformer: analysis[0]?.member,
        worstPerformer: analysis[analysis.length - 1]?.member
      }
    };
  }

  // Resolution time analysis
  getResolutionAnalysis() {
    const resolvedTickets = this.tickets.filter(ticket => ticket.resolution_date);
    
    const resolutionTimes = resolvedTickets.map(ticket => {
      const resolutionTime = ticket.resolution_date.diff(ticket.created_date, 'hours', true);
      return {
        ticket_id: ticket.ticket_id,
        priority: ticket.priority,
        category: ticket.category,
        resolutionHours: Math.round(resolutionTime * 100) / 100
      };
    });

    const byPriority = {};
    const byCategory = {};
    
    resolutionTimes.forEach(ticket => {
      // By priority
      if (!byPriority[ticket.priority]) {
        byPriority[ticket.priority] = [];
      }
      byPriority[ticket.priority].push(ticket.resolutionHours);
      
      // By category
      if (!byCategory[ticket.category]) {
        byCategory[ticket.category] = [];
      }
      byCategory[ticket.category].push(ticket.resolutionHours);
    });

    const priorityAnalysis = Object.keys(byPriority).map(priority => ({
      priority,
      averageHours: Math.round((byPriority[priority].reduce((a, b) => a + b, 0) / byPriority[priority].length) * 100) / 100,
      count: byPriority[priority].length
    }));

    const categoryAnalysis = Object.keys(byCategory).map(category => ({
      category,
      averageHours: Math.round((byCategory[category].reduce((a, b) => a + b, 0) / byCategory[category].length) * 100) / 100,
      count: byCategory[category].length
    }));

    return {
      type: 'Resolution Time Analysis',
      data: {
        byPriority: priorityAnalysis,
        byCategory: categoryAnalysis
      },
      summary: {
        totalResolved: resolvedTickets.length,
        overallAverage: Math.round((resolutionTimes.reduce((sum, ticket) => sum + ticket.resolutionHours, 0) / resolutionTimes.length) * 100) / 100,
        resolutionRate: Math.round((resolvedTickets.length / this.tickets.length) * 100)
      }
    };
  }

  // Team performance metrics
  getPerformanceAnalysis() {
    const teamStats = {};
    
    this.tickets.forEach(ticket => {
      if (!teamStats[ticket.team]) {
        teamStats[ticket.team] = {
          totalTickets: 0,
          resolvedTickets: 0,
          responseTimes: [],
          resolutionTimes: [],
          satisfactionScores: []
        };
      }
      
      const team = teamStats[ticket.team];
      team.totalTickets++;
      
      if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
        team.resolvedTickets++;
      }
      
      if (ticket.first_response_date) {
        team.responseTimes.push(ticket.first_response_date.diff(ticket.created_date, 'hours', true));
      }
      
      if (ticket.resolution_date) {
        team.resolutionTimes.push(ticket.resolution_date.diff(ticket.created_date, 'hours', true));
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
        resolutionRate: Math.round((team.resolvedTickets / team.totalTickets) * 100),
        avgResponseTime: team.responseTimes.length > 0 ? 
          Math.round((team.responseTimes.reduce((a, b) => a + b, 0) / team.responseTimes.length) * 100) / 100 : 0,
        avgResolutionTime: team.resolutionTimes.length > 0 ? 
          Math.round((team.resolutionTimes.reduce((a, b) => a + b, 0) / team.resolutionTimes.length) * 100) / 100 : 0,
        avgSatisfaction: team.satisfactionScores.length > 0 ?
          Math.round((team.satisfactionScores.reduce((a, b) => a + b, 0) / team.satisfactionScores.length) * 100) / 100 : 0
      };
    });

    return {
      type: 'Team Performance Analysis',
      data: analysis,
      summary: {
        totalTeams: analysis.length,
        bestResolutionRate: Math.max(...analysis.map(t => t.resolutionRate)),
        bestResponseTime: Math.min(...analysis.filter(t => t.avgResponseTime > 0).map(t => t.avgResponseTime)),
        highestSatisfaction: Math.max(...analysis.filter(t => t.avgSatisfaction > 0).map(t => t.avgSatisfaction))
      }
    };
  }

  // Workload distribution
  getWorkloadAnalysis() {
    const memberWorkload = {};
    const currentDate = moment();
    
    this.tickets.forEach(ticket => {
      if (!memberWorkload[ticket.assigned_to]) {
        memberWorkload[ticket.assigned_to] = {
          total: 0,
          open: 0,
          inProgress: 0,
          resolved: 0,
          overdue: 0,
          priorities: { Low: 0, Medium: 0, High: 0, Critical: 0 }
        };
      }
      
      const member = memberWorkload[ticket.assigned_to];
      member.total++;
      member.priorities[ticket.priority]++;
      
      switch (ticket.status) {
        case 'Open':
          member.open++;
          break;
        case 'In Progress':
          member.inProgress++;
          break;
        case 'Resolved':
        case 'Closed':
          member.resolved++;
          break;
      }
      
      // Check if overdue (more than 48 hours for open tickets)
      if ((ticket.status === 'Open' || ticket.status === 'In Progress') &&
          currentDate.diff(ticket.created_date, 'hours') > 48) {
        member.overdue++;
      }
    });

    const analysis = Object.keys(memberWorkload).map(member => ({
      member,
      ...memberWorkload[member],
      workloadScore: memberWorkload[member].total + (memberWorkload[member].priorities.Critical * 3) + (memberWorkload[member].priorities.High * 2)
    })).sort((a, b) => b.workloadScore - a.workloadScore);

    return {
      type: 'Workload Distribution Analysis',
      data: analysis,
      summary: {
        totalMembers: analysis.length,
        averageWorkload: Math.round(analysis.reduce((sum, member) => sum + member.total, 0) / analysis.length),
        mostBusy: analysis[0]?.member,
        totalOverdue: analysis.reduce((sum, member) => sum + member.overdue, 0)
      }
    };
  }

  // Priority escalation patterns  
  getEscalationAnalysis() {
    const escalatedTickets = this.tickets.filter(ticket => ticket.escalated);
    
    const escalationsByTeam = {};
    const escalationsByPriority = {};
    const escalationsByCategory = {};
    
    escalatedTickets.forEach(ticket => {
      // By team
      escalationsByTeam[ticket.team] = (escalationsByTeam[ticket.team] || 0) + 1;
      
      // By priority
      escalationsByPriority[ticket.priority] = (escalationsByPriority[ticket.priority] || 0) + 1;
      
      // By category
      escalationsByCategory[ticket.category] = (escalationsByCategory[ticket.category] || 0) + 1;
    });

    const timeToEscalation = escalatedTickets
      .filter(ticket => ticket.escalation_date)
      .map(ticket => ({
        ticket_id: ticket.ticket_id,
        hoursToEscalation: ticket.escalation_date.diff(ticket.created_date, 'hours', true)
      }));

    return {
      type: 'Escalation Pattern Analysis',
      data: {
        byTeam: Object.keys(escalationsByTeam).map(team => ({
          team,
          escalations: escalationsByTeam[team],
          rate: Math.round((escalationsByTeam[team] / this.tickets.filter(t => t.team === team).length) * 100)
        })),
        byPriority: Object.keys(escalationsByPriority).map(priority => ({
          priority,
          escalations: escalationsByPriority[priority],
          rate: Math.round((escalationsByPriority[priority] / this.tickets.filter(t => t.priority === priority).length) * 100)
        })),
        byCategory: Object.keys(escalationsByCategory).map(category => ({
          category,
          escalations: escalationsByCategory[category],
          rate: Math.round((escalationsByCategory[category] / this.tickets.filter(t => t.category === category).length) * 100)
        }))
      },
      summary: {
        totalEscalations: escalatedTickets.length,
        escalationRate: Math.round((escalatedTickets.length / this.tickets.length) * 100),
        avgTimeToEscalation: timeToEscalation.length > 0 ? 
          Math.round((timeToEscalation.reduce((sum, item) => sum + item.hoursToEscalation, 0) / timeToEscalation.length) * 100) / 100 : 0
      }
    };
  }

  // Generate all reports
  generateAllReports() {
    return {
      volume: this.getVolumeAnalysis(),
      response: this.getResponseTimeAnalysis(),
      resolution: this.getResolutionAnalysis(),
      performance: this.getPerformanceAnalysis(),
      workload: this.getWorkloadAnalysis(),
      escalation: this.getEscalationAnalysis()
    };
  }
}

module.exports = AnalyticsEngine;