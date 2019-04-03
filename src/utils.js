import url from 'url';
import path from 'path';

export default (link, output) => {
  const { hostname, pathname } = url.parse(link);
  const fileName = hostname
    .concat(pathname)
    .replace(/\W+/g, '-')
    .concat('.html');
  const destPath = path.join(output, fileName);
  return destPath;
};
