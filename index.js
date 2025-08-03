#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const CSVParser = require('./lib/csvParser');
const AnalyticsEngine = require('./lib/analytics');
const ConsoleFormatter = require('./lib/consoleFormatter');
const SampleGenerator = require('./lib/sampleGenerator');
const IntercomTransformer = require('./lib/intercomTransformer');

const program = new Command();

program
  .name('support-analytics')
  .description('CLI tool for generating support team analytics reports')
  .version('1.0.0');

program
  .command('analyze')
  .description('Generate analytics reports from CSV data')
  .requiredOption('-f, --file <path>', 'Path to CSV file with ticket data')
  .option('-o, --output <format>', 'Output format (console, html, both)', 'console')
  .option('-r, --report <type>', 'Report type (all, volume, response, resolution, performance, workload, escalation)', 'all')
  .option('--html-output <path>', 'Path for HTML output file', './report.html')
  .action(async (options) => {
    console.log(chalk.blue('🔍 Analyzing support data...'));
    
    // Validate file exists
    if (!fs.existsSync(options.file)) {
      console.error(chalk.red('❌ Error: CSV file not found at'), options.file);
      process.exit(1);
    }
    
    console.log(chalk.green('📊 Processing file:'), options.file);
    console.log(chalk.yellow('📈 Report type:'), options.report);
    console.log(chalk.yellow('📄 Output format:'), options.output);
    
    try {
      const parser = new CSVParser();
      const tickets = await parser.parseFile(options.file);
      
      console.log(chalk.green(`✅ Successfully parsed ${tickets.length} tickets`));
      
      const analytics = new AnalyticsEngine(tickets);
      let reports = {};
      
      // Generate requested reports
      if (options.report === 'all') {
        reports = analytics.generateAllReports();
      } else {
        switch (options.report) {
          case 'volume':
            reports.volume = analytics.getVolumeAnalysis();
            break;
          case 'response':
            reports.response = analytics.getResponseTimeAnalysis();
            break;
          case 'resolution':
            reports.resolution = analytics.getResolutionAnalysis();
            break;
          case 'performance':
            reports.performance = analytics.getPerformanceAnalysis();
            break;
          case 'workload':
            reports.workload = analytics.getWorkloadAnalysis();
            break;
          case 'escalation':
            reports.escalation = analytics.getEscalationAnalysis();
            break;
          default:
            console.error(chalk.red('❌ Invalid report type:'), options.report);
            process.exit(1);
        }
      }
      
      // Output reports
      if (options.output === 'console' || options.output === 'both') {
        ConsoleFormatter.formatAllReports(reports);
      }
      
      if (options.output === 'html' || options.output === 'both') {
        console.log(chalk.yellow('⚠️  HTML output not yet implemented'));
      }
      
    } catch (error) {
      if (error.type === 'validation') {
        ConsoleFormatter.formatValidationErrors(error.errors, error.ticketsProcessed);
        process.exit(1);
      } else {
        console.error(chalk.red('❌ Error processing file:'), error.error || error.message);
        process.exit(1);
      }
    }
  });

program
  .command('validate')
  .description('Validate CSV file format and data integrity')
  .requiredOption('-f, --file <path>', 'Path to CSV file to validate')
  .action(async (options) => {
    console.log(chalk.blue('✅ Validating CSV format...'));
    
    if (!fs.existsSync(options.file)) {
      console.error(chalk.red('❌ Error: CSV file not found at'), options.file);
      process.exit(1);
    }
    
    try {
      const parser = new CSVParser();
      const result = await parser.validateFile(options.file);
      
      if (result.isValid) {
        ConsoleFormatter.formatValidationSuccess(result.message);
      } else {
        ConsoleFormatter.formatValidationErrors(result.errors, result.ticketsProcessed || 0);
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('❌ Validation error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('sample')
  .description('Generate a sample CSV file with dummy data')
  .option('-o, --output <path>', 'Output path for sample file', './sample-tickets.csv')
  .option('-n, --num-tickets <number>', 'Number of sample tickets to generate', '100')
  .action(async (options) => {
    console.log(chalk.blue('📝 Generating sample CSV file...'));
    
    try {
      const generator = new SampleGenerator();
      const numTickets = parseInt(options.numTickets);
      
      const result = await generator.generateSampleFile(options.output, numTickets);
      
      console.log(chalk.green('✅ Sample file generated successfully!'));
      console.log(chalk.white(`📁 File: ${result.filePath}`));
      console.log(chalk.white(`🎫 Tickets: ${result.ticketsGenerated}`));
      console.log(chalk.white(`📏 Size: ${(result.fileSize / 1024).toFixed(2)} KB`));
      
    } catch (error) {
      console.error(chalk.red('❌ Error generating sample file:'), error.message);
      process.exit(1);
    }
  });

program
  .command('transform')
  .description('Transform Intercom CSV export to support analytics format')
  .requiredOption('-i, --input <path>', 'Path to Intercom CSV file')
  .requiredOption('-o, --output <path>', 'Path for transformed CSV output')
  .option('--dry-run', 'Preview transformation without writing output file')
  .option('--ignore-errors', 'Continue processing despite transformation errors')
  .option('--validate-output', 'Validate transformed data against schema')
  .action(async (options) => {
    console.log(chalk.blue('🔄 Transforming Intercom CSV data...'));
    
    // Validate input file exists
    if (!fs.existsSync(options.input)) {
      console.error(chalk.red('❌ Error: Input file not found at'), options.input);
      process.exit(1);
    }
    
    console.log(chalk.green('📁 Input file:'), options.input);
    if (!options.dryRun) {
      console.log(chalk.green('📁 Output file:'), options.output);
    }
    
    try {
      const transformer = new IntercomTransformer();
      const result = await transformer.transformFile(options.input, options.output, {
        dryRun: options.dryRun,
        ignoreErrors: options.ignoreErrors
      });
      
      if (result.type === 'dry-run') {
        console.log(chalk.yellow('\n🔍 DRY RUN PREVIEW'));
        console.log(chalk.gray('═'.repeat(50)));
        console.log(chalk.white(`Rows processed: ${chalk.green(result.rowsProcessed)}`));
        
        if (result.errors.length > 0) {
          console.log(chalk.yellow(`Warnings/Errors: ${result.errors.length}`));
          result.errors.slice(0, 5).forEach(error => {
            console.log(chalk.yellow('  ⚠️  ' + error));
          });
          if (result.errors.length > 5) {
            console.log(chalk.gray(`  ... and ${result.errors.length - 5} more`));
          }
        }
        
        if (result.sample.length > 0) {
          console.log(chalk.cyan('\nSample transformed data (first row):'));
          const sample = result.sample[0];
          Object.keys(sample).forEach(key => {
            console.log(`  ${key}: ${chalk.white(sample[key])}`);
          });
        }
        
        console.log(chalk.blue('\n💡 Run without --dry-run to generate the transformed file'));
        
      } else {
        console.log(chalk.green('\n✅ Transformation completed successfully!'));
        console.log(chalk.gray('═'.repeat(50)));
        console.log(chalk.white(`📥 Input: ${result.inputFile}`));
        console.log(chalk.white(`📤 Output: ${result.outputFile}`));
        console.log(chalk.white(`🎫 Rows processed: ${chalk.green(result.rowsProcessed)}`));
        console.log(chalk.white(`📏 Output size: ${chalk.cyan((result.fileSize / 1024).toFixed(2))} KB`));
        
        if (result.errors.length > 0) {
          console.log(chalk.yellow(`⚠️  Warnings: ${result.errors.length}`));
          result.errors.slice(0, 3).forEach(error => {
            console.log(chalk.yellow('  • ' + error));
          });
        }
        
        // Auto-validate if requested
        if (options.validateOutput) {
          console.log(chalk.blue('\n🔍 Validating transformed data...'));
          try {
            const parser = new CSVParser();
            const validationResult = await parser.validateFile(options.output);
            
            if (validationResult.isValid) {
              console.log(chalk.green('✅ Transformed data passed validation!'));
            } else {
              console.log(chalk.red('❌ Validation failed:'));
              validationResult.errors.slice(0, 5).forEach(error => {
                console.log(chalk.red('  • ' + error));
              });
            }
          } catch (validationError) {
            console.log(chalk.red('❌ Validation error:'), validationError.message);
          }
        } else {
          console.log(chalk.gray('\n💡 Use --validate-output to check transformed data against schema'));
        }
      }
      
    } catch (error) {
      if (error.type === 'transformation') {
        console.log(chalk.red('\n❌ TRANSFORMATION ERRORS'));
        console.log(chalk.gray('═'.repeat(50)));
        console.log(chalk.yellow(`Rows processed: ${error.rowsProcessed}`));
        console.log(chalk.red(`Errors: ${error.errors.length}`));
        
        error.errors.slice(0, 10).forEach(err => {
          console.log(chalk.red('  • ' + err));
        });
        
        if (error.errors.length > 10) {
          console.log(chalk.gray(`  ... and ${error.errors.length - 10} more errors`));
        }
        
        console.log(chalk.blue('\n💡 Use --ignore-errors to continue despite errors'));
        console.log(chalk.blue('💡 Use --dry-run to preview without processing'));
        
      } else {
        console.error(chalk.red('❌ Error during transformation:'), error.error || error.message);
      }
      process.exit(1);
    }
  });

program.parse();