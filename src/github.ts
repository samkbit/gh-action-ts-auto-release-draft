/* eslint-disable prettier/prettier */
import * as core from "@actions/core"
import * as github from "@actions/github"
import * as markdown from "./markdown"
import * as version from "./version"

export async function createReleaseDraft(
    versionTag: string,
    repoToken: string,
    changeLog: string|null
  ): Promise<string> {
    const octokit = github.getOctokit(repoToken)
    const response = await octokit.rest.repos.createRelease({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        tag_name: versionTag, 
        name: version.removePrefix(versionTag),
        body: changeLog ? markdown.toUnorderedList(changeLog) : "",
        prerelease: version.isPrerelease(versionTag),
        draft: true
      })
    
      if (response.status !== 201) {
        throw new Error(`Failed to create release draft: ${response.status}`)
      }
    
      core.info(`Created release draft ${response.data.name}`)
    
      return response.data.html_url
  }