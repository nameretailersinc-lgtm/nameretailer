import {expect,it} from 'vitest';
import {directories} from '@/lib/site/directories';
it('gives each registered directory a distinct answer and useful visible questions',()=>{expect(new Set(directories.map(d=>d.lead)).size).toBe(directories.length);for(const directory of directories){const words=directory.lead.split(/\s+/).length;expect(words).toBeGreaterThanOrEqual(40);expect(words).toBeLessThanOrEqual(60);expect(directory.faq.length).toBeGreaterThanOrEqual(3);expect(directory.faq.length).toBeLessThanOrEqual(5);}});
