#!/usr/bin/env node
import program from 'commander';
import process from 'process';
import { version } from '../../package.json';
import loadPage from '..';

import errorsProcessing from '../errors';

program
  .version(version)
  .description('Page loader')
  .arguments('<url>')
  .option('-o, --output [folder]', 'output folder', process.cwd())
  .action((url) => {
    loadPage(url, program.output)
      .then(() => {
        console.log(`Succesfully loaded ${url}`);
      })
      .catch((e) => {
        process.exitCode = 1;
        console.error(`Failed to load ${url}`);
        const message = errorsProcessing(e);
        console.error(message);
      });
  })
  .parse(process.argv);
