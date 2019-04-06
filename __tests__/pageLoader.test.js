import os from 'os';
import path from 'path';
import url from 'url';
import { promises as fsPromises } from 'fs';
import nock from 'nock';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import pageLoader from '../src';

axios.defaults.adapter = httpAdapter;

test('Test download page to local folder', async () => {
  const host = 'https://hexlet.io';
  const pathname = '/courses';
  const expected = '<html><head></head><body></body></html>';

  const sourceFilePath = url.format({ host, pathname });
  const tmpDirName = path.resolve(os.tmpdir(), 'page-loader-');
  const tmpDir = await fsPromises.mkdtemp(tmpDirName);

  nock(host).get(pathname).reply(200, expected);

  await pageLoader(sourceFilePath, tmpDir);
  const destFileName = await fsPromises.readdir(tmpDir);
  const destFilePath = path.join(tmpDir, destFileName[0]);
  const received = await fsPromises.readFile(destFilePath, 'utf8');

  expect(received).toBe(expected);
});

test('Test download page with links', async () => {
  const host = 'https://hexlet.io';
  const pathname = '/';
  const imgPath = '/test/image.jpg';
  const scriptPath = '/test/script.js';
  const linkPath = '/test/style.css';
  const filesBody = 'body';
  const testBody = '<html><head></head><body><img src="test/image.jpg"><script src="test/script.js"></script><link href="test/style.css"></body></html>';
  const expectedBody = '<html><head></head><body><img src="hexlet-io_files/test-image.jpg"><script src="hexlet-io_files/test-script.js"></script><link href="hexlet-io_files/test-style.css"></body></html>';

  const sourceFilePath = url.format({ host, pathname });
  const tmpDirName = path.resolve(os.tmpdir(), 'page-loader-');
  const tmpDir = await fsPromises.mkdtemp(tmpDirName);

  nock(host)
    .get(pathname)
    .reply(200, testBody)
    .get(imgPath)
    .reply(200, filesBody)
    .get(scriptPath)
    .reply(200, filesBody)
    .get(linkPath)
    .reply(200, filesBody);

  await pageLoader(sourceFilePath, tmpDir);
  const destFileName = await fsPromises.readdir(tmpDir);
  const destFilePath = path.join(tmpDir, destFileName[0]);
  const received = await fsPromises.readFile(destFilePath, 'utf8');

  expect(received).toBe(expectedBody);
});

describe('Error tests', () => {
  const host = 'http://test.com';
  test('wrong output', async () => {
    const testPath = '/';
    const link = host.concat(testPath);
    const output = 'folder/folder';
    try {
      await pageLoader(link, output);
    } catch (e) {
      expect(e).toThrowErrorMatchingSnapshot();
    }
  });
  test('incorrect url', async () => {
    const tempDir = await fsPromises.mkdtemp(
      path.resolve(os.tmpdir(), 'page-loader-'),
    );
    const link = 'incorrect url';
    const output = tempDir;
    try {
      await pageLoader(link, output);
    } catch (e) {
      expect(e).toThrowErrorMatchingSnapshot();
    }
  });
  test('can\'t load resource', async () => {
    const document = '<!DOCTYPE html><html><head><link href="/folder/file.css"></head><body></body></html>';
    const tempDir = await fsPromises.mkdtemp(
      path.resolve(os.tmpdir(), 'page-loader-'),
    );
    const testPath = '/';
    const link = host.concat(testPath);
    const output = tempDir;

    nock(host)
      .get(testPath)
      .reply(200, document);

    try {
      await pageLoader(link, output);
    } catch (e) {
      expect(e).toThrowErrorMatchingSnapshot();
    }
  });
});
