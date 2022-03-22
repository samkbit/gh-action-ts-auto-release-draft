import { run } from '../src/main';
import * as core from '@actions/core';

jest.mock('@actions/core');

describe('When running the action', () => {
  const fakesetOutput = core.setOutput as jest.MockedFunction<typeof core.setOutput>;
  test('it should set the release-url output parameter', async() => {
    await run();
    expect(fakesetOutput).toHaveBeenCalledWith("release-url", expect.anything());
  })
});
