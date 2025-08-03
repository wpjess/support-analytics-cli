# Support Analytics CLI

**Transform your Intercom support data into actionable business intelligence.**

A powerful command-line tool that converts messy Intercom CSV exports into comprehensive support team analytics, providing the insights you need to optimize team performance, workload distribution, and customer satisfaction.

![CLI Demo](https://img.shields.io/badge/CLI-Ready-green) ![Node.js](https://img.shields.io/badge/Node.js-18+-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 Why This Tool Exists

This tool transforms raw support data into actionable analytics that  help you manage and optimize your support operations.

**Built with AI assistance using Claude Code** - showcasing the power of AI-driven development for solving real business problems.

## ✨ Key Features

### 📊 Comprehensive Analytics Reports
- **Weekly Ticket Volume Trends** - Identify patterns and plan capacity
- **Response Time Analysis** - Track team performance with detailed breakdowns
- **Resolution Time Analytics** - Monitor efficiency by priority and category
- **Team Performance Metrics** - Compare resolution rates and satisfaction scores
- **Workload Distribution** - Identify bottlenecks and balance assignments
- **Escalation Pattern Analysis** - Understand when and why tickets escalate

### 🔄 Smart Data Transformation
- **Direct Intercom Integration** - Works with real Intercom CSV exports
- **Intelligent Field Mapping** - Automatically converts Intercom fields to standardized schema
- **Data Validation** - Comprehensive error checking and data quality assurance
- **Flexible Processing** - Handles missing data and edge cases gracefully

### 🛠️ Professional CLI Experience
- **Intuitive Commands** - Simple, clear interface for all operations
- **Visual Output** - Color-coded reports with progress bars and charts
- **Multiple Formats** - Console output optimized for readability
- **Validation Tools** - Built-in data integrity checking

## 🏁 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/wpjess/support-analytics-cli.git
cd support-analytics-cli

# Install dependencies
npm install

# Verify installation
node index.js --help
```

### Basic Usage

```bash
# 1. Generate sample data to test
node index.js sample -n 100

# 2. Transform your Intercom export
node index.js transform -i your-intercom-export.csv -o tickets.csv

# 3. Generate analytics reports
node index.js analyze -f tickets.csv

# 4. Generate specific reports
node index.js analyze -f tickets.csv -r workload
node index.js analyze -f tickets.csv -r performance
```

## 📈 Real Results

Here's what the tool reveals from actual support data:

```
📊 WEEKLY TICKET VOLUME TRENDS
Jul 29, 2025    1 ██████████████████████████████████████████████ 137
Jul 27, 2025    - 
Total Tickets: 138
Average Weekly: 69
Peak Week: 137 tickets

⏱️  AVERAGE RESPONSE TIMES BY TEAM MEMBER
Member              Avg Hours    Tickets    Range
Unassigned         3.62h       84         1.4h
Team Average: 3.62h
Best Performer: Unassigned

🏆 TEAM PERFORMANCE METRICS
Team              Resolution    Avg Response    Satisfaction
Customer Success  82.37%       4.29h         4.91/5
Operations        100%         5.63h        5/5
```

*Results from transforming 138 real Intercom support tickets*

## 🔧 Available Commands

### Core Operations
```bash
# Data transformation
node index.js transform -i <input.csv> -o <output.csv> [options]
  --dry-run              Preview transformation without creating files
  --ignore-errors        Continue processing despite validation errors
  --validate-output      Automatically validate transformed data

# Analytics generation
node index.js analyze -f <file.csv> [options]
  -r, --report <type>    Generate specific report type
  -f, --file <path>      Input CSV file path

# Data validation
node index.js validate -f <file.csv>

# Sample data generation
node index.js sample -n <count>
```

### Report Types
- `volume` - Weekly ticket volume trends
- `response` - Response time analysis by team member  
- `resolution` - Resolution time breakdown by priority/category
- `performance` - Team performance metrics and satisfaction scores
- `workload` - Current workload distribution and overdue tickets
- `escalation` - Priority escalation patterns and rates

## 📋 Data Schema

### Intercom Integration
The tool seamlessly handles Intercom CSV exports with automatic field mapping:

| Intercom Field | Mapped To | Purpose |
|---|---|---|
| `Conversation ID` | `ticket_id` | Unique identifier |
| `Conversation created at` | `created_date` | Ticket creation timestamp |
| `Teammate currently assigned` | `assigned_to` | Current assignee |
| `Conversation priority` | `priority` | Priority level (Low/Medium/High/Critical) |
| `Current conversation state` | `status` | Status (Open/In Progress/Resolved/Closed) |
| `Topics` | `category` | Issue categorization |
| `Team currently assigned` | `team` | Assigned team |
| `Last teammate rating` | `satisfaction_score` | Customer satisfaction (1-5) |

### Smart Data Handling
- **Timezone Conversion**: America/Vancouver → UTC
- **Priority Normalization**: Maps various Intercom values to standard levels
- **Status Mapping**: Converts Intercom states to workflow-appropriate statuses
- **Missing Value Handling**: Intelligent defaults for incomplete data

## 🏗️ Architecture

```
support-analytics-cli/
├── index.js                 # Main CLI entry point
├── lib/
│   ├── analytics.js         # Core analytics engine
│   ├── consoleFormatter.js  # Report formatting and visualization
│   ├── csvParser.js         # CSV parsing and validation
│   ├── intercomTransformer.js # Intercom data transformation
│   └── sampleGenerator.js   # Sample data generation
├── schema.md               # Data schema documentation
└── package.json           # Dependencies and scripts
```

## 🚀 Built with AI-Assisted Development

This project was developed using **Claude Code**, demonstrating the power of AI-assisted development for solving real business problems. The development process showcased:

- **Iterative Problem Solving** - AI helping adapt to real-world data inconsistencies
- **Domain Expertise Integration** - Leveraging 20+ years of support management experience
- **Professional Development Practices** - Clean code, error handling, and comprehensive testing
- **Real-World Data Challenges** - Handling messy Intercom exports and edge cases

### Development Highlights
- Built complete CLI tool from concept to production in hours
- Solved complex data transformation challenges iteratively
- Implemented robust error handling and validation
- Created professional user experience with visual feedback

## 🛣️ Roadmap

### Planned Features
- [ ] HTML report generation with charts and graphs
- [ ] Direct Intercom API integration (bypass CSV export)
- [ ] Custom report templates and scheduling
- [ ] Multi-format export (PDF, Excel, JSON)
- [ ] Historical trend analysis and forecasting
- [ ] Integration with other support platforms (Zendesk, Freshdesk)

### Potential Integrations
- [ ] Slack notifications for critical metrics
- [ ] Dashboard web interface
- [ ] Database storage for historical analysis
- [ ] REST API for programmatic access

## 🤝 Use Cases

**For Support Managers:**
- Weekly team performance reviews
- Capacity planning and resource allocation
- Identifying training needs and process improvements
- Customer satisfaction trend analysis

**For Operations Teams:**
- Workload balancing and bottleneck identification
- SLA compliance monitoring
- Escalation pattern analysis
- Quality assurance insights

**For Leadership:**
- High-level performance dashboards
- ROI analysis for support investments
- Customer health indicators
- Strategic planning data

## 📊 Business Impact

This tool transforms hours of manual data analysis into seconds of automated insight generation:

- **Time Savings**: Reduce weekly reporting from 4+ hours to 5 minutes
- **Data Accuracy**: Eliminate manual calculation errors
- **Actionable Insights**: Focus on what matters for team performance
- **Scalable Analysis**: Handle datasets from dozens to thousands of tickets
- **Consistent Reporting**: Standardized metrics across time periods

## 🛡️ Data Privacy

- **Local Processing**: All data transformation happens on your machine
- **No Data Transmission**: Your support data never leaves your environment
- **CSV-Based**: Works with standard data exports, no API keys required
- **Open Source**: Full transparency in data handling

## 📝 License

MIT License - see LICENSE file for details.

## 🙋‍♂️ About

Created by [Jess Nunez](https://github.com/wpjess) - Support Director with 20+ years of experience in customer success, technical support, and team management. 

**Built to solve real problems with real data.**

- 📧 Email:  contact@jessnunez.com
- 🌐 Website: [jessnunez.com](https://jessnunez.com)
- 💼 LinkedIn: [Connect with me](https://linkedin.com/in/jessnunez)

---

*If this tool helps your support team, please ⭐ star the repository and share your success story!*
