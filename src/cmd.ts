/* eslint-disable prettier/prettier */
import * as cmd from "@actions/exec"
import * as core from "@actions/core"

export async function getChangeLogAssociatedWithTag(tag: string): Promise<string|null> {
    const previousVersionTag = await getPreviousVersionTag(tag)
    core.debug(`previousVersionTag:${previousVersionTag}`) 
    return await getCommitMessagesBetween(previousVersionTag, tag)
}

// Invoke git-describe
async function getPreviousVersionTag(tag: string): Promise<string|null> {
    let previousVersionTag = ""

    const options: cmd.ExecOptions = {
        listeners: {
            stdout: (data: Buffer) => {
                previousVersionTag += data.toString()
            }
        },
        silent: true,
        ignoreReturnCode: true
    }

    const exitCode: number = await cmd.exec(
        "git",
        [
            "describe",         // Looks for tag
            "--match",          // Considers only tags that match a pattern
            "v[0-9]*",          // Matches only version tags
            "--abbrev=0",       // Prints only the tag name
            "first-parent",     // Searches only the current branch
            `${tag}^`           // Starts looking from the parent of the specified tag
        ], 
        options
    )

    core.debug(`exitCode from git describe call:${exitCode}`) 
    core.debug(`Previous version tag is "${previousVersionTag}"`)  

    return exitCode === 0
        ? previousVersionTag.trim()
        : null
}

// Invoke git-log
async function getCommitMessagesBetween(previousVersionTag: string|null, tag: string): Promise<string|null> {
    let commitMessages = ""

    const options: cmd.ExecOptions = {
        listeners: {
            stdout: (data: Buffer) => {
                commitMessages += data.toString()
            }
        },
        silent: true
    }

    const exitCode: number = await cmd.exec(
        "git",
        [
            "log",                                  // Prints the commit history
            "--format=%s",                          // Prints only the first line of the commit message (summary)
            previousVersionTag !== null
                ? `${previousVersionTag}..${tag}`   // Includes the commits reachable from 'secondTag' but not 'firstTag'
                : tag                               // Includes the commits reachable from the specified tag
        ], 
        options
    )

    core.debug(`exitCode from git log call:${exitCode}`) 
    core.debug(`commitMessages:${commitMessages.trim()}`)   

    previousVersionTag !== null
        ? core.debug(`Commit messages between version tags "${previousVersionTag}" and "${tag}":\n${commitMessages}`)
        : core.debug(`Commit messages from version tag "${tag}":\n${commitMessages}`)  

    return exitCode === 0
        ? commitMessages.trim()
        : null

}

