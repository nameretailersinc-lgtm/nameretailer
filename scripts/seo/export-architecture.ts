import { writeFileSync } from 'node:fs';
import { legacyRedirects } from '../../lib/seo/redirect-map';
writeFileSync('redirects.config', JSON.stringify(legacyRedirects.map(r => ({...r, statusCode:301})),null,2)+'\n');
