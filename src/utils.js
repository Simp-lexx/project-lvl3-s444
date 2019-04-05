import url from 'url';
import path from 'path';
import cheerio from 'cheerio';

const tagMap = {
  img: 'src',
  script: 'src',
  link: 'href',
};

export const formatName = (baseUrl, extension) => {
  const { hostname, pathname } = url.parse(baseUrl);
  const baseFileName = url.format({ hostname, pathname });
  const baseFileNameWoSlash = baseFileName[baseFileName.length - 1] === '/' ? baseFileName.slice(0, -1) : baseFileName;
  if (extension) {
    return `${baseFileNameWoSlash.replace(/\W+/g, '-')}${extension}`;
  }
  const newExtension = path.extname(baseFileNameWoSlash);
  const baseFileNameWoExt = baseFileNameWoSlash.split(newExtension)[0];
  return `${baseFileNameWoExt.replace(/\W+/g, '-')}${newExtension}`;
};

export const getFiles = (html) => {
  const $ = cheerio.load(html);
  const links = [];
  Object.keys(tagMap).forEach(tag => $(tag).each((i, elem) => {
    const link = $(elem).attr(tagMap[tag]);
    if (link && !url.parse(link).hostname && link[1] !== '/') {
      links.push(link);
    }
  }));
  return links;
};

export const getDirectLinks = (links, baseUrl) => {
  const { protocol, host, pathname } = url.parse(baseUrl);
  return links.map((link) => {
    if (link[0] === '/') {
      return url.format({ protocol, host, pathname: link });
    }
    return url.format({ protocol, host, pathname: `${pathname}${link}` });
  });
};

export const updateLocalLinks = (html, dirName) => {
  const $ = cheerio.load(html);
  Object.keys(tagMap).forEach(tag => $(tag).map((i, elem) => {
    const link = $(elem).attr(tagMap[tag]);
    if (link && !url.parse(link).hostname && link[1] !== '/') {
      const newLink = `${dirName}/${formatName(link)}`;
      return $(elem).attr(tagMap[tag], newLink);
    }
    return '';
  }));
  return $.html();
};

// export default (link, output = process.cwd()) => {
//   const { hostname, pathname } = url.parse(link);
//   const linkFileName = url.format({ hostname, pathname });
//   const fileName = `${linkFileName.replace(/\W+/g, '-')}.html`;
//   const destPath = path.join(output, fileName);
//   return destPath;
// };
