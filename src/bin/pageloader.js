#!/usr/bin/env node
import program from 'commander';
import { version } from '../../package.json';
import loadPage from '..';

program
  .version(version)
  .description('Page loader')
  .arguments('<url>')
  .option('-o, --output [folder]', 'output folder', process.cwd())
  .action((url) => {
    loadPage(url, program.output);
  })
  .parse(process.argv);
