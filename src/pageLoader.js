import { promises as fsPromises } from 'fs';
import axios from 'axios';

import buildDestPath from './utils';

export default (link, options) => {
  const destinationPath = buildDestPath(link, options);
  
  return axios
      .get(link)
      .then(({ data }) => fsPromises.writeFile(destinationPath, data))
      .then(e => !e);
};
