import { promises as fsPromises } from 'fs';
import axios from 'axios';
import path from 'path';
import url from 'url';
import debug from 'debug';
import Listr from 'listr';
import _ from 'lodash';
import errorProcessing from './errors';

import {
  formatName, getDirectLinks, makeLocalResources,
} from './utils';

const writeLog = debug('page-loader');

export default (sourceUrl, destPath) => {
  const { protocol, hostname } = url.parse(sourceUrl);
  if (!protocol && !hostname) {
    const message = `Incorrent url ${sourceUrl}`;
    throw new Error(message);
  }

  const destFileName = formatName(sourceUrl, '.html');
  const destDirName = formatName(sourceUrl, '_files');

  const destFullFilePath = path.join(destPath, destFileName);
  const destDirPath = path.join(destPath, destDirName);

  let filesLinks = [];

  return axios.get(sourceUrl)
    .then((response) => {
      const {
        localFileNames,
        localHtmlWithLinks,
      } = makeLocalResources(response.data, destDirName);
      filesLinks = getDirectLinks(_.uniq(localFileNames), sourceUrl);
      writeLog(`Source page: ${sourceUrl}`);
      writeLog(`Destination file path: ${destFullFilePath}`);
      return fsPromises.writeFile(destFullFilePath, localHtmlWithLinks);
    })
    .then(() => fsPromises.mkdir(destDirPath))
    .then(writeLog(`Dir is created ${destDirPath}`))
    .then(() => {
      const tasks = new Listr(filesLinks.map(link => ({
        title: `Downloading file ${link}`,
        task: () => axios.get(link, { responseType: 'arraybuffer' })
          .then((response) => {
            const { pathname } = url.parse(link);
            const currentPathName = formatName(pathname.substring(1));
            const localFullPath = path.join(destDirPath, currentPathName);
            writeLog(`Write downloaded data to: ${localFullPath}`);
            return fsPromises.writeFile(localFullPath, response.data);
          }),
      })), { concurrent: true });
      return tasks.run();
    })
    .then(() => console.log(`Successfully downloaded page ${sourceUrl} to ${destDirPath}`))
    .catch(error => Promise.reject(errorProcessing(error)));
};
