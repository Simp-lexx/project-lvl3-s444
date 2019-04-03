import os from 'os';
import path from 'path';
import { promises as fsPromises } from 'fs';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import pageLoader from '../pageLoader';

const host = 'http://localhost';

axios.defaults.adapter = httpAdapter;

describe('page loader tests', () => {
  test('test load data in tmp folder', async () => {
    const expected = 'test data';
    const testPath = '/test';
    const tDirName = path.resolve(os.tmpdir(), 'page-loader-');
    console.log(tDirName);
    const tmpDir = await fsPromises.mkdtemp(tDirName);
    console.log(tmpDir);
    const options = {
      output: tmpDir,
    };
    const link = host.concat(testPath);
    const fileName = 'page-loader_test.html';
    const destinationPath = path.join(link, fileName);

    nock(host)
      .get(testPath)
      .reply(200, expected);

    await pageLoader(link, options);
    const received = await fsPromises.readFile(destinationPath, { encoding: 'utf-8' });

    expect(received).toBe(expected);
  });
});
