#!/usr/bin/env node
import program from 'commander';
import { version } from '../../package.json';
import pageLoader from '..';

program
  .version(version)
  .arguments('<url>')
  .description('Compares two configuration files and shows a difference.')
  .option('-f, --format [type]', 'Output format', /^(diff|plain|json)$/i, 'diff')
  .action((firstConfig, secondConfig) => {
    console.log(genDiff(firstConfig, secondConfig, program.format));
  })
  .parse(process.argv);
