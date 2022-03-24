/* eslint-disable prettier/prettier */
import * as core from "@actions/core"
import { createReleaseDraft } from "./github"
import { getChangeLogAssociatedWithTag } from "./cmd"
import { getCreatedTag } from "./event"
import { isSemVer } from "./version"

export async function run(): Promise<void> {
  try {
    const tag = getCreatedTag()
    const token = core.getInput('repo-token')
    let releaseUrl = ""
    if (tag && isSemVer(tag)) {
      const changeLog = await getChangeLogAssociatedWithTag(tag)
      if (changeLog) {
        releaseUrl = await createReleaseDraft(tag, token, changeLog)
      } else {
        throw new Error(`change log associated with tag "${tag}" cannot be null`)
      }
      core.setOutput("release-url", releaseUrl)
    }
    
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
