#!/usr/bin/env node
import program from 'commander';
import { version } from '../../package.json';
import pageLoader from '..';

program
  .version(version)
  .description('Page loader')
  .arguments('<url>')
  .option('-o, --output [folder]', 'output folder', process.cwd())
  .action((url) => {
    pageLoader(url, program.output);
  })
  .parse(process.argv);
