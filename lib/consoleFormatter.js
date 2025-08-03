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
    console.log(chalk.gray('═'.repeat(90)));
    
    console.log(chalk.white(`${'Team'.padEnd(15)} ${'Tickets'.padEnd(10)} ${'Resolution'.padEnd(12)} ${'Avg Response'.padEnd(15)} ${'Avg Resolution'.padEnd(18)} ${'Satisfaction'.padEnd(12)}`));
    console.log(chalk.gray('─'.repeat(90)));
    
    analysis.data.forEach(team => {
      const resolutionColor = team.resolutionRate >= 80 ? chalk.green : 
                             team.resolutionRate >= 60 ? chalk.yellow : chalk.red;
      
      console.log(
        `${chalk.cyan(team.team.padEnd(15))} ` +
        `${chalk.white(team.totalTickets.toString().padEnd(10))} ` +
        `${resolutionColor(team.resolutionRate + '%').padEnd(12)} ` +
        `${chalk.white((team.avgResponseTime + 'h').padEnd(15))} ` +
        `${chalk.white((team.avgResolutionTime + 'h').padEnd(18))} ` +
        `${team.avgSatisfaction > 0 ? chalk.yellow(team.avgSatisfaction + '/5') : chalk.gray('N/A')}`
      );
    });
  }

  static formatWorkloadReport(analysis) {
    console.log(chalk.blue.bold('\n⚖️  WORKLOAD DISTRIBUTION'));
    console.log(chalk.gray('═'.repeat(80)));
    
    console.log(chalk.white(`${'Member'.padEnd(25)} ${'Total'.padEnd(8)} ${'Open'.padEnd(8)} ${'In Progress'.padEnd(12)} ${'Overdue'.padEnd(10)} ${'Score'.padEnd(8)}`));
    console.log(chalk.gray('─'.repeat(80)));
    
    analysis.data.forEach(member => {
      const overdueColor = member.overdue > 0 ? chalk.red : chalk.green;
      const workloadColor = member.workloadScore > 50 ? chalk.red :
                           member.workloadScore > 25 ? chalk.yellow : chalk.green;
      
      console.log(
        `${chalk.cyan(member.member.padEnd(25))} ` +
        `${chalk.white(member.total.toString().padEnd(8))} ` +
        `${chalk.white(member.open.toString().padEnd(8))} ` +
        `${chalk.white(member.inProgress.toString().padEnd(12))} ` +
        `${overdueColor(member.overdue.toString().padEnd(10))} ` +
        `${workloadColor(member.workloadScore.toString())}`
      );
    });
    
    console.log(chalk.gray('─'.repeat(80)));
    console.log(chalk.white(`Average Workload: ${chalk.yellow(analysis.summary.averageWorkload)} tickets`));
    console.log(chalk.white(`Total Overdue: ${chalk.red(analysis.summary.totalOverdue)} tickets`));
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

  static formatAllReports(reports) {
    console.log(chalk.green.bold('\n🎯 SUPPORT TEAM ANALYTICS REPORT'));
    console.log(chalk.gray('Generated on: ' + new Date().toLocaleString()));
    
    if (reports.volume) this.formatVolumeReport(reports.volume);
    if (reports.response) this.formatResponseTimeReport(reports.response);
    if (reports.resolution) this.formatResolutionReport(reports.resolution);
    if (reports.performance) this.formatPerformanceReport(reports.performance);
    if (reports.workload) this.formatWorkloadReport(reports.workload);
    if (reports.escalation) this.formatEscalationReport(reports.escalation);
    
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