import errors from 'errno';

export default (err) => {
  switch (true) {
    case err.code === errors.code.ENOENT.code:
      return `${errors.code.ENOENT.description} ${err.path}`;
    case err.code === errors.code.ECONNRESET.code:
      return `${errors.code.ECONNRESET.description} ${err.host}`;
    case !!err.response:
      return `${err.response.status} ${err.response.statusText} ${err.response.config.url}`;
    default:
      return err.message;
  }
};
