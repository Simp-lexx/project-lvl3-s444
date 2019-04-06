#!/usr/bin/env node
import program from 'commander';
import process from 'process';
import { version } from '../../package.json';
import pageLoader from '..';

import errors from '../errors';

program
  .version(version)
  .description('Page loader')
  .arguments('<url>')
  .option('-o, --output [folder]', 'output folder', process.cwd())
  .action((url) => {
    pageLoader(url, program.output)
      .then(() => {
        process.exitCode = 0;
        console.log(`Succesfully loaded ${url}`);
      })
      .catch((e) => {
        process.exitCode = 1;
        console.error(`Failed to load ${url}`);
        const message = errors(e);
        console.error(message);
      });
  })
  .parse(process.argv);
