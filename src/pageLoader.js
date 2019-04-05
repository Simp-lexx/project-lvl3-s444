import { promises as fsPromises } from 'fs';
import axios from 'axios';
import path from 'path';
import url from 'url';
import debug from 'debug';
import { formatName, getFiles, getDirectLinks, updateLocalLinks } from './utils';


// export default (link, output) => {
//   const destinationPath = buildDestPath(link, output);
//   return axios.get(link).then(({ data }) => {
//     fsPromises.writeFile(destinationPath, data).then(e => !e)
//       .then(() => console.log(`${link} succesfully loaded`))
//       .catch(err => (`${link} failed to load ${err}`));
//   });
// };

const logger = debug('page-loader');

export default (sourceUrl, destPath) => {
  const htmlFileName = formatName(sourceUrl, '.html');
  const baseFilePath = path.join(destPath, htmlFileName);

  const dirName = formatName(sourceUrl, '_files');
  const dirPath = path.join(baseFilePath, dirName);

  let filesLinks = [];

  return axios.get(sourceUrl)
    .then((response) => {
      const files = getFiles(response.data);
      filesLinks = getDirectLinks(files, sourceUrl);
      const htmlLocalLinks = updateLocalLinks(response.data, dirName);
      logger(`Source page: ${sourceUrl}`);
      logger(`Destination file path: ${baseFilePath}`);
      return fsPromises.writeFile(baseFilePath, htmlLocalLinks);
    })
    .then(() => fsPromises.mkdir(dirPath))
    .then(() => Promise.all(filesLinks.map(link => axios
      .get(link, { responseType: 'arraybuffer' })
      .then((response) => {
        const { pathname } = url.parse(link);
        const currentPathName = formatName(pathname.substring(1));
        const localFullPath = `${dirPath}/${currentPathName}`;
        logger(`Write downloaded data to: ${localFullPath}`);
        return fsPromises.writeFile(localFullPath, response.data);
      }))))
    .then(() => logger(`${sourceUrl} succesfully loaded`))
    .catch((error) => {
      logger(`Error ${error.message} occured.`);
      return Promise.reject(error);
    });
};