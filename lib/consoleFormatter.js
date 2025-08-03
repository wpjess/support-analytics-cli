const chalk = require('chalk');

class ConsoleFormatter {
  static formatVolumeReport(analysis) {
    console.log(chalk.blue.bold('\n📊 WEEKLY TICKET VOLUME TRENDS'));
    console.log(chalk.gray('═'.repeat(60)));
    
    analysis.data.forEach(item => {
      const bar = '█'.repeat(Math.floor(item.tickets / 5)) || '▁';
      console.log(`${chalk.cyan(item.week.padEnd(15))} ${chalk.green(bar)} ${chalk.white(item.tickets)}`);
    });
    
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.white(`Total Tickets: ${chalk.green(analysis.summary.totalTickets)}`));
    console.log(chalk.white(`Average Weekly: ${chalk.yellow(analysis.summary.averageWeekly)}`));
    console.log(chalk.white(`Peak Week: ${chalk.red(analysis.summary.peakVolume)} tickets`));
  }

  static formatResponseTimeReport(analysis) {
    console.log(chalk.blue.bold('\n⏱️  AVERAGE RESPONSE TIMES BY TEAM MEMBER'));
    console.log(chalk.gray('═'.repeat(80)));
    
    console.log(chalk.white(`${'Member'.padEnd(30)} ${'Avg Hours'.padEnd(12)} ${'Tickets'.padEnd(10)} ${'Range'.padEnd(20)}`));
    console.log(chalk.gray('─'.repeat(80)));
    
    analysis.data.forEach(member => {
      const avgColor = member.averageResponseHours < 2 ? chalk.green : 
                      member.averageResponseHours < 8 ? chalk.yellow : chalk.red;
      
      console.log(
        `${chalk.cyan(member.member.padEnd(30))} ` +
        `${avgColor(member.averageResponseHours.toString().padEnd(12))} ` +
        `${chalk.white(member.totalTickets.toString().padEnd(10))} ` +
        `${chalk.gray(`${member.fastestResponse.toFixed(1)}-${member.slowestResponse.toFixed(1)}h`)}`
      );
    });
    
    console.log(chalk.gray('─'.repeat(80)));
    console.log(chalk.white(`Team Average: ${chalk.yellow(analysis.summary.teamAverage)}h`));
    console.log(chalk.white(`Best Performer: ${chalk.green(analysis.summary.bestPerformer)}`));
  }

  static formatResolutionReport(analysis) {
    console.log(chalk.blue.bold('\n🔧 RESOLUTION TIME ANALYSIS'));
    console.log(chalk.gray('═'.repeat(60)));
    
    console.log(chalk.yellow('By Priority:'));
    analysis.data.byPriority.forEach(item => {
      const priorityColor = item.priority === 'Critical' ? chalk.red :
                           item.priority === 'High' ? chalk.magenta :
                           item.priority === 'Medium' ? chalk.yellow : chalk.green;
      
      console.log(`  ${priorityColor(item.priority.padEnd(10))} ${chalk.white(item.averageHours)}h avg (${item.count} tickets)`);
    });
    
    console.log(chalk.yellow('\nBy Category:'));
    analysis.data.byCategory.forEach(item => {
      console.log(`  ${chalk.cyan(item.category.padEnd(15))} ${chalk.white(item.averageHours)}h avg (${item.count} tickets)`);
    });
    
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.white(`Resolution Rate: ${chalk.green(analysis.summary.resolutionRate)}%`));
    console.log(chalk.white(`Overall Average: ${chalk.yellow(analysis.summary.overallAverage)}h`));
  }

  static formatPerformanceReport(analysis) {
    console.log(chalk.blue.bold('\n🏆 TEAM PERFORMANCE METRICS'));
    console.log(chalk.gray('═'.repeat(80)));
    
    console.log(chalk.white(`${'Team'.padEnd(20)} ${'Tickets'.padEnd(10)} ${'Replies Sent'.padEnd(15)} ${'Avg Replies'.padEnd(12)} ${'Satisfaction'.padEnd(12)}`));
    console.log(chalk.gray('─'.repeat(80)));
    
    analysis.data.forEach(team => {
      console.log(
        `${chalk.cyan(team.team.padEnd(20))} ` +
        `${chalk.white(team.totalTickets.toString().padEnd(10))} ` +
        `${chalk.green(team.totalReplies.toString().padEnd(15))} ` +
        `${chalk.white(team.avgRepliesPerTicket.toString().padEnd(12))} ` +
        `${team.avgSatisfaction > 0 ? chalk.yellow(team.avgSatisfaction + '/5') : chalk.gray('N/A')}`
      );
    });
    
    console.log(chalk.gray('─'.repeat(80)));
    console.log(chalk.white(`Total Replies All Teams: ${chalk.green(analysis.summary.totalRepliesAllTeams)}`));
    console.log(chalk.white(`Highest Avg Replies per Ticket: ${chalk.yellow(analysis.summary.highestAvgReplies)}`));
    if (analysis.summary.highestSatisfaction > 0) {
      console.log(chalk.white(`Highest Satisfaction: ${chalk.green(analysis.summary.highestSatisfaction)}/5`));
    }
  }

  static formatWorkloadReport(analysis) {
    console.log(chalk.blue.bold('\n⚖️  WORKLOAD DISTRIBUTION'));
    console.log(chalk.gray('═'.repeat(50)));
    
    console.log(chalk.white(`${'Member'.padEnd(30)} ${'Total'.padEnd(10)}`));
    console.log(chalk.gray('─'.repeat(50)));
    
    analysis.data.forEach(member => {
      console.log(
        `${chalk.cyan(member.member.padEnd(30))} ` +
        `${chalk.white(member.total.toString())}`
      );
    });
    
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.white(`Average Workload: ${chalk.yellow(analysis.summary.averageWorkload)} tickets`));
    console.log(chalk.white(`Most Busy: ${chalk.green(analysis.summary.mostBusy)}`));
  }

  static formatEscalationReport(analysis) {
    console.log(chalk.blue.bold('\n🚨 ESCALATION PATTERNS'));
    console.log(chalk.gray('═'.repeat(60)));
    
    console.log(chalk.yellow('By Team:'));
    analysis.data.byTeam.forEach(item => {
      const rateColor = item.rate > 15 ? chalk.red : item.rate > 10 ? chalk.yellow : chalk.green;
      console.log(`  ${chalk.cyan(item.team.padEnd(15))} ${item.escalations} escalations (${rateColor(item.rate + '%')})`);
    });
    
    console.log(chalk.yellow('\nBy Priority:'));
    analysis.data.byPriority.forEach(item => {
      const priorityColor = item.priority === 'Critical' ? chalk.red :
                           item.priority === 'High' ? chalk.magenta :
                           item.priority === 'Medium' ? chalk.yellow : chalk.green;
      
      console.log(`  ${priorityColor(item.priority.padEnd(10))} ${item.escalations} escalations (${item.rate}%)`);
    });
    
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.white(`Total Escalations: ${chalk.red(analysis.summary.totalEscalations)}`));
    console.log(chalk.white(`Escalation Rate: ${chalk.yellow(analysis.summary.escalationRate)}%`));
    if (analysis.summary.avgTimeToEscalation > 0) {
      console.log(chalk.white(`Avg Time to Escalation: ${chalk.cyan(analysis.summary.avgTimeToEscalation)}h`));
    }
  }

  static formatFirstResponseTimeReport(analysis) {
    console.log(chalk.blue.bold('\n⏱️  FIRST RESPONSE TIME BY TEAMMATE'));
    console.log(chalk.gray('═'.repeat(80)));
    
    if (analysis.data.length === 0) {
      console.log(chalk.yellow('No response time data available'));
      return;
    }
    
    console.log(chalk.white(`${'Teammate'.padEnd(30)} ${'Avg Hours'.padEnd(12)} ${'Tickets'.padEnd(10)} ${'Range'.padEnd(20)}`));
    console.log(chalk.gray('─'.repeat(80)));
    
    analysis.data.forEach(member => {
      const avgColor = member.averageResponseHours < 2 ? chalk.green : 
                      member.averageResponseHours < 8 ? chalk.yellow : chalk.red;
      
      console.log(
        `${chalk.cyan(member.member.padEnd(30))} ` +
        `${avgColor(member.averageResponseHours.toString().padEnd(12))} ` +
        `${chalk.white(member.totalTickets.toString().padEnd(10))} ` +
        `${chalk.gray(`${member.fastestResponse.toFixed(1)}-${member.slowestResponse.toFixed(1)}h`)}`
      );
    });
    
    console.log(chalk.gray('─'.repeat(80)));
    if (analysis.summary.teamAverage > 0) {
      console.log(chalk.white(`Team Average: ${chalk.yellow(analysis.summary.teamAverage)}h`));
      console.log(chalk.white(`Best Performer: ${chalk.green(analysis.summary.bestPerformer)}`));
    }
  }

  static formatTimeAnalysisReport(analysis) {
    console.log(chalk.blue.bold('\n🔧 RESPONSE AND RESOLUTION TIME ANALYSIS'));
    console.log(chalk.gray('═'.repeat(70)));
    
    console.log(chalk.yellow('First Response Times:'));
    console.log(`  Average: ${chalk.white(analysis.data.firstResponse.averageHoursMinutes)} (${chalk.cyan(analysis.data.firstResponse.averageSeconds)} seconds)`);
    console.log(`  Fastest: ${chalk.green(Math.round(analysis.data.firstResponse.fastestSeconds / 3600 * 100) / 100)}h`);
    console.log(`  Slowest: ${chalk.red(Math.round(analysis.data.firstResponse.slowestSeconds / 3600 * 100) / 100)}h`);
    console.log(`  Tickets with Response: ${chalk.white(analysis.data.firstResponse.count)}`);
    
    console.log(chalk.yellow('\nTime to Close:'));
    console.log(`  Average: ${chalk.white(analysis.data.timeToClose.averageHoursMinutes)} (${chalk.cyan(analysis.data.timeToClose.averageSeconds)} seconds)`);
    console.log(`  Fastest: ${chalk.green(Math.round(analysis.data.timeToClose.fastestSeconds / 3600 * 100) / 100)}h`);
    console.log(`  Slowest: ${chalk.red(Math.round(analysis.data.timeToClose.slowestSeconds / 3600 * 100) / 100)}h`);
    console.log(`  Tickets Resolved: ${chalk.white(analysis.data.timeToClose.count)}`);
    
    console.log(chalk.gray('─'.repeat(70)));
    console.log(chalk.white(`Response Rate: ${chalk.green(analysis.summary.responseRate)}%`));
    console.log(chalk.white(`Resolution Rate: ${chalk.green(analysis.summary.resolutionRate)}%`));
  }

  static formatCompanyReport(analysis) {
    console.log(chalk.blue.bold('\n🏢 COMPANY TICKET VOLUME'));
    console.log(chalk.gray('═'.repeat(60)));
    
    console.log(chalk.white(`${'Company'.padEnd(45)} ${'Tickets'.padEnd(10)}`));
    console.log(chalk.gray('─'.repeat(60)));
    
    // Show all companies (no limit)
    analysis.data.forEach(company => {
      console.log(
        `${chalk.cyan(company.company.substring(0, 43).padEnd(45))} ` +
        `${chalk.white(company.ticketCount.toString())}`
      );
    });
    
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.white(`Total Companies: ${chalk.cyan(analysis.summary.totalCompanies)}`));
    console.log(chalk.white(`Top Company: ${chalk.yellow(analysis.summary.topCompany)} (${analysis.summary.topCompanyTickets} tickets)`));
    console.log(chalk.white(`Average per Company: ${chalk.white(analysis.summary.averageTicketsPerCompany)} tickets`));
  }

  static formatAllReports(reports) {
    console.log(chalk.green.bold('\n🎯 SUPPORT TEAM ANALYTICS REPORT'));
    console.log(chalk.gray('Generated on: ' + new Date().toLocaleString()));
    
    if (reports.volume) this.formatVolumeReport(reports.volume);
    if (reports.firstResponse) this.formatFirstResponseTimeReport(reports.firstResponse);
    if (reports.timeAnalysis) this.formatTimeAnalysisReport(reports.timeAnalysis);
    if (reports.performance) this.formatPerformanceReport(reports.performance);
    if (reports.workload) this.formatWorkloadReport(reports.workload);
    if (reports.companies) this.formatCompanyReport(reports.companies);
    
    console.log(chalk.green.bold('\n✅ Report Complete!\n'));
  }

  static formatValidationErrors(errors, ticketsProcessed) {
    console.log(chalk.red.bold('\n❌ CSV VALIDATION ERRORS'));
    console.log(chalk.gray('═'.repeat(60)));
    
    errors.forEach(error => {
      console.log(chalk.red('• ' + error));
    });
    
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.yellow(`${ticketsProcessed} tickets processed successfully`));
    console.log(chalk.red(`${errors.length} validation errors found`));
  }

  static formatValidationSuccess(message) {
    console.log(chalk.green.bold('\n✅ VALIDATION SUCCESSFUL'));
    console.log(chalk.gray('═'.repeat(40)));
    console.log(chalk.green(message));
  }
}

module.exports = ConsoleFormatter;