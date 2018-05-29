'use strict';
const util = require('hexo-util');
const ogs = require('open-graph-scraper');

const amazonid = hexo.config.amazonjp.amazonid ? hexo.config.amazonjp.amazonid : '';

const descriptionLength = (hexo.config.linkPreview && hexo.config.linkPreview.descriptionLength)
                            ? hexo.config.linkPreview.descriptionLength : 140;
const className = (hexo.config.linkPreview && hexo.config.linkPreview.className)
                    ? hexo.config.linkPreview.className : 'link-preview-amazon';

hexo.extend.tag.register('amazonjp', function(args) {

  const asin = args[0];
  let url = 'https://www.amazon.co.jp/dp/' + asin;
  if(hexo.config.amazonjp.amazonid) {
    url += '?tag=' + hexo.config.amazonjp.amazonid;
  }
  const endpoint = 'http://images-jp.amazon.com/images/P/';
  const country = '09';



  return getTag({url: url, size: args[1], target: args[2], rel: args[4]}, endpoint, asin, country).then(tag => {
    return tag;
  });
}, {async: true});

async function getTag(options, endpoint, asin, country, size) {
  return ogs(options)
    .then(function (result) {
      const ogp = result.data;
      let image = '';
      let descriptions = '';

      const sizeset = {
        thumb: 'THUMBZZZ',
        small: 'TZZZZZZZ',
        medium: 'MZZZZZZZ',
        large: 'LZZZZZZZ'
      };

      const imgsize = sizeset[`${options.size}`];
      const imgUrl = endpoint + asin + '.' + country + '.' + imgsize;

      image += util.htmlTag('img', { src: imgUrl } , '');
      image = util.htmlTag('div', { class: 'og-image'}, image)

      descriptions += util.htmlTag('div', { class: 'og-title' }, ogp.ogTitle);

      if (ogp.hasOwnProperty('ogDescription')) {
        const description = adjustLength(ogp.ogDescription);
        descriptions += util.htmlTag('div', { class: 'og-description' }, description);
      }

      descriptions = util.htmlTag('div', { class: 'descriptions' }, descriptions);

      const tag = util.htmlTag('div', { class: 'link-area' },  image + descriptions);
      return util.htmlTag('a', { href: options.url, class: className, target: options.target, rel: options.rel }, tag);
    })
    .catch(function (error) {
      console.log('error:', error);
      return '';
  });
}

function adjustLength(description) {
  if (description && description.length > descriptionLength) {
    description = description.slice(0, descriptionLength) + '…';
  }
  return description;
}
