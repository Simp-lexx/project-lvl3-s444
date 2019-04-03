#!/usr/bin/env node
import program from 'commander';
import { version } from '../../package.json';
import pageLoader from '..';

program
  .version(version)
  .description('Page loader')
  .arguments('<url>')
  .option('-o, --output [path]', 'Destination path', './')
  .action((url, options) => {
    pageLoader(url, options);
  })
  .parse(process.argv);
