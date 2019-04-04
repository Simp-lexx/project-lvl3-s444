import url from 'url';
import path from 'path';

export default (link, output = process.cwd()) => {
  const { hostname, pathname } = url.parse(link);
  const linkFileName = url.format({ hostname, pathname });
  const fileName = `${linkFileName.replace(/\W+/g, '-')}.html`;
  const destPath = path.join(output, fileName);
  return destPath;
};
