#!/usr/bin/env node
import program from 'commander';
import { version } from '../../package.json';
import pageLoader from '..';

program
  .version(version)
  .description('Page loader')
  .arguments('<url>')
  .option('-o, --output [folder]', 'output folder', './')
  .action((url) => {
    pageLoader(url, program.options);
  })
  .parse(process.argv);
