import { IdGenerator } from '../../lib/id';
import { expect, test} from '@jest/globals';

test("getNextId", async () => {
    expect(new IdGenerator().getNextId({})).toEqual(1);
    expect(new IdGenerator().getNextId({'1': '/'})).toEqual(2);
});
