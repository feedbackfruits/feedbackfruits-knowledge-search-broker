import test from 'ava';
import nock from 'nock';
import * as Resource from '../../../lib/indices/resources/resource';
import * as Config from '../../../lib/config';
import * as qs from 'qs';

import TraversalResult from '../../support/traverse';
import about from '../../support/about';

const doc = {
  "@id": "https://ocw.mit.edu/courses/chemistry/5-07sc-biological-chemistry-i-fall-2013/module-ii/session-8/MIT5_07SCF13_Lec13.pdf"
};

nock(Config.KNOWLEDGE_ADDRESS)
  .get(`/traverse?${qs.stringify({ resources: [ doc["@id"] ]}, { arrayFormat: 'brackets' })}`)
  .reply(200, TraversalResult);

test('it works', async t => {
  const res = await Resource.getFeatures(doc);
  t.deepEqual(res, {
    about: about
  });
});